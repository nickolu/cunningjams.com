import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import { CloudinaryImage } from './cloudinary-client';
import { getAlbumConfig } from './album-config';

// Ensure this only runs on the server
if (typeof window === 'undefined') {
  // Configure Cloudinary only on server
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Legacy constant for backwards compatibility
export const ALBUM_FOLDER = '2025-steves-40th';

// Re-export types from client module
export type { CloudinaryMedia, CloudinaryImage } from './cloudinary-client';

export type SortOption = 'custom' | 'created-newest' | 'created-oldest' | 'name-asc' | 'name-desc' | 'upload-newest' | 'upload-oldest';

/**
 * Fetches all media (images and videos) from the album folder
 * @param sortBy - How to sort the results
 * @param albumSlug - Optional album slug to get photos from. If not provided, uses legacy ALBUM_FOLDER
 */
export async function getAlbumPhotos(sortBy: SortOption = 'custom', albumSlug?: string): Promise<CloudinaryImage[]> {
  try {
    // Determine the folder to search in
    let folderName = ALBUM_FOLDER; // Default to legacy folder

    if (albumSlug) {
      const albumConfig = getAlbumConfig(albumSlug);
      if (!albumConfig) {
        throw new Error(`Album configuration not found for slug: ${albumSlug}`);
      }
      folderName = albumConfig.cloudinaryFolder;
    }

    // Search for both images and videos explicitly to ensure we get all resource types
    let searchQuery = cloudinary.search
      .expression(`folder:${folderName} AND (resource_type:image OR resource_type:video)`)
      .with_field('context')  // Explicitly request context metadata
      .with_field('tags')     // Also request tags (sometimes context is stored here)
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

    let photos = result.resources.map((resource: any) => {
      // Try to get sort_order from both context and tags for all resource types
      let sortOrder = null;
      
      // First try context metadata (works for both images and videos)
      if (resource.context?.sort_order) {
        sortOrder = resource.context.sort_order;
      } else if (resource.resource_type === 'video') {
        // For videos, also check tags as fallback
        const sortTag = resource.tags?.find((tag: string) => tag.startsWith('sort_order_'));
        if (sortTag) {
          sortOrder = sortTag.replace('sort_order_', '');
        }
      }
      
      return {
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
        sort_order: sortOrder,
      };
    });
    
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
        type: p.resource_type,
        order: p.sort_order 
      })));
      console.log('Raw resource fields sample:', result.resources.slice(0, 2).map((r: any) => ({
        id: r.public_id,
        type: r.resource_type,
        created_at: r.created_at,
        uploaded_at: r.uploaded_at,
        original_filename: r.original_filename,
        context: r.context,
        tags: r.tags
      })));
      
      // Specifically check videos vs images for context metadata
      const videos = photos.filter((p: CloudinaryImage) => p.resource_type === 'video');
      const images = photos.filter((p: CloudinaryImage) => p.resource_type === 'image');
      console.log('Video sort orders:', videos.slice(0, 3).map((v: CloudinaryImage) => ({ 
        id: v.public_id.split('/').pop(), 
        order: v.sort_order 
      })));
      console.log('Image sort orders:', images.slice(0, 3).map((i: CloudinaryImage) => ({ 
        id: i.public_id.split('/').pop(), 
        order: i.sort_order 
      })));
    }
    return photos;
  } catch (error) {
    console.error('Error fetching album photos:', error);
    
    // If the folder doesn't exist yet, return empty array instead of throwing
    if (error && typeof error === 'object' && 'error' in error) {
      const cloudinaryError = error.error as any;
      if (cloudinaryError?.http_code === 400 || cloudinaryError?.message?.includes('folder')) {
        const folder = albumSlug ? getAlbumConfig(albumSlug)?.cloudinaryFolder || 'unknown' : ALBUM_FOLDER;
        console.log(`Album folder '${folder}' not found, returning empty array`);
        return [];
      }
    }
    
    throw new Error('Failed to fetch photos from Cloudinary');
  }
}

/**
 * Uploads a single image to the album folder
 * @param file - The file buffer to upload
 * @param filename - Optional filename
 * @param fileType - Optional file type
 * @param albumSlug - Optional album slug. If not provided, uses legacy ALBUM_FOLDER
 */
