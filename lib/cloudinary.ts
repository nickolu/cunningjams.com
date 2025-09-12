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

// Default sort key config (padded numeric strings for lexicographic sort)
const SORT_KEY_WIDTH = 9; // zero-pad to 9 digits
const SORT_KEY_STEP = 1000; // default spacing between consecutive items

function toPaddedSortKeyFromIndex(index: number): string {
  const numericValue = index * SORT_KEY_STEP;
  return String(numericValue).padStart(SORT_KEY_WIDTH, '0');
}

export async function updatePhotoOrder(orderUpdates: { currentPublicId: string; newOrder?: number; newSortKey?: string }[]): Promise<boolean> {
  try {
    console.log(`🔄 Starting photo order update for ${orderUpdates.length} photos`);
    console.log('Order updates:', orderUpdates.map(u => ({ id: u.currentPublicId, order: u.newOrder, key: u.newSortKey })));
    
    // Check Cloudinary configuration
    const config = cloudinary.config();
    console.log('Cloudinary config check:', {
      cloud_name: !!config.cloud_name,
      api_key: !!config.api_key,
      api_secret: !!config.api_secret
    });
    
    // Use context metadata with padded order keys for proper lexicographic sorting
    // Process in batches to avoid rate limiting
    const BATCH_SIZE = 5;
    const results: Array<{ success: boolean; publicId: string; result?: any; error?: string }> = [];
    
    for (let i = 0; i < orderUpdates.length; i += BATCH_SIZE) {
      const batch = orderUpdates.slice(i, i + BATCH_SIZE);
      console.log(`🔄 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(orderUpdates.length / BATCH_SIZE)} (${batch.length} items)`);
      
      const batchPromises = batch.map(async ({ currentPublicId, newOrder, newSortKey }, batchIndex) => {
        const globalIndex = i + batchIndex;
        try {
          // Prefer provided sort key, else derive from index using default spacing
          const paddedOrder = newSortKey ?? toPaddedSortKeyFromIndex(newOrder ?? 0);
          
          console.log(`📝 [${globalIndex + 1}/${orderUpdates.length}] Setting context sort_order=${paddedOrder} for ${currentPublicId}`);
          
          // Update the context with the order
          const result = await cloudinary.uploader.add_context(`sort_order=${paddedOrder}`, [currentPublicId]);
          console.log(`✅ [${globalIndex + 1}/${orderUpdates.length}] Context update successful for ${currentPublicId}`);
          return { success: true, publicId: currentPublicId, result };
        } catch (error: any) {
          console.error(`❌ [${globalIndex + 1}/${orderUpdates.length}] Context update failed for ${currentPublicId}:`, error);
          return { success: false, publicId: currentPublicId, error: error.message || String(error) };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add a small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < orderUpdates.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`📊 Update results: ${successful.length} successful, ${failed.length} failed`);
    
    if (failed.length > 0) {
      console.error('❌ Failed updates:', failed);
      throw new Error(`Failed to update ${failed.length} out of ${orderUpdates.length} photos`);
    }
    
    console.log('✅ All context updates completed successfully');
    return true;
  } catch (error) {
    console.error('💥 Error updating photo order:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Non-Error object thrown:', error);
    }
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

/**
 * Deletes multiple images from Cloudinary (admin function)
 */
export async function deleteImages(publicIds: string[]): Promise<{ successful: string[], failed: string[] }> {
  try {
    // Use Cloudinary's bulk delete API for better performance
    const result = await cloudinary.api.delete_resources(publicIds);
    
    const successful: string[] = [];
    const failed: string[] = [];
    
    // Parse the results
    for (const [publicId, status] of Object.entries(result.deleted)) {
      if (status === 'deleted') {
        successful.push(publicId);
      } else {
        failed.push(publicId);
      }
    }
    
    // Handle any that weren't in the deleted object (likely failed)
    for (const publicId of publicIds) {
      if (!result.deleted[publicId]) {
        failed.push(publicId);
      }
    }
    
    return { successful, failed };
  } catch (error) {
    console.error('Error deleting images:', error);
    // If bulk delete fails, fall back to individual deletes
    const successful: string[] = [];
    const failed: string[] = [];
    
    for (const publicId of publicIds) {
      const success = await deleteImage(publicId);
      if (success) {
        successful.push(publicId);
      } else {
        failed.push(publicId);
      }
    }
    
    return { successful, failed };
  }
}

export default cloudinary;
