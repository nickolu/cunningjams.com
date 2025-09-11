import { CloudinaryImage } from '@/lib/cloudinary-client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface PhotoViewerProps {
  photo: CloudinaryImage;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex: number;
  totalCount: number;
}

export function PhotoViewer({
  photo,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  currentIndex,
  totalCount,
}: PhotoViewerProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.secure_url;
    link.download = photo.original_filename || `photo-${photo.public_id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/90 border-none">
        <VisuallyHidden>
          <DialogTitle>
            Photo {currentIndex + 1} of {totalCount}
            {photo.original_filename && ` - ${photo.original_filename}`}
          </DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Download button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-10 text-white hover:bg-white/20"
            onClick={handleDownload}
          >
            <Download className="w-6 h-6" />
          </Button>

          {/* Previous button */}
          {onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={onPrevious}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* Next button */}
          {onNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
              onClick={onNext}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Media Content */}
          <div className="relative w-full h-full max-w-full max-h-full flex items-center justify-center p-8">
            {photo.resource_type === 'video' ? (
              <video
                src={photo.secure_url}
                controls
                className="max-w-full max-h-full object-contain"
                preload="metadata"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                src={photo.secure_url}
                alt={photo.original_filename || 'Photo'}
                width={photo.width}
                height={photo.height}
                className="max-w-full max-h-full object-contain"
                priority
              />
            )}
          </div>

          {/* Media info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
            <p className="text-sm opacity-75">
              {currentIndex + 1} of {totalCount}
              {photo.resource_type === 'video' && ' (Video)'}
            </p>
            {photo.original_filename && (
              <p className="text-xs opacity-60 mt-1">
                {photo.original_filename}
              </p>
            )}
            {photo.resource_type === 'video' && photo.duration && (
              <p className="text-xs opacity-60 mt-1">
                Duration: {Math.floor(photo.duration / 60)}:{String(Math.floor(photo.duration % 60)).padStart(2, '0')}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
