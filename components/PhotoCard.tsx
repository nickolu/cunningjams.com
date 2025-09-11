import { CloudinaryImage, getOptimizedImageUrl } from '@/lib/cloudinary-client';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Play, Clock, Video } from 'lucide-react';
import { useState } from 'react';

interface PhotoCardProps {
  photo: CloudinaryImage;
  onClick: () => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function PhotoCard({ photo, onClick }: PhotoCardProps) {
  const isVideo = photo.resource_type === 'video';
  const [thumbnailError, setThumbnailError] = useState(false);
  
  // For videos, use Cloudinary's auto-generated thumbnail
  const thumbnailUrl = isVideo 
    ? getOptimizedImageUrl(photo.public_id, { width: 400, height: 400, format: 'jpg', quality: 'auto', crop: 'fill' })
    : getOptimizedImageUrl(photo.public_id, { width: 400, height: 400, format: 'auto', quality: 'auto', crop: 'fill' });

  const handleThumbnailError = () => {
    if (isVideo) {
      setThumbnailError(true);
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow overflow-hidden group"
      onClick={onClick}
    >
      <div className="aspect-square relative">
        {isVideo && thumbnailError ? (
          // Video placeholder when thumbnail fails to load
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
            <div className="text-center">
              <Video className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Video</p>
            </div>
          </div>
        ) : (
          <Image
            src={thumbnailUrl}
            alt={photo.original_filename || (isVideo ? 'Video' : 'Photo')}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            onError={handleThumbnailError}
            loading="lazy"
          />
        )}
        
        {/* Video overlay */}
        {isVideo && (
          <>
            {/* Play icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="bg-white/90 rounded-full p-3 group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-gray-800 fill-gray-800" />
              </div>
            </div>
            
            {/* Duration badge */}
            {photo.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(photo.duration)}</span>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
