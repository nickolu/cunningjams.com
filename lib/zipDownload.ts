import JSZip from 'jszip';
import { CloudinaryImage } from './cloudinary';

export async function downloadPhotosAsZip(photos: CloudinaryImage[]) {
  if (photos.length === 0) {
    throw new Error('No photos to download');
  }

  const zip = new JSZip();
  const promises: Promise<void>[] = [];

  // Create a progress callback
  let completed = 0;
  const total = photos.length;

  for (const photo of photos) {
    const promise = fetch(photo.secure_url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${photo.original_filename || photo.public_id}`);
        }
        return response.blob();
      })
      .then(blob => {
        // Generate filename
        const filename = photo.original_filename || 
          `photo-${photo.public_id.split('/').pop()}.${photo.format}`;
        
        zip.file(filename, blob);
        completed++;
        
        // Dispatch progress event
        window.dispatchEvent(new CustomEvent('zipProgress', {
          detail: { completed, total, percentage: Math.round((completed / total) * 100) }
        }));
      })
      .catch(error => {
        console.error(`Error downloading ${photo.original_filename || photo.public_id}:`, error);
        // Continue with other files even if one fails
      });

    promises.push(promise);
  }

  // Wait for all downloads to complete
  await Promise.allSettled(promises);

  // Generate ZIP file
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 6
    }
  });

  // Create download link
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `steves-40th-photos-${new Date().toISOString().split('T')[0]}.zip`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
}
