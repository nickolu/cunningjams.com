import { v2 as cloudinary } from 'cloudinary';

// Ensure this only runs on the server
if (typeof window === 'undefined') {
  // Configure Cloudinary only on server
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}


export const ALBUM_FOLDER = '2025-steves-40th';

// Re-export types from client module
export type { CloudinaryMedia, CloudinaryImage } from './cloudinary-client';

/**
 * Fetches all media (images and videos) from the album folder
 */
export async function getAlbumPhotos(): Promise<CloudinaryImage[]> {
  const startTime = Date.now();
  console.log(`[CLOUDINARY] 🔍 Fetching photos from folder: ${ALBUM_FOLDER}`);
  
  try {
    const result = await cloudinary.search
      .expression(`folder:${ALBUM_FOLDER}`)
      .sort_by('created_at', 'desc')
      .max_results(500) // Adjust as needed
      .execute();
    
    const fetchTime = Date.now() - startTime;
    console.log(`[CLOUDINARY] ✅ Found ${result.resources.length} items in ${fetchTime}ms`);

    return result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      created_at: resource.created_at,
      bytes: resource.bytes,
      original_filename: resource.original_filename,
      resource_type: resource.resource_type,
      duration: resource.duration,
    }));
  } catch (error) {
    const fetchTime = Date.now() - startTime;
    console.error(`[CLOUDINARY] ❌ Error fetching album photos (${fetchTime}ms):`, error);
    
    // If the folder doesn't exist yet, return empty array instead of throwing
    if (error && typeof error === 'object' && 'error' in error) {
      const cloudinaryError = error.error as any;
      if (cloudinaryError?.http_code === 400 || cloudinaryError?.message?.includes('folder')) {
        console.log(`[CLOUDINARY] ℹ️ Album folder '${ALBUM_FOLDER}' not found, returning empty array`);
        return [];
      }
    }
    
    throw new Error('Failed to fetch photos from Cloudinary');
  }
}

/**
 * Uploads a single image to the album folder
 */
export async function uploadToAlbum(
  file: Buffer,
  filename?: string,
  fileType?: string
): Promise<CloudinaryImage> {
  const startTime = Date.now();
  const isVideo = fileType?.startsWith('video/');
  const mediaType = isVideo ? 'video' : 'image';
  const fileSizeMB = (file.length / 1024 / 1024).toFixed(2);
  
  console.log(`[CLOUDINARY] 📤 Starting ${mediaType} upload: ${filename || 'unnamed'} (${fileSizeMB}MB)`);
  
  try {
    // Determine the MIME type for the data URI
    const mimeType = fileType || (isVideo ? 'video/mp4' : 'image/jpeg');
    console.log(`[CLOUDINARY] 🔄 Converting to base64 (MIME: ${mimeType})...`);
    
    const base64ConvertStart = Date.now();
    const base64String = `data:${mimeType};base64,${file.toString('base64')}`;
    const base64ConvertTime = Date.now() - base64ConvertStart;
    console.log(`[CLOUDINARY] ✅ Base64 conversion completed in ${base64ConvertTime}ms`);
    
    const uploadOptions = {
      folder: ALBUM_FOLDER,
      public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined, // Remove extension
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      // Video-specific optimizations
      ...(isVideo && {
        eager: [
          { width: 400, height: 300, crop: 'pad', format: 'jpg' }, // Generate thumbnail
        ],
      }),
    };
    
    console.log(`[CLOUDINARY] ☁️ Uploading to folder: ${ALBUM_FOLDER}${isVideo ? ' (with thumbnail generation)' : ''}`);
    const cloudinaryUploadStart = Date.now();
    const result = await cloudinary.uploader.upload(base64String, uploadOptions);
    const cloudinaryUploadTime = Date.now() - cloudinaryUploadStart;

    const totalTime = Date.now() - startTime;
    const resultSizeMB = (result.bytes / 1024 / 1024).toFixed(2);
    
    console.log(`[CLOUDINARY] 🎉 Upload successful! (${cloudinaryUploadTime}ms Cloudinary, ${totalTime}ms total)`);
    console.log(`[CLOUDINARY] 📋 Result: ${result.public_id}`);
    console.log(`[CLOUDINARY] 📊 Details: ${result.width}x${result.height}, ${resultSizeMB}MB, ${result.format}`);
    if (result.duration) {
      console.log(`[CLOUDINARY] 🎬 Video duration: ${result.duration}s`);
    }

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      created_at: result.created_at,
      bytes: result.bytes,
      original_filename: result.original_filename,
      resource_type: result.resource_type,
      duration: result.duration,
    };
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[CLOUDINARY] 💥 Upload failed for ${filename || 'unnamed'} (${totalTime}ms):`, error);
    throw new Error(`Failed to upload ${mediaType} to Cloudinary: ${error}`);
  }
}


/**
 * Deletes an image from Cloudinary (admin function)
 */
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

export default cloudinary;
