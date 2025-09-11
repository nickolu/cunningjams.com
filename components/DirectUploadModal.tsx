'use client';

import { useState } from 'react';
import { CldUploadWidget, CloudinaryUploadWidgetInfo, CloudinaryUploadWidgetResults } from 'next-cloudinary';
import { toast } from 'sonner';

interface DirectUploadModalProps {
  onUploadComplete?: () => void;
  children: (props: { open: () => void; isUploading: boolean }) => React.ReactNode;
}

export function DirectUploadModal({ onUploadComplete, children }: DirectUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  
  // Get environment variables with fallbacks
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'album-upload';
  
  if (!cloudName) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not set!');
    return null;
  }

  const handleSuccess = (result: CloudinaryUploadWidgetResults) => {
    if (result.info && typeof result.info === 'object' && 'original_filename' in result.info) {
      const info = result.info as CloudinaryUploadWidgetInfo;
      console.log('✅ Upload successful:', info);
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

  return (
    <CldUploadWidget
      uploadPreset={uploadPreset}
      options={{
        multiple: true,
        maxFiles: 20,
        folder: '2025-steves-40th',
        resourceType: 'auto',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi', 'webm'],
        maxFileSize: 100000000, // 100MB
        sources: ['local', 'camera'],
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
      }}
      onSuccess={handleSuccess}
      onError={handleError}
      onOpen={() => {
        console.log('🚀 Cloudinary widget opened');
        setIsUploading(true);
      }}
      onClose={() => {
        console.log('🔄 Cloudinary widget closed');
        setIsUploading(false);
        // Refresh the gallery after upload
        onUploadComplete?.();
      }}
    >
      {({ open }) => children({ open, isUploading })}
    </CldUploadWidget>
  );
}