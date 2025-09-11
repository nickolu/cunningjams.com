import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const ALBUM_FOLDER = '2025-steves-40th';

export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  bytes: number;
  original_filename?: string;
}

/**
 * Fetches all images from the album folder
 */
export async function getAlbumPhotos(): Promise<CloudinaryImage[]> {
  try {
    const result = await cloudinary.search
      .expression(`folder:${ALBUM_FOLDER}`)
      .sort_by('created_at', 'desc')
      .max_results(500) // Adjust as needed
      .execute();

    return result.resources.map((resource: any) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      width: resource.width,
      height: resource.height,
      format: resource.format,
      created_at: resource.created_at,
      bytes: resource.bytes,
      original_filename: resource.original_filename,
    }));
  } catch (error) {
    console.error('Error fetching album photos:', error);
    
    // If the folder doesn't exist yet, return empty array instead of throwing
    if (error && typeof error === 'object' && 'error' in error) {
      const cloudinaryError = error.error as any;
      if (cloudinaryError?.http_code === 400 || cloudinaryError?.message?.includes('folder')) {
        console.log('Album folder not found, returning empty array');
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
  filename?: string
): Promise<CloudinaryImage> {
  try {
    // Convert buffer to base64 data URI for Cloudinary
    const base64String = `data:image/jpeg;base64,${file.toString('base64')}`;
    
    const result = await cloudinary.uploader.upload(base64String, {
      folder: ALBUM_FOLDER,
      public_id: filename ? filename.replace(/\.[^/.]+$/, '') : undefined, // Remove extension
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      created_at: result.created_at,
      bytes: result.bytes,
      original_filename: result.original_filename,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
}

/**
 * Generates optimized image URLs for different use cases
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
    crop?: string;
  } = {}
): string {
  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;

  let transformation = `q_${quality},f_${format}`;
  
  if (width || height) {
    transformation += `,c_${crop}`;
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
  }

  return cloudinary.url(publicId, {
    transformation,
  });
}

/**
 * Generates a download URL for an image
 */
export function getDownloadUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    flags: 'attachment',
  });
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
