import { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { setCurrentOrderAsCustom } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[SET-CUSTOM-${requestId}] 🎯 Set custom order request started`);

  try {
    // Check if user has admin privileges
    console.log(`[SET-CUSTOM-${requestId}] 🔐 Checking admin authentication...`);
    const isAdminUser = await isAdmin();
    
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
    const success = await setCurrentOrderAsCustom(photoIds);
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
