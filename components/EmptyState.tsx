import { AlbumConfig } from '@/types/album';
import { Upload, ImageIcon } from 'lucide-react';

export function EmptyState({ albumConfig }: { albumConfig: AlbumConfig | null }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="mb-6 w-24 h-24 bg-muted rounded-full flex items-center justify-center">
        <ImageIcon className="w-12 h-12 text-muted-foreground" />
      </div>
      
      <h3 className="text-2xl font-semibold mb-2">No media yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Be the first to share photos and videos from {albumConfig?.title || "this album"}!
      </p>
      
      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground bg-muted/30 px-4 py-3 rounded-lg">
        <Upload className="w-4 h-4" />
        <span>Click "Upload Photos" in the header above to get started</span>
      </div>
    </div>
  );
}
