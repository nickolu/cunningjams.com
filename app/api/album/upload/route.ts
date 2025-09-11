import { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { uploadToAlbum } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
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

    console.log(`📤 Uploading ${files.length} file(s)`);

    const uploadResults = [];
    const errors = [];

    // Process files one by one to avoid overwhelming Cloudinary
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Validate file type
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          errors.push(`${file.name}: Not a supported media file`);
          continue;
        }

        // Validate file size (100MB limit for videos, 10MB for images)
        const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          const maxSizeText = file.type.startsWith('video/') ? '100MB' : '10MB';
          errors.push(`${file.name}: File too large (max ${maxSizeText})`);
          continue;
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary
        const result = await uploadToAlbum(buffer, file.name, file.type);
        
        uploadResults.push({
          filename: file.name,
          public_id: result.public_id,
          secure_url: result.secure_url,
          success: true,
        });
        
        console.log(`✅ ${file.name} uploaded successfully`);
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error);
        errors.push(`${file.name}: Upload failed`);
      }
    }

    const totalTime = Date.now() - startTime;
    
    console.log(`📊 Upload completed: ${uploadResults.length} successful, ${errors.length} failed (${totalTime}ms)`);

    return Response.json({
      success: uploadResults.length > 0,
      uploaded: uploadResults,
      errors,
      total: files.length,
      successful: uploadResults.length,
      failed: errors.length,
    });
  } catch (error) {
    console.error(`💥 Upload error:`, error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
