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

export type SortOption = 'custom' | 'created-newest' | 'created-oldest' | 'name-asc' | 'name-desc' | 'upload-newest' | 'upload-oldest';

/**
 * Fetches all media (images and videos) from the album folder
 */
export async function getAlbumPhotos(sortBy: SortOption = 'custom'): Promise<CloudinaryImage[]> {
  try {
    let searchQuery = cloudinary.search
      .expression(`folder:${ALBUM_FOLDER}`)
      .with_field('context')  // Explicitly request context metadata
      .max_results(500); // Adjust as needed
    
    // Apply sorting based on sortBy parameter
    // Note: For all sorts except custom, we let Cloudinary do the sorting
    // In Cloudinary: created_at = upload time, we'll use metadata for original creation date
    switch (sortBy) {
      case 'upload-newest':
        searchQuery = searchQuery.sort_by('created_at', 'desc');
        break;
      case 'upload-oldest':
        searchQuery = searchQuery.sort_by('created_at', 'asc');
        break;
      case 'name-asc':
        searchQuery = searchQuery.sort_by('public_id', 'asc');
        break;
      case 'name-desc':
        searchQuery = searchQuery.sort_by('public_id', 'desc');
        break;
      case 'created-newest':
      case 'created-oldest':
        // For now, use created_at (upload time) - we can enhance this later with EXIF data
        searchQuery = searchQuery.sort_by('created_at', sortBy === 'created-newest' ? 'desc' : 'asc');
        break;
      case 'custom':
      default:
        // For custom sort, we'll fetch all and sort by sort_order context later
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
      sort_order: resource.context?.sort_order || null,
    }));
    
    // If using custom sort, sort by sort_order context, then by created_at
    if (sortBy === 'custom') {
      photos.sort((a: CloudinaryImage, b: CloudinaryImage) => {
        // If both have sort_order, sort by that
        if (a.sort_order && b.sort_order) {
          return a.sort_order.localeCompare(b.sort_order);
        }
        // If only one has sort_order, prioritize it
        if (a.sort_order) return -1;
        if (b.sort_order) return 1;
        // If neither has sort_order, sort by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    
    // Debug: Log sample data in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sample photos with sort order:', photos.slice(0, 3).map((p: CloudinaryImage) => ({ 
        id: p.public_id.split('/').pop(), // Just show the filename part
        order: p.sort_order 
      })));
      console.log('Raw resource fields sample:', result.resources.slice(0, 2).map((r: any) => ({
        id: r.public_id,
        created_at: r.created_at,
        uploaded_at: r.uploaded_at,
        original_filename: r.original_filename,
        context: r.context
      })));
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
 * Sets the current photo order as the custom order (admin function)
 */
export async function setCurrentOrderAsCustom(photoIds: string[]): Promise<boolean> {
  try {
    console.log('Setting current order as custom for', photoIds.length, 'photos');
    
    // Create order updates based on current array order
    const orderUpdates = photoIds.map((publicId, index) => ({
      currentPublicId: publicId,
      newOrder: index,
    }));
    
    return await updatePhotoOrder(orderUpdates);
  } catch (error) {
    console.error('Error setting current order as custom:', error);
    return false;
  }
}

export async function updatePhotoOrder(orderUpdates: { currentPublicId: string; newOrder: number }[]): Promise<boolean> {
  try {
    console.log('Updating photo order with:', orderUpdates);
    
    // Use context metadata with padded order numbers for proper sorting
    const updatePromises = orderUpdates.map(async ({ currentPublicId, newOrder }) => {
      // Use padded numbers for proper sorting: 001, 002, 003, etc.
      const paddedOrder = String(newOrder).padStart(3, '0');
      
      console.log(`Setting context sort_order=${paddedOrder} for ${currentPublicId}`);
      
      // Update the context with the order
      const result = await cloudinary.uploader.add_context(`sort_order=${paddedOrder}`, [currentPublicId]);
      console.log(`Context update result for ${currentPublicId}:`, result);
      return result;
    });

    const results = await Promise.all(updatePromises);
    console.log('All context updates completed:', results);
    return true;
  } catch (error) {
    console.error('Error updating photo order:', error);
    console.error('Error details:', error);
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
