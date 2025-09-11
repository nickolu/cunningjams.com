import { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { uploadToAlbum } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return Response.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    const uploadResults = [];
    const errors = [];

    // Process files one by one to avoid overwhelming Cloudinary
    for (const file of files) {
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name}: Not an image file`);
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          errors.push(`${file.name}: File too large (max 10MB)`);
          continue;
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadToAlbum(buffer, file.name);
        uploadResults.push({
          filename: file.name,
          public_id: result.public_id,
          secure_url: result.secure_url,
          success: true,
        });
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        errors.push(`${file.name}: Upload failed`);
      }
    }

    return Response.json({
      success: uploadResults.length > 0,
      uploaded: uploadResults,
      errors,
      total: files.length,
      successful: uploadResults.length,
      failed: errors.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
