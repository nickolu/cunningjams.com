'use client';

import { useState, useEffect, useRef } from 'react';
import { PhotoCard } from '@/components/PhotoCard';
import { PhotoViewer } from '@/components/PhotoViewer';
import { LoadingGallery } from '@/components/LoadingGallery';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { DownloadButton } from '@/components/DownloadButton';
import { SortControls } from '@/components/SortControls';
import { DraggablePhotoCard } from '@/components/DraggablePhotoCard';
import { DeleteConfirmationModal } from '@/components/DeleteConfirmationModal';
import { CloudinaryImage } from '@/lib/cloudinary-client';
import { SortOption } from '@/lib/cloudinary';
import { getAlbumConfig } from '@/lib/album-config';
import { AlbumConfig } from '@/types/album';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface PhotoGalleryProps {
  albumSlug?: string;
}

export function PhotoGallery({ albumSlug }: PhotoGalleryProps = {}) {
  const [photos, setPhotos] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [albumConfig, setAlbumConfig] = useState<AlbumConfig | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<CloudinaryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [sortBy, setSortBy] = useState<SortOption>('custom');
  const [thumbnailSize, setThumbnailSize] = useState(4); // Default 4 per row
  const [isAdmin, setIsAdmin] = useState(false);
  // Reorder/save state
  const [isReordering, setIsReordering] = useState(false); // kept for legacy destructive ops
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const saveAbortController = useRef<AbortController | null>(null);
  const saveTimeoutId = useRef<number | undefined>(undefined);
  const lastUpdatesRef = useRef<{ currentPublicId: string; newSortKey: string }[] | null>(null);
  const [isSettingCustom, setIsSettingCustom] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number>(-1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Combined loading state for blocking operations (do not block on background saves)
  const isProcessingOrder = isSettingCustom || isDeleting;

  // Helpers for sort keys (lexicographic numeric strings)
  const SORT_KEY_WIDTH = 9;
  const MIN_KEY = 0;
  const MAX_KEY = Math.pow(10, SORT_KEY_WIDTH) - 1;
  const formatKey = (n: number) => String(Math.max(MIN_KEY, Math.min(MAX_KEY, Math.floor(n)))).padStart(SORT_KEY_WIDTH, '0');
  const parseKey = (s?: string | null) => {
    if (!s) return undefined;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : undefined;
  };

  // Compute minimal contiguous region that changed between two arrays
  const computeChangedRegion = (oldArr: CloudinaryImage[], newArr: CloudinaryImage[]) => {
    const len = Math.min(oldArr.length, newArr.length);
    let start = 0;
    while (start < len && oldArr[start]?.public_id === newArr[start]?.public_id) start++;
    if (start === len) return null;
    let end = len - 1;
    while (end >= start && oldArr[end]?.public_id === newArr[end]?.public_id) end--;
    return { start, end };
  };

  // Given a region [start,end] in newPhotos, generate evenly spaced keys between neighbors
  const computeRegionUpdates = (newPhotosArray: CloudinaryImage[], start: number, end: number) => {
    const leftNeighbor = start - 1 >= 0 ? newPhotosArray[start - 1] : undefined;
    const rightNeighbor = end + 1 < newPhotosArray.length ? newPhotosArray[end + 1] : undefined;

    const leftKey = parseKey(leftNeighbor?.sort_order) ?? MIN_KEY;
    const rightKey = parseKey(rightNeighbor?.sort_order) ?? MAX_KEY;

    const regionSize = end - start + 1;
    const interval = (rightKey - leftKey) / (regionSize + 1);

    // If interval is too small or invalid, fall back to rebalancing entire list
    if (!Number.isFinite(interval) || interval < 1) {
      const step = Math.floor(MAX_KEY / (newPhotosArray.length + 1));
      const updates = newPhotosArray.map((p, idx) => ({
        currentPublicId: p.public_id,
        newSortKey: formatKey((idx + 1) * step),
      }));
      return { updates, rebalanced: true } as const;
    }

    const updates = [] as { currentPublicId: string; newSortKey: string }[];
    for (let i = 0; i < regionSize; i++) {
      const keyNum = leftKey + (i + 1) * interval;
      const newKey = formatKey(keyNum);
      const photo = newPhotosArray[start + i];
      if (photo.sort_order !== newKey) {
        updates.push({ currentPublicId: photo.public_id, newSortKey: newKey });
      }
    }
    return { updates, rebalanced: false } as const;
  };

  // Schedule a debounced save of last computed updates
  const scheduleSave = (updates: { currentPublicId: string; newSortKey: string }[], newPhotosArray: CloudinaryImage[]) => {
    setUnsavedChanges(true);
    lastUpdatesRef.current = updates;

    // Optimistically update local sort_order values so subsequent computations have latest keys
    if (updates.length > 0) {
      setPhotos(prev => prev.map(p => {
        const u = updates.find(x => x.currentPublicId === p.public_id);
        return u ? { ...p, sort_order: u.newSortKey } : p;
      }));
    }

    // Cancel any in-flight request
    if (saveAbortController.current) {
      saveAbortController.current.abort();
      saveAbortController.current = null;
    }

    // Clear timer
    if (saveTimeoutId.current) {
      window.clearTimeout(saveTimeoutId.current);
      saveTimeoutId.current = undefined;
    }

    // Debounce
    saveTimeoutId.current = window.setTimeout(async () => {
      const payload = lastUpdatesRef.current;
      if (!payload || payload.length === 0) {
        setUnsavedChanges(false);
        return;
      }
      setIsSavingOrder(true);
      const controller = new AbortController();
      saveAbortController.current = controller;
      try {
        const url = albumSlug ? `/api/album/reorder?albumSlug=${encodeURIComponent(albumSlug)}` : '/api/album/reorder';
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: payload.map(u => ({ currentPublicId: u.currentPublicId, newSortKey: u.newSortKey })) }),
          signal: controller.signal,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.details || errorData.error || 'Failed to save order';
          throw new Error(errorMessage);
        }

        const result = await response.json();
        setUnsavedChanges(false);

        // Show success message with timing info
        if (result.metadata?.totalTime) {
          const timeInSeconds = (result.metadata.totalTime / 1000).toFixed(1);
          toast.success(`Changes saved successfully (${timeInSeconds}s)`);
        } else {
          toast.success('Changes saved successfully');
        }
      } catch (err) {
        if ((err as any)?.name === 'AbortError') {
          // Swallow aborts
        } else {
          console.error('Error saving order:', err);
          toast.error('Failed to save changes');
        }
      } finally {
        if (saveAbortController.current === controller) {
          saveAbortController.current = null;
        }
        setIsSavingOrder(false);
      }
    }, 700);
  };

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchPhotos = async (sort: SortOption = sortBy) => {
    try {
      setLoading(true);
      const url = albumSlug
        ? `/api/album/photos?sort=${sort}&albumSlug=${encodeURIComponent(albumSlug)}`
        : `/api/album/photos?sort=${sort}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      
      const data = await response.json();
      setPhotos(data.photos || []);
      
      // Check if user is admin
      checkAdminStatus();
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin || false);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Fetch album configuration
  useEffect(() => {
    if (albumSlug) {
      const config = getAlbumConfig(albumSlug);
      setAlbumConfig(config);
    } else {
      // Fallback for legacy usage (no album slug)
      setAlbumConfig({
      title: "Steve's 40th Birthday",
        subtitle: "Colorado Trip 2025",
        cloudinaryFolder: "2025-steves-40th",
        password: "pumphouse",
        adminPassword: "admin2025"
      });
    }
  }, [albumSlug]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    fetchPhotos(newSort);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    // Prevent drag operations during blocking processing
    if (isProcessingOrder) {
      return;
    }

    if (active.id !== over?.id && isAdmin && sortBy === 'custom') {
      const draggedPhotoId = active.id as string;
      const overPhotoId = over?.id as string;
      
      // Get the photos to move (either just the dragged photo or all selected photos if it's in the selection)
      const photosToMove = selectedPhotoIds.has(draggedPhotoId) && selectedPhotoIds.size > 0
        ? Array.from(selectedPhotoIds)
        : [draggedPhotoId];
      
      console.log('🔄 Drag operation:', {
        draggedPhotoId,
        overPhotoId,
        selectedCount: selectedPhotoIds.size,
        photosToMoveCount: photosToMove.length,
        isGroupDrag: photosToMove.length > 1
      });
      
      const oldIndex = photos.findIndex(photo => photo.public_id === draggedPhotoId);
      const newIndex = photos.findIndex(photo => photo.public_id === overPhotoId);

      let newPhotos = [...photos];

      if (photosToMove.length === 1) {
        // Single photo drag
        newPhotos = arrayMove(photos, oldIndex, newIndex);
      } else {
        // Group drag - move all selected photos as a group
        const selectedPhotos = photos.filter(photo => selectedPhotoIds.has(photo.public_id));
        const unselectedPhotos = photos.filter(photo => !selectedPhotoIds.has(photo.public_id));
        
        // Find the target position in terms of unselected photos
        const targetPhoto = photos[newIndex];
        
        console.log('📦 Group drag details:', {
          selectedPhotoIds: Array.from(selectedPhotoIds),
          selectedPhotos: selectedPhotos.map(p => p.public_id),
          unselectedPhotos: unselectedPhotos.map(p => p.public_id),
          targetPhoto: targetPhoto.public_id,
          targetIsSelected: selectedPhotoIds.has(targetPhoto.public_id)
        });
        
        if (selectedPhotoIds.has(targetPhoto.public_id)) {
          // If dropping on a selected photo, don't move (or handle as needed)
          console.log('🚫 Dropping on selected photo - keeping current order');
          newPhotos = photos; // Keep current order
        } else {
          // Find where to insert among unselected photos
          const targetIndexInUnselected = unselectedPhotos.findIndex(photo => photo.public_id === targetPhoto.public_id);
          
          // Determine if we're dragging forward or backward to decide insertion point
          const draggedIndexInUnselected = unselectedPhotos.findIndex(photo => 
            selectedPhotos.some(selected => selected.public_id === photo.public_id)
          );
          
          // If we can't find the dragged photo in unselected (which is expected), 
          // use the original position to determine direction
          const originalDraggedIndex = photos.findIndex(photo => photo.public_id === draggedPhotoId);
          const insertAfter = originalDraggedIndex < newIndex;
          
          const insertionIndex = insertAfter ? targetIndexInUnselected + 1 : targetIndexInUnselected;
          
          console.log('✅ Inserting group:', {
            targetIndexInUnselected,
            originalDraggedIndex,
            newIndex,
            insertAfter,
            insertionIndex
          });
          
          // Insert the selected group at the calculated position
          newPhotos = [
            ...unselectedPhotos.slice(0, insertionIndex),
            ...selectedPhotos,
            ...unselectedPhotos.slice(insertionIndex)
          ];
          
          console.log('📋 New photo order:', newPhotos.map(p => p.public_id));
        }
      }

      // Optimistically update UI
      const prevPhotos = photos;
      setPhotos(newPhotos);

      // Compute minimal changed region and schedule a debounced background save
      const region = computeChangedRegion(prevPhotos, newPhotos);
      if (region) {
        const { start, end } = region;
        const { updates, rebalanced } = computeRegionUpdates(newPhotos, start, end);
        scheduleSave(updates, newPhotos);
        const photoCount = photosToMove.length;
        toast.success(`${photoCount} photo${photoCount !== 1 ? 's' : ''} reordered` + (rebalanced ? ' (rebalanced)' : ''));
      }
    }
  };

  const handlePhotoClick = (photo: CloudinaryImage, index: number, event?: React.MouseEvent) => {
    // Prevent photo interactions during processing
    if (isProcessingOrder) {
      return;
    }

    if (isMultiSelectMode) {
      if (event?.shiftKey && lastClickedIndex !== -1) {
        // Shift+click: select range from last clicked to current
        selectPhotoRange(lastClickedIndex, index);
      } else {
        // Regular click in multi-select mode: toggle selection
        togglePhotoSelection(photo.public_id);
      }
      setLastClickedIndex(index);
    } else {
      setSelectedPhoto(photo);
      setSelectedIndex(index);
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const selectPhotoRange = (startIndex: number, endIndex: number) => {
    const minIndex = Math.min(startIndex, endIndex);
    const maxIndex = Math.max(startIndex, endIndex);
    
    setSelectedPhotoIds(prev => {
      const newSet = new Set(prev);
      for (let i = minIndex; i <= maxIndex; i++) {
        if (i >= 0 && i < photos.length) {
          newSet.add(photos[i].public_id);
        }
      }
      return newSet;
    });
  };

  const selectAllPhotos = () => {
    setSelectedPhotoIds(new Set(photos.map(photo => photo.public_id)));
  };

  const clearSelection = () => {
    setSelectedPhotoIds(new Set());
    setLastClickedIndex(-1);
  };

  const toggleMultiSelectMode = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    if (isMultiSelectMode) {
      clearSelection();
    } else {
      setLastClickedIndex(-1);
    }
  };

  const handleCloseViewer = () => {
    setSelectedPhoto(null);
    setSelectedIndex(-1);
  };

  const handlePrevious = () => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedPhoto(photos[newIndex]);
      setSelectedIndex(newIndex);
    }
  };

  const handleNext = () => {
    if (selectedIndex < photos.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedPhoto(photos[newIndex]);
      setSelectedIndex(newIndex);
    }
  };

  const handleSetAsCustom = async () => {
    setIsSettingCustom(true);
    try {
      const photoIds = photos.map(photo => photo.public_id);
      const url = albumSlug ? `/api/album/set-custom?albumSlug=${encodeURIComponent(albumSlug)}` : '/api/album/set-custom';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to set custom order');
      }

      const result = await response.json();

      // Get sort label for toast message
      const sortLabels: Record<SortOption, string> = {
        custom: 'Custom Order',
        'upload-newest': 'Upload Date (Newest)',
        'upload-oldest': 'Upload Date (Oldest)',
        'name-asc': 'Name A-Z',
        'name-desc': 'Name Z-A',
        'created-newest': 'Created Date (Newest)',
        'created-oldest': 'Created Date (Oldest)',
      };

      // Show success message with timing info
      if (result.metadata?.totalTime) {
        const timeInSeconds = (result.metadata.totalTime / 1000).toFixed(1);
        toast.success(`Current "${sortLabels[sortBy]}" order saved as custom order (${timeInSeconds}s)`);
      } else {
        toast.success(`Current "${sortLabels[sortBy]}" order saved as custom order`);
      }

      // Switch to custom sort to show the new order
      setSortBy('custom');
      fetchPhotos('custom');
    } catch (error) {
      console.error('Error setting custom order:', error);
      toast.error('Failed to set custom order');
    } finally {
      setIsSettingCustom(false);
    }
  };

  const handleDeleteSelected = (event: React.MouseEvent) => {
    if (selectedPhotoIds.size === 0) return;
    
    // Check if shift key is pressed to bypass confirmation
    if (event.shiftKey) {
      confirmDelete();
    } else {
      setIsDeleteModalOpen(true);
    }
  };

  const handleReverseOrder = async () => {
    if (selectedPhotoIds.size < 2 || sortBy !== 'custom') return;

    try {
      // Non-blocking background save
      // Get selected photos in current order
      const selectedPhotos = photos.filter(photo => selectedPhotoIds.has(photo.public_id));
      
      // Create a map of current positions for selected photos
      const selectedPositions = new Map<string, number>();
      selectedPhotos.forEach(photo => {
        const currentIndex = photos.findIndex(p => p.public_id === photo.public_id);
        selectedPositions.set(photo.public_id, currentIndex);
      });
      
      // Get the positions in sorted order (original positions)
      const sortedPositions = Array.from(selectedPositions.values()).sort((a, b) => a - b);
      
      // Reverse the selected photos array
      const reversedPhotos = [...selectedPhotos].reverse();
      
      // Create new photo array with reversed selection
      const newPhotos = [...photos];
      reversedPhotos.forEach((photo, index) => {
        const targetIndex = sortedPositions[index];
        newPhotos[targetIndex] = photo;
      });
      
      // Update the UI optimistically and schedule background save for changed region
      const prevPhotos = photos;
      setPhotos(newPhotos);
      const region = computeChangedRegion(prevPhotos, newPhotos);
      if (region) {
        const { start, end } = region;
        const { updates } = computeRegionUpdates(newPhotos, start, end);
        scheduleSave(updates, newPhotos);
      }
      toast.success(`Reversed order of ${selectedPhotoIds.size} selected photos`);
      
      // Clear selection after successful reverse
      clearSelection();
      
    } catch (error) {
      console.error('Error reversing photo order:', error);
      toast.error('Failed to reverse photo order');
      // Revert changes on error
      fetchPhotos();
    } finally {
    }
  };

  const confirmDelete = async () => {
    if (selectedPhotoIds.size === 0) return;

    setIsDeleting(true);
    try {
      const photoIds = Array.from(selectedPhotoIds);
      const url = albumSlug ? `/api/album/delete?albumSlug=${encodeURIComponent(albumSlug)}` : '/api/album/delete';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete photos');
      }

      const result = await response.json();
      
      if (result.failed > 0) {
        toast.error(result.message);
      } else {
        toast.success(result.message);
      }

      // Refresh the gallery and clear selection
      clearSelection();
      setIsMultiSelectMode(false);
      fetchPhotos();
      
    } catch (error) {
      console.error('Error deleting photos:', error);
      toast.error('Failed to delete photos');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const closeDeleteModal = () => {
    if (!isDeleting) {
      setIsDeleteModalOpen(false);
    }
  };

  // Calculate grid classes based on thumbnail size - direct mapping without minimum constraints
  const getGridClasses = () => {
    const gridClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12',
    };
    return gridClasses[thumbnailSize as keyof typeof gridClasses] || gridClasses[4];
  };

  if (loading) {
    return (
      <div>
        <Header photos={[]} albumSlug={albumSlug} onRefreshGallery={fetchPhotos} />
        <div className="container mx-auto px-4 py-8">
          <LoadingGallery />
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div>
        <Header photos={[]} albumSlug={albumSlug} onRefreshGallery={fetchPhotos} />
        <div className="container mx-auto px-4 py-8">
          <EmptyState albumConfig={albumConfig} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        photos={photos}
        albumSlug={albumSlug}
        onRefreshGallery={fetchPhotos}
        inlineContent={
          <SortControls
            sortBy={sortBy}
            onSortChange={handleSortChange}
            thumbnailSize={thumbnailSize}
            onThumbnailSizeChange={setThumbnailSize}
            isAdmin={isAdmin}
            onSetAsCustom={handleSetAsCustom}
            isMultiSelectMode={isMultiSelectMode}
            onToggleMultiSelect={toggleMultiSelectMode}
            selectedCount={selectedPhotoIds.size}
            onSelectAll={selectAllPhotos}
            onClearSelection={clearSelection}
            onDeleteSelected={handleDeleteSelected}
            onReverseOrder={handleReverseOrder}
            isProcessingOrder={isProcessingOrder}
            isSavingOrder={isSavingOrder}
            unsavedChanges={unsavedChanges}
            variant="compact"
            showMultiSelectBar={false}
          />
        }
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {albumConfig?.title || "Photo Album"}
          </h1>
          <p className="text-xl text-muted-foreground mb-1">
            {albumConfig?.subtitle || "Shared Photos"}
          </p>
          <p className="text-sm text-muted-foreground">
            {photos.length} item{photos.length !== 1 ? 's' : ''} shared
          </p>
        </div>

        {/* Multi-Select Controls below header to reduce header height */}
        <SortControls
          sortBy={sortBy}
          onSortChange={handleSortChange}
          thumbnailSize={thumbnailSize}
          onThumbnailSizeChange={setThumbnailSize}
          isAdmin={isAdmin}
          onSetAsCustom={handleSetAsCustom}
          isMultiSelectMode={isMultiSelectMode}
          onToggleMultiSelect={toggleMultiSelectMode}
          selectedCount={selectedPhotoIds.size}
          onSelectAll={selectAllPhotos}
          onClearSelection={clearSelection}
          onDeleteSelected={handleDeleteSelected}
          onReverseOrder={handleReverseOrder}
          isProcessingOrder={isProcessingOrder}
          isSavingOrder={isSavingOrder}
          unsavedChanges={unsavedChanges}
          showMainControls={false}
          showMultiSelectBar={true}
        />

        {/* Photo Grid */}
        <div className="relative">
          {/* Loading Overlay */}
          {isProcessingOrder && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 p-6 bg-background/90 rounded-lg shadow-lg border">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-sm font-medium text-muted-foreground">
                  {isReordering && 'Reordering photos...'}
                  {isSettingCustom && 'Setting custom order...'}
                  {isDeleting && 'Deleting photos...'}
                </p>
              </div>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={photos.map(p => p.public_id)}
              strategy={rectSortingStrategy}
            >
              <div className={`grid ${getGridClasses()} gap-4 ${isProcessingOrder ? 'pointer-events-none opacity-75' : ''}`}>
                {photos.map((photo, index) => (
                  <DraggablePhotoCard
                    key={photo.public_id}
                    photo={photo}
                    onClick={(event) => handlePhotoClick(photo, index, event)}
                    isAdmin={isAdmin}
                    isDragEnabled={sortBy === 'custom' && isAdmin && !isProcessingOrder}
                    isMultiSelectMode={isMultiSelectMode}
                    isSelected={selectedPhotoIds.has(photo.public_id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {selectedPhoto && (
        <PhotoViewer
          photo={selectedPhoto}
          isOpen={!!selectedPhoto}
          onClose={handleCloseViewer}
          onPrevious={selectedIndex > 0 ? handlePrevious : undefined}
          onNext={selectedIndex < photos.length - 1 ? handleNext : undefined}
          currentIndex={selectedIndex}
          totalCount={photos.length}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        photoCount={selectedPhotoIds.size}
        isDeleting={isDeleting}
      />
    </div>
  );
}
