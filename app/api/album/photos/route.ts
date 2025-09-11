import { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAlbumPhotos } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[PHOTOS-${requestId}] 📸 Photos fetch request started`);

  try {
    // Check if user is authenticated
    console.log(`[PHOTOS-${requestId}] 🔐 Checking authentication...`);
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      console.log(`[PHOTOS-${requestId}] ❌ Authentication failed`);
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log(`[PHOTOS-${requestId}] ✅ Authentication successful`);

    // Fetch photos from Cloudinary
    console.log(`[PHOTOS-${requestId}] 🔍 Fetching photos from Cloudinary...`);
    const fetchStartTime = Date.now();
    const photos = await getAlbumPhotos();
    const fetchTime = Date.now() - fetchStartTime;

    const totalTime = Date.now() - startTime;
    const imageCount = photos.filter(p => p.resource_type === 'image').length;
    const videoCount = photos.filter(p => p.resource_type === 'video').length;
    
    console.log(`[PHOTOS-${requestId}] ✅ Photos fetched successfully in ${totalTime}ms`);
    console.log(`[PHOTOS-${requestId}] 📊 Found ${photos.length} items: ${imageCount} images, ${videoCount} videos`);

    return Response.json({ 
      photos,
      metadata: {
        totalCount: photos.length,
        imageCount,
        videoCount,
        fetchTime,
        totalTime,
        requestId,
      }
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[PHOTOS-${requestId}] 💥 Error fetching photos (${totalTime}ms):`, error);
    return Response.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
