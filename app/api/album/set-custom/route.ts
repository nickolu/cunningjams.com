import { NextRequest } from 'next/server';
import { isAdmin, isAdminForAlbum } from '@/lib/auth';
import { setCurrentOrderAsCustom } from '@/lib/cloudinary';
import { albumExists } from '@/lib/album-config';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  // Get album slug from query parameters
  const { searchParams } = new URL(request.url);
  const albumSlug = searchParams.get('albumSlug');

  console.log(`[SET-CUSTOM-${requestId}] 🎯 Set custom order request started for album: ${albumSlug || 'legacy'}`);

  try {
    // Check if album exists (if albumSlug is provided)
    if (albumSlug) {
      console.log(`[SET-CUSTOM-${requestId}] 📂 Checking if album exists...`);
      if (!albumExists(albumSlug)) {
        console.log(`[SET-CUSTOM-${requestId}] ❌ Album not found: ${albumSlug}`);
        return Response.json(
          { error: 'Album not found' },
          { status: 404 }
        );
      }
    }

    // Check if user has admin privileges
    console.log(`[SET-CUSTOM-${requestId}] 🔐 Checking admin authentication...`);
    const isAdminUser = albumSlug
      ? await isAdminForAlbum(albumSlug)
      : await isAdmin();

    if (!isAdminUser) {
      console.log(`[SET-CUSTOM-${requestId}] ❌ Admin authentication failed`);
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    console.log(`[SET-CUSTOM-${requestId}] ✅ Admin authentication successful`);

    // Get the photo IDs from request body
    const { photoIds } = await request.json();
    
    if (!Array.isArray(photoIds)) {
      return Response.json(
        { error: 'photoIds must be an array' },
        { status: 400 }
      );
    }

    // Set the current order as custom
    console.log(`[SET-CUSTOM-${requestId}] 🔍 Setting custom order for ${photoIds.length} photos...`);
    const updateStartTime = Date.now();
    const success = await setCurrentOrderAsCustom(photoIds, albumSlug || undefined);
    const updateTime = Date.now() - updateStartTime;

    if (!success) {
      console.log(`[SET-CUSTOM-${requestId}] ❌ Failed to set custom order`);
      return Response.json(
        { error: 'Failed to set custom order' },
        { status: 500 }
      );
    }

    const totalTime = Date.now() - startTime;

    console.log(`[SET-CUSTOM-${requestId}] ✅ Custom order set successfully in ${totalTime}ms`);

    return Response.json({
      success: true,
      message: 'Current order saved as custom order',
      metadata: {
        updatedCount: photoIds.length,
        updateTime,
        totalTime,
        requestId,
        albumSlug: albumSlug || null,
      }
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[SET-CUSTOM-${requestId}] 💥 Error setting custom order (${totalTime}ms):`, error);
    return Response.json(
      { error: 'Failed to set custom order' },
      { status: 500 }
    );
  }
}
