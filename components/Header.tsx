'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Upload, Menu, LogOut } from 'lucide-react';
import { DirectUploadModal } from '@/components/DirectUploadModal';
import { DownloadButton } from '@/components/DownloadButton';
import { CloudinaryImage } from '@/lib/cloudinary-client';

interface HeaderProps {
  photos?: CloudinaryImage[];
  onRefreshGallery?: () => void;
}

export function Header({ photos = [], onRefreshGallery }: HeaderProps) {
  const router = useRouter();
  const [mobileUploadModalOpen, setMobileUploadModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/album/password');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-semibold">Photo Album</h2>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <DirectUploadModal onUploadComplete={onRefreshGallery}>
              {({ open, isUploading }) => (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={open}
                  disabled={isUploading}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Photos</span>
                </Button>
              )}
            </DirectUploadModal>
            
            <DownloadButton photos={photos} />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setMobileUploadModalOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photos
                </DropdownMenuItem>
                <div className="px-2 py-1">
                  <DownloadButton photos={photos} variant="ghost" size="sm" className="w-full justify-start" />
                </div>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Mobile Upload Modal - Outside of dropdown to prevent closing issues */}
      {mobileUploadModalOpen && (
        <DirectUploadModal onUploadComplete={() => {
          onRefreshGallery?.();
          setMobileUploadModalOpen(false);
        }}>
          {({ open, isUploading }) => {
            // Auto-open when modal becomes active
            if (mobileUploadModalOpen && !isUploading) {
              setTimeout(open, 0);
            }
            return null; // No UI needed since we auto-open
          }}
        </DirectUploadModal>
      )}
    </>
  );
}
