'use client';

import { useState, useEffect } from 'react';
import { PhotoCard } from '@/components/PhotoCard';
import { PhotoViewer } from '@/components/PhotoViewer';
import { LoadingGallery } from '@/components/LoadingGallery';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { DownloadButton } from '@/components/DownloadButton';
import { CloudinaryImage } from '@/lib/cloudinary';
import { toast } from 'sonner';

export function PhotoGallery() {
  const [photos, setPhotos] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<CloudinaryImage | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/album/photos');
      
      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }
      
      const data = await response.json();
      setPhotos(data.photos || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

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

  const handleDownloadAll = () => {
    // This is now handled by the DownloadButton component
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
            {photos.length} photo{photos.length !== 1 ? 's' : ''} shared
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo.public_id}
              photo={photo}
              onClick={() => handlePhotoClick(photo, index)}
            />
          ))}
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
    </div>
  );
}
