import { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { uploadToAlbum } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[UPLOAD-${requestId}] 🚀 Upload request started at ${new Date().toISOString()}`);

  try {
    // Check if user is authenticated
    console.log(`[UPLOAD-${requestId}] 🔐 Checking authentication...`);
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      console.log(`[UPLOAD-${requestId}] ❌ Authentication failed`);
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log(`[UPLOAD-${requestId}] ✅ Authentication successful`);

    console.log(`[UPLOAD-${requestId}] 📋 Parsing form data...`);
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      console.log(`[UPLOAD-${requestId}] ❌ No files provided`);
      return Response.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`[UPLOAD-${requestId}] 📁 Processing ${files.length} file(s):`);
    files.forEach((file, index) => {
      console.log(`[UPLOAD-${requestId}]   ${index + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB, ${file.type})`);
    });

    const uploadResults = [];
    const errors = [];

    // Process files one by one to avoid overwhelming Cloudinary
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileStartTime = Date.now();
      console.log(`[UPLOAD-${requestId}] 📤 Processing file ${i + 1}/${files.length}: ${file.name}`);
      
      try {
        // Validate file type
        console.log(`[UPLOAD-${requestId}]   🔍 Validating file type: ${file.type}`);
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
          console.log(`[UPLOAD-${requestId}]   ❌ Invalid file type: ${file.type}`);
          errors.push(`${file.name}: Not a supported media file`);
          continue;
        }

        // Validate file size (100MB limit for videos, 10MB for images)
        const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        console.log(`[UPLOAD-${requestId}]   📏 File size: ${fileSizeMB}MB`);
        
        if (file.size > maxSize) {
          const maxSizeText = file.type.startsWith('video/') ? '100MB' : '10MB';
          console.log(`[UPLOAD-${requestId}]   ❌ File too large: ${fileSizeMB}MB > ${maxSizeText}`);
          errors.push(`${file.name}: File too large (max ${maxSizeText})`);
          continue;
        }

        // Convert file to buffer
        console.log(`[UPLOAD-${requestId}]   🔄 Converting file to buffer...`);
        const bufferStartTime = Date.now();
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const bufferTime = Date.now() - bufferStartTime;
        console.log(`[UPLOAD-${requestId}]   ✅ Buffer conversion completed in ${bufferTime}ms`);

        // Upload to Cloudinary
        console.log(`[UPLOAD-${requestId}]   ☁️ Uploading to Cloudinary...`);
        const cloudinaryStartTime = Date.now();
        const result = await uploadToAlbum(buffer, file.name, file.type);
        const cloudinaryTime = Date.now() - cloudinaryStartTime;
        console.log(`[UPLOAD-${requestId}]   ✅ Cloudinary upload completed in ${cloudinaryTime}ms`);
        const fileTime = Date.now() - fileStartTime;
        console.log(`[UPLOAD-${requestId}]   🎉 File upload successful! Total time: ${fileTime}ms`);
        console.log(`[UPLOAD-${requestId}]   📋 Result: ${result.public_id} (${result.resource_type})`);
        
        uploadResults.push({
          filename: file.name,
          public_id: result.public_id,
          secure_url: result.secure_url,
          success: true,
        });
      } catch (error) {
        const fileTime = Date.now() - fileStartTime;
        console.error(`[UPLOAD-${requestId}]   💥 Error uploading ${file.name} (${fileTime}ms):`, error);
        errors.push(`${file.name}: Upload failed`);
      }
    }

    const totalTime = Date.now() - startTime;
    const avgTimePerFile = files.length > 0 ? (totalTime / files.length).toFixed(0) : 0;
    
    console.log(`[UPLOAD-${requestId}] 📊 Upload batch completed:`);
    console.log(`[UPLOAD-${requestId}]   ✅ Successful: ${uploadResults.length}`);
    console.log(`[UPLOAD-${requestId}]   ❌ Failed: ${errors.length}`);
    console.log(`[UPLOAD-${requestId}]   ⏱️ Total time: ${totalTime}ms`);
    console.log(`[UPLOAD-${requestId}]   ⚡ Average per file: ${avgTimePerFile}ms`);
    console.log(`[UPLOAD-${requestId}] 🏁 Request completed at ${new Date().toISOString()}`);

    return Response.json({
      success: uploadResults.length > 0,
      uploaded: uploadResults,
      errors,
      total: files.length,
      successful: uploadResults.length,
      failed: errors.length,
      metrics: {
        totalTime,
        avgTimePerFile: Number(avgTimePerFile),
        requestId,
      }
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[UPLOAD-${requestId}] 💥 Fatal upload error (${totalTime}ms):`, error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
