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
      const oldIndex = photos.findIndex(photo => photo.public_id === active.id);
      const newIndex = photos.findIndex(photo => photo.public_id === over?.id);

      const newPhotos = arrayMove(photos, oldIndex, newIndex);
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

        toast.success('Photo order updated successfully');
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

  const handlePhotoClick = (photo: CloudinaryImage, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
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

  // Calculate grid classes based on thumbnail size
  const getGridClasses = () => {
    const gridClasses = {
      2: 'grid-cols-2',
      3: 'grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      5: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
      6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6',
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
                  onClick={() => handlePhotoClick(photo, index)}
                  isAdmin={isAdmin}
                  isDragEnabled={sortBy === 'custom' && isAdmin}
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
    </div>
  );
}
