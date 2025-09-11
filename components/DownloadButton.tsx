import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Loader2 } from 'lucide-react';
import { CloudinaryImage } from '@/lib/cloudinary';
import { downloadPhotosAsZip } from '@/lib/zipDownload';
import { toast } from 'sonner';

interface DownloadButtonProps {
  photos: CloudinaryImage[];
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

interface DownloadProgress {
  completed: number;
  total: number;
  percentage: number;
}

export function DownloadButton({ photos, variant = 'outline', size = 'sm', className }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);

  useEffect(() => {
    const handleProgress = (event: CustomEvent<DownloadProgress>) => {
      setProgress(event.detail);
    };

    window.addEventListener('zipProgress', handleProgress as EventListener);
    
    return () => {
      window.removeEventListener('zipProgress', handleProgress as EventListener);
    };
  }, []);

  const handleDownload = async () => {
    if (photos.length === 0) {
      toast.error('No photos to download');
      return;
    }

    if (isDownloading) return;

    setIsDownloading(true);
    setProgress(null);
    
    try {
      toast.info('Preparing download... This may take a moment');
      await downloadPhotosAsZip(photos);
      toast.success('Photos downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download photos. Please try again.');
    } finally {
      setIsDownloading(false);
      setProgress(null);
    }
  };

  if (isDownloading && progress) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <Button variant={variant} size={size} className={className} disabled>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Downloading... {progress.percentage}%
        </Button>
        <Progress value={progress.percentage} className="w-full max-w-xs" />
        <p className="text-xs text-muted-foreground">
          {progress.completed} of {progress.total} photos
        </p>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={isDownloading || photos.length === 0}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Preparing...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download All ({photos.length})
        </>
      )}
    </Button>
  );
}
