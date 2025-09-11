import { Suspense } from 'react';
import { PhotoGallery } from '@/components/PhotoGallery';
import { LoadingGallery } from '@/components/LoadingGallery';

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingGallery />}>
        <PhotoGallery />
      </Suspense>
    </div>
  );
}
