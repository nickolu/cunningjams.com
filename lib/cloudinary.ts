import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { CloudinaryImage } from './cloudinary-client';

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

export type SortOption = 'custom' | 'newest' | 'oldest' | 'name-asc' | 'name-desc';

/**
 * Fetches all media (images and videos) from the album folder
 */
export async function getAlbumPhotos(sortBy: SortOption = 'custom'): Promise<CloudinaryImage[]> {
  try {
    let searchQuery = cloudinary.search
      .expression(`folder:${ALBUM_FOLDER}`)
      .max_results(500); // Adjust as needed
    
    // Apply sorting based on sortBy parameter
    switch (sortBy) {
      case 'newest':
        searchQuery = searchQuery.sort_by('created_at', 'desc');
        break;
      case 'oldest':
        searchQuery = searchQuery.sort_by('created_at', 'asc');
        break;
      case 'name-asc':
        searchQuery = searchQuery.sort_by('public_id', 'asc');
        break;
      case 'name-desc':
        searchQuery = searchQuery.sort_by('public_id', 'desc');
        break;
      case 'custom':
      default:
        // For custom sort, we'll fetch all and sort by custom_order context
        searchQuery = searchQuery.sort_by('created_at', 'desc');
        break;
    }
    
    const result = await searchQuery.execute();

    let photos = result.resources.map((resource: any) => ({
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
      custom_order: resource.context?.custom_order ? parseInt(resource.context.custom_order) : null,
    }));

    // If using custom sort, sort by custom_order (nulls last, then by created_at)
    if (sortBy === 'custom') {
      photos.sort((a: any, b: any) => {
        // If both have custom_order, sort by that
        if (a.custom_order !== null && b.custom_order !== null) {
          return a.custom_order - b.custom_order;
        }
        // If only one has custom_order, prioritize it
        if (a.custom_order !== null) return -1;
        if (b.custom_order !== null) return 1;
        // If neither has custom_order, sort by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return photos;
  } catch (error) {
    console.error('Error fetching album photos:', error);
    
    // If the folder doesn't exist yet, return empty array instead of throwing
    if (error && typeof error === 'object' && 'error' in error) {
      const cloudinaryError = error.error as any;
      if (cloudinaryError?.http_code === 400 || cloudinaryError?.message?.includes('folder')) {
        console.log(`Album folder '${ALBUM_FOLDER}' not found, returning empty array`);
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
  const isVideo = fileType?.startsWith('video/');
  
  try {
    // Determine the MIME type for the data URI
    const mimeType = fileType || (isVideo ? 'video/mp4' : 'image/jpeg');
    const base64String = `data:${mimeType};base64,${file.toString('base64')}`;
    
    const uploadOptions: UploadApiOptions = {
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
    
    const result = await cloudinary.uploader.upload(base64String, uploadOptions);

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      created_at: result.created_at,
      bytes: result.bytes,
      original_filename: result.original_filename,
      resource_type: result.resource_type as 'image' | 'video',
      duration: result.duration,
    };
  } catch (error) {
    console.error(`Failed to upload ${filename || 'unnamed'} to Cloudinary:`, error);
    throw new Error(`Failed to upload to Cloudinary`);
  }
}


/**
 * Updates the custom order for multiple images (admin function)
 */
export async function updateCustomOrder(orderUpdates: { publicId: string; order: number }[]): Promise<boolean> {
  try {
    // Update each image's context with the new custom_order
    const updatePromises = orderUpdates.map(({ publicId, order }) =>
      cloudinary.uploader.add_context(`custom_order=${order}`, [publicId])
    );

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error updating custom order:', error);
    return false;
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
