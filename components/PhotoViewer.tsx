import { CloudinaryImage } from '@/lib/cloudinary-client';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useEffect, useRef, useState } from 'react';
import { PhotoComments } from '@/components/PhotoComments';
import { CommentCount } from 'disqus-react';

interface PhotoViewerProps {
  photo: CloudinaryImage;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  currentIndex: number;
  totalCount: number;
  albumSlug?: string;
}

export function PhotoViewer({
  photo,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  currentIndex,
  totalCount,
  albumSlug,
}: PhotoViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showComments, setShowComments] = useState(false);

  // Disqus configuration
  const disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || 'your-site';
  const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cunningjams.com';
  const identifier = albumSlug
    ? `${albumSlug}/${photo.public_id}`
    : photo.public_id;
  const url = `${productionUrl}/album/${albumSlug || 'default'}?photo=${encodeURIComponent(photo.public_id)}`;
  const title = photo.original_filename || `Photo ${photo.public_id.split('/').pop()}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo.secure_url;
    link.download = photo.original_filename || `photo-${photo.public_id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onPrevious?.();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext?.();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrevious, onNext, onClose]);

  // Touch/swipe navigation
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.changedTouches[0].screenX;
      touchStartY = event.changedTouches[0].screenY;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      touchEndX = event.changedTouches[0].screenX;
      touchEndY = event.changedTouches[0].screenY;
      
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      // Only trigger swipe if horizontal movement is greater than vertical
      // and the swipe distance is significant (> 50px)
      if (absDeltaX > absDeltaY && absDeltaX > 50) {
        if (deltaX > 0) {
          // Swipe right - go to previous
          onPrevious?.();
        } else {
          // Swipe left - go to next
          onNext?.();
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, onPrevious, onNext]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 bg-black border-none m-0 rounded-none overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>
            Photo {currentIndex + 1} of {totalCount}
            {photo.original_filename && ` - ${photo.original_filename}`}
          </DialogTitle>
        </VisuallyHidden>
        <div
          ref={containerRef}
          className="relative w-full h-full flex flex-col"
        >
          {/* Main photo viewer area */}
          <div className="relative flex-1 flex items-center justify-center"
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-20 text-white hover:bg-white/20 transition-all duration-200"
            onClick={onClose}
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Download button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-28 z-20 text-white hover:bg-white/20 transition-all duration-200"
            onClick={handleDownload}
            title="Download image"
          >
            <Download className="w-6 h-6" />
          </Button>

          {/* Comments toggle button */}
          <Button
            variant="ghost"
            size="icon"
            className={`absolute top-4 right-16 z-20 text-white transition-all duration-200 ${
              showComments ? 'bg-white/30 hover:bg-white/40' : 'hover:bg-white/20'
            }`}
            onClick={() => setShowComments(!showComments)}
            title={showComments ? "Hide comments" : "Show comments"}
          >
            <div className="relative">
              <MessageSquare className={`w-6 h-6 ${showComments ? 'fill-current' : ''}`} />
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                <CommentCount
                  shortname={disqusShortname}
                  config={{
                    url,
                    identifier,
                    title,
                  }}
                >
                  0
                </CommentCount>
              </div>
            </div>
          </Button>

          {/* Previous button */}
          {onPrevious && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
              onClick={onPrevious}
              title="Previous image (←)"
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {/* Next button */}
          {onNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
              onClick={onNext}
              title="Next image (→)"
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Media Content */}
          <div className="relative w-full h-full p-4 sm:p-8">
            {photo.resource_type === 'video' ? (
              <video
                src={photo.secure_url}
                controls
                className="w-full h-full object-contain"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <Image
                src={photo.secure_url}
                alt={photo.original_filename || 'Photo'}
                fill
                className="object-contain"
                priority
                sizes="100vw"
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
            {totalCount > 1 && (
              <p className="text-xs opacity-50 mt-2">
                Use ← → keys or swipe to navigate
              </p>
            )}
          </div>
          </div>

          {/* Comments panel */}
          {showComments && (
            <div className="w-full h-1/2 bg-white overflow-y-auto border-t border-gray-200">
              <div className="max-w-4xl mx-auto p-4">
                <PhotoComments photo={photo} albumSlug={albumSlug} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
