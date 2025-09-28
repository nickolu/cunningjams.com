import { NextRequest } from 'next/server';
import { isAuthenticated, isAuthenticatedForAlbum } from '@/lib/auth';
import { getAlbumPhotos, SortOption } from '@/lib/cloudinary';
import { albumExists } from '@/lib/album-config';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  // Get parameters from URL
  const { searchParams } = new URL(request.url);
  const albumSlug = searchParams.get('albumSlug');
  const sortBy = (searchParams.get('sort') as SortOption) || 'custom';

  console.log(`[PHOTOS-${requestId}] 📸 Photos fetch request started for album: ${albumSlug || 'legacy'}`);

  try {
    // Check if album exists (if albumSlug is provided)
    if (albumSlug) {
      console.log(`[PHOTOS-${requestId}] 📂 Checking if album exists...`);
      if (!albumExists(albumSlug)) {
        console.log(`[PHOTOS-${requestId}] ❌ Album not found: ${albumSlug}`);
        return Response.json(
          { error: 'Album not found' },
          { status: 404 }
        );
      }
    }

    // Check if user is authenticated
    console.log(`[PHOTOS-${requestId}] 🔐 Checking authentication...`);
    const authenticated = albumSlug
      ? await isAuthenticatedForAlbum(albumSlug)
      : await isAuthenticated();

    if (!authenticated) {
      console.log(`[PHOTOS-${requestId}] ❌ Authentication failed`);
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.log(`[PHOTOS-${requestId}] ✅ Authentication successful`);

    // Fetch photos from Cloudinary
    console.log(`[PHOTOS-${requestId}] 🔍 Fetching photos from Cloudinary with sort: ${sortBy}...`);
    const fetchStartTime = Date.now();
    
    try {
      const photos = await getAlbumPhotos(sortBy, albumSlug || undefined);
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
          sortBy,
          albumSlug: albumSlug || null,
        }
      });
    } catch (fetchError) {
      console.error(`[PHOTOS-${requestId}] 💥 Error in getAlbumPhotos:`, fetchError);
      throw fetchError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[PHOTOS-${requestId}] 💥 Error fetching photos (${totalTime}ms):`, error);
    return Response.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