export async function uploadToAlbum(
  file: Buffer,
  filename?: string,
  fileType?: string,
  albumSlug?: string
): Promise<CloudinaryImage> {
  const isVideo = fileType?.startsWith('video/');
  
  try {
    // Determine the folder to upload to
    let folderName = ALBUM_FOLDER; // Default to legacy folder

    if (albumSlug) {
      const albumConfig = getAlbumConfig(albumSlug);
      if (!albumConfig) {
        throw new Error(`Album configuration not found for slug: ${albumSlug}`);
      }
      folderName = albumConfig.cloudinaryFolder;
    }

    // Determine the MIME type for the data URI
    const mimeType = fileType || (isVideo ? 'video/mp4' : 'image/jpeg');
    const base64String = `data:${mimeType};base64,${file.toString('base64')}`;

    const uploadOptions: UploadApiOptions = {
      folder: folderName,
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
 * @param photoIds - Array of public IDs in the desired order
 * @param albumSlug - Optional album slug. If not provided, uses legacy behavior
 */
export async function setCurrentOrderAsCustom(photoIds: string[], albumSlug?: string): Promise<boolean> {
  try {
    console.log('Setting current order as custom for', photoIds.length, 'items (photos and videos)');

    // Create order updates based on current array order
    const orderUpdates = photoIds.map((publicId, index) => ({
      currentPublicId: publicId,
      newOrder: index,
    }));

    console.log('Order updates to apply:', orderUpdates.slice(0, 5).map(u => ({ id: u.currentPublicId, order: u.newOrder })));

    return await updatePhotoOrder(orderUpdates, albumSlug);
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

export async function updatePhotoOrder(orderUpdates: { currentPublicId: string; newOrder?: number; newSortKey?: string }[], albumSlug?: string): Promise<boolean> {
  try {
    console.log(`🔄 Starting photo order update for ${orderUpdates.length} items`);
    console.log('Order updates:', orderUpdates.map(u => ({ id: u.currentPublicId, order: u.newOrder, key: u.newSortKey })));
    
    // Check Cloudinary configuration
    const config = cloudinary.config();
    console.log('Cloudinary config check:', {
      cloud_name: !!config.cloud_name,
      api_key: !!config.api_key,
      api_secret: !!config.api_secret
    });
    
    // Get resource types by fetching all album photos and matching by public_id
    console.log('🔍 Fetching resource types from album photos...');
    const resourceTypes = new Map<string, string>();

    try {
      // Get all photos from the album to determine resource types
      const allPhotos = await getAlbumPhotos('custom', albumSlug);
      allPhotos.forEach(photo => {
        resourceTypes.set(photo.public_id, photo.resource_type);
      });

      console.log(`📋 Found resource types for ${resourceTypes.size} items`);
    } catch (searchError) {
      console.warn('⚠️ Failed to get album photos, falling back to individual resource calls:', searchError);
    }
    
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
          
          // Get resource type from our album photos or fallback to individual call
          let resourceType = resourceTypes.get(currentPublicId);
          
          if (!resourceType) {
            // Fallback: try individual resource call
            try {
              const resource = await cloudinary.api.resource(currentPublicId);
              resourceType = resource.resource_type;
            } catch (e) {
              console.warn(`⚠️ Could not determine resource type for ${currentPublicId}, defaulting to image`);
              resourceType = 'image';
            }
          }
          
          console.log(`📝 [${globalIndex + 1}/${orderUpdates.length}] Setting sort_order=${paddedOrder} for ${currentPublicId} (${resourceType})`);
          
          let result;
          if (resourceType === 'video') {
            // For videos, try multiple approaches
            console.log(`🎥 Attempting to update video: ${currentPublicId}`);
            
            // First try: use explicit API to update context
            try {
              result = await cloudinary.uploader.explicit(currentPublicId, {
                type: 'upload',
                resource_type: 'video',
                context: `sort_order=${paddedOrder}`
              });
              console.log(`✅ Video context update successful via explicit API`);
            } catch (explicitError) {
              console.warn(`⚠️ Explicit API failed, trying tags:`, explicitError);
              
              // Fallback: try tags
              try {
                result = await cloudinary.uploader.add_tag(`sort_order_${paddedOrder}`, [currentPublicId]);
                console.log(`✅ Video tag update successful`);
              } catch (tagError) {
                console.warn(`⚠️ Tag API also failed, trying context:`, tagError);
                
                // Last resort: try context anyway
                result = await cloudinary.uploader.add_context(`sort_order=${paddedOrder}`, [currentPublicId]);
                console.log(`✅ Video context update successful via context API`);
              }
            }
          } else {
            // For images, use context metadata
            console.log(`🖼️ Using context for image: ${currentPublicId}`);
            result = await cloudinary.uploader.add_context(`sort_order=${paddedOrder}`, [currentPublicId]);
          }
          
          // Verify the update was successful
          // Different APIs return different response formats
          const isSuccess = (result && result.public_ids && result.public_ids.length > 0) || 
                           (result && result.public_id && result.context?.custom?.sort_order) ||
                           (result && result.public_id && result.context?.sort_order);
          
          if (isSuccess) {
            console.log(`✅ [${globalIndex + 1}/${orderUpdates.length}] Update successful for ${currentPublicId} (${resourceType})`);
            return { success: true, publicId: currentPublicId, result };
          } else {
            console.warn(`⚠️ [${globalIndex + 1}/${orderUpdates.length}] Update may have failed for ${currentPublicId} - result:`, result);
            return { success: false, publicId: currentPublicId, error: 'Update returned unexpected result' };
          }
        } catch (error: any) {
          console.error(`❌ [${globalIndex + 1}/${orderUpdates.length}] Update failed for ${currentPublicId}:`, error);
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
      throw new Error(`Failed to update ${failed.length} out of ${orderUpdates.length} items`);
    }
    
    console.log('✅ All updates completed successfully');
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
