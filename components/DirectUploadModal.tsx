'use client';

import { useState, useRef } from 'react';
import { CldUploadWidget, CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults, CloudinaryUploadWidgetOptions } from 'next-cloudinary';
import { toast } from 'sonner';
import { getAlbumConfig } from '@/lib/album-config';

interface DirectUploadModalProps {
  albumSlug?: string;
  onUploadComplete?: () => void;
  sequentialUpload?: boolean; // If true, applies order metadata to preserve selection order
  children: (props: { open: () => void; isUploading: boolean }) => React.ReactNode;
}

export function DirectUploadModal({ 
  albumSlug, 
  onUploadComplete, 
  sequentialUpload = true, // Default to true to preserve order
  children 
}: DirectUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  // Track all uploaded files in order of completion
  const uploadedFilesRef = useRef<Array<{ publicId: string; timestamp: number; originalFilename: string }>>([]);
  
  // Get environment variables with fallbacks
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'album-upload';
  
  if (!cloudName) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set!');
    return null;
  }

  // Get the cloudinary folder from album config
  const albumConfig = albumSlug ? getAlbumConfig(albumSlug) : null;
  const cloudinaryFolder = albumConfig?.cloudinaryFolder || 'default-uploads';

  const handleSuccess = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === 'object' && 'original_filename' in result.info) {
      const info = result.info as CloudinaryUploadWidgetInfo;
      console.log('✅ Upload successful:', {
        original_filename: info.original_filename,
        public_id: info.public_id,
        created_at: info.created_at
      });
      
      // Track this upload with original filename for sorting
      if (sequentialUpload) {
        uploadedFilesRef.current.push({
          publicId: info.public_id,
          timestamp: Date.now(),
          originalFilename: info.original_filename
        });
        console.log(`📝 Tracked upload (${uploadedFilesRef.current.length}): ${info.original_filename} -> ${info.public_id}`);
      }
      
      toast.success(`${info.original_filename} uploaded successfully!`);
    } else {
      console.error('❌ Upload result is not a valid CloudinaryUploadWidgetInfo:', result);
      return;
    }
  };

  const handleError = (error: any) => {
    console.error('❌ Upload failed:', error);
    toast.error('Upload failed. Please try again.');
  };

  // Build options object
  const uploadOptions: CloudinaryUploadWidgetOptions = {
    multiple: true,
    maxFiles: 500,
    folder: cloudinaryFolder,
    resourceType: 'auto',
    clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'],
    maxFileSize: 100000000, // 100MB
    sources: ['local', 'google_drive'],
    showAdvancedOptions: false,
    cropping: false,
    showSkipCropButton: false,
    styles: {
      palette: {
        window: '#ffffff',
        sourceBg: '#f4f4f5',
        windowBorder: '#90a0b3',
        tabIcon: '#0078ff',
        inactiveTabIcon: '#69778a',
        menuIcons: '#0078ff',
        link: '#0078ff',
        action: '#0078ff',
        inProgress: '#0078ff',
        complete: '#20b832',
        error: '#ea3d3d',
        textDark: '#000000',
        textLight: '#ffffff'
      }
    }
  };

  // Natural sort comparator that handles numbers correctly
  const naturalSort = (a: string, b: string): number => {
    const regex = /(\d+)|(\D+)/g;
    const aParts = a.match(regex) || [];
    const bParts = b.match(regex) || [];
    
    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
      const aPart = aParts[i];
      const bPart = bParts[i];
      
      const aNum = parseInt(aPart, 10);
      const bNum = parseInt(bPart, 10);
      
      // If both parts are numbers, compare numerically
      if (!isNaN(aNum) && !isNaN(bNum)) {
        if (aNum !== bNum) return aNum - bNum;
      } else {
        // Otherwise compare as strings
        const comparison = aPart.localeCompare(bPart);
        if (comparison !== 0) return comparison;
      }
    }
    
    // If all parts are equal, shorter string comes first
    return aParts.length - bParts.length;
  };

  const handleClose = async () => {
    console.log('🔄 Cloudinary widget closed');
    
    // If sequential upload is enabled and we have files, apply order
    if (sequentialUpload && uploadedFilesRef.current.length > 0) {
      console.log(`🔢 Applying order to ${uploadedFilesRef.current.length} uploaded files...`);
      
      // Debug: Show files before sorting
      console.log('Files BEFORE sorting:', uploadedFilesRef.current.map(f => f.originalFilename));
      
      // Sort by ORIGINAL FILENAME using natural/numeric sorting
      const sortedFiles = [...uploadedFilesRef.current].sort((a, b) => {
        const result = naturalSort(a.originalFilename, b.originalFilename);
        console.log(`Comparing: "${a.originalFilename}" vs "${b.originalFilename}" = ${result}`);
        return result;
      });
      
      console.log('Files AFTER sorting:', sortedFiles.map(f => f.originalFilename));
      
      // Apply order metadata
      try {
        const updates = sortedFiles.map((file, index) => ({
          currentPublicId: file.publicId,
          newOrder: index
        }));
        
        console.log('Order updates:', updates.map((u, i) => ({ 
          file: sortedFiles[i].originalFilename, 
          order: u.newOrder
        })));
        
        const response = await fetch('/api/album/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            albumSlug,
            updates
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to apply order metadata');
        }
        
        console.log('✅ Order metadata applied successfully');
      } catch (error) {
        console.error('❌ Failed to apply order metadata:', error);
      }
    }
    
    // Reset tracking
    uploadedFilesRef.current = [];
    setIsUploading(false);
    
    // Small delay to ensure Cloudinary has processed the order changes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Refresh the gallery after upload and order application
    onUploadComplete?.();
  };

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      options={uploadOptions}
      onSuccess={handleSuccess}
      onError={handleError}
      onOpen={() => {
        console.log('🚀 Cloudinary widget opened');
        console.log(sequentialUpload ? '🔢 Order preservation enabled' : '⚡ Parallel upload (no order preservation)');
        setIsUploading(true);
        // Reset order tracking
        uploadedFilesRef.current = [];
      }}
      onClose={handleClose}
    >
      {({ open }) => {
        const safeOpen = () => {
          try {
            console.log('📤 Opening Cloudinary widget...');
            open();
          } catch (error) {
            console.error('❌ Error opening Cloudinary widget:', error);
            setIsUploading(false);
            toast.error('Failed to open upload widget. Please try again.');
          }
        };
        
        return children({ open: safeOpen, isUploading });
      }}
    </CldUploadWidget>
  );
}