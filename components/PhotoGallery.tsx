'use client';

import { useState, useEffect } from 'react';
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

export function PhotoGallery() {
  const [photos, setPhotos] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<CloudinaryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [sortBy, setSortBy] = useState<SortOption>('custom');
  const [thumbnailSize, setThumbnailSize] = useState(4); // Default 4 per row
  const [isAdmin, setIsAdmin] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isSettingCustom, setIsSettingCustom] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [lastClickedIndex, setLastClickedIndex] = useState<number>(-1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchPhotos = async (sort: SortOption = sortBy) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/album/photos?sort=${sort}`);
      
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

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    fetchPhotos(newSort);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

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

      setPhotos(newPhotos);

      // Update the order on the server
      setIsReordering(true);
      try {
        const photoIds = newPhotos.map(photo => photo.public_id);
        const response = await fetch('/api/album/reorder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ photoIds }),
        });

        if (!response.ok) {
          throw new Error('Failed to update photo order');
        }

        const photoCount = photosToMove.length;
        toast.success(`${photoCount} photo${photoCount !== 1 ? 's' : ''} reordered successfully`);
      } catch (error) {
        console.error('Error updating photo order:', error);
        toast.error('Failed to update photo order');
        // Revert the local change
        fetchPhotos();
      } finally {
        setIsReordering(false);
      }
    }
  };

  const handlePhotoClick = (photo: CloudinaryImage, index: number, event?: React.MouseEvent) => {
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
      const response = await fetch('/api/album/set-custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoIds }),
      });

      if (!response.ok) {
        throw new Error('Failed to set custom order');
      }

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
      
      toast.success(`Current "${sortLabels[sortBy]}" order saved as custom order`);
      
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

  const confirmDelete = async () => {
    if (selectedPhotoIds.size === 0) return;

    setIsDeleting(true);
    try {
      const photoIds = Array.from(selectedPhotoIds);
      const response = await fetch('/api/album/delete', {
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
    };
    return gridClasses[thumbnailSize as keyof typeof gridClasses] || gridClasses[4];
  };

  if (loading) {
    return (
      <div>
        <Header photos={[]} onRefreshGallery={fetchPhotos} />
        <div className="container mx-auto px-4 py-8">
          <LoadingGallery />
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div>
        <Header photos={[]} onRefreshGallery={fetchPhotos} />
        <div className="container mx-auto px-4 py-8">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header photos={photos} onRefreshGallery={fetchPhotos} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Steve's 40th Birthday
          </h1>
          <p className="text-xl text-muted-foreground mb-1">
            Colorado Trip 2025
          </p>
          <p className="text-sm text-muted-foreground">
            {photos.length} item{photos.length !== 1 ? 's' : ''} shared
          </p>
        </div>

        {/* Sort and Size Controls */}
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
        />

        {/* Photo Grid */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map(p => p.public_id)}
            strategy={rectSortingStrategy}
          >
            <div className={`grid ${getGridClasses()} gap-4 ${isReordering ? 'pointer-events-none opacity-75' : ''}`}>
              {photos.map((photo, index) => (
                <DraggablePhotoCard
                  key={photo.public_id}
                  photo={photo}
                  onClick={(event) => handlePhotoClick(photo, index, event)}
                  isAdmin={isAdmin}
                  isDragEnabled={sortBy === 'custom' && isAdmin}
                  isMultiSelectMode={isMultiSelectMode}
                  isSelected={selectedPhotoIds.has(photo.public_id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
