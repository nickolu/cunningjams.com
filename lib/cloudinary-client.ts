// Client-safe Cloudinary utilities (no server dependencies)

export interface CloudinaryMedia {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  created_at: string;
  bytes: number;
  original_filename?: string;
  resource_type: 'image' | 'video';
  duration?: number; // For videos
}

// Keep backward compatibility
export type CloudinaryImage = CloudinaryMedia;

/**
 * Generates optimized image URLs for different use cases
 * This is client-safe as it just builds URLs
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

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
  let transformation = `q_${quality},f_${format}`;
  
  if (width || height) {
    transformation += `,c_${crop}`;
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * Generates a download URL for an image
 */
export function getDownloadUrl(publicId: string): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
  return `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/${publicId}`;
}
