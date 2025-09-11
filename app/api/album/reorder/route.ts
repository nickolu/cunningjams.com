import { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { updateCustomOrder } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  console.log(`[REORDER-${requestId}] 🔄 Reorder request started`);

  try {
    // Check if user has admin privileges
    console.log(`[REORDER-${requestId}] 🔐 Checking admin authentication...`);
    const isAdminUser = await isAdmin();
    
    if (!isAdminUser) {
      console.log(`[REORDER-${requestId}] ❌ Admin authentication failed`);
      return Response.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    console.log(`[REORDER-${requestId}] ✅ Admin authentication successful`);

    // Get the new order from request body
    const { photoIds } = await request.json();
    
    if (!Array.isArray(photoIds)) {
      return Response.json(
        { error: 'photoIds must be an array' },
        { status: 400 }
      );
    }

    // Create order updates
    const orderUpdates = photoIds.map((publicId: string, index: number) => ({
      publicId,
      order: index,
    }));

    // Update custom order in Cloudinary
    console.log(`[REORDER-${requestId}] 🔍 Updating custom order for ${orderUpdates.length} photos...`);
    const updateStartTime = Date.now();
    const success = await updateCustomOrder(orderUpdates);
    const updateTime = Date.now() - updateStartTime;

    if (!success) {
      console.log(`[REORDER-${requestId}] ❌ Failed to update custom order`);
      return Response.json(
        { error: 'Failed to update photo order' },
        { status: 500 }
      );
    }

    const totalTime = Date.now() - startTime;
    
    console.log(`[REORDER-${requestId}] ✅ Custom order updated successfully in ${totalTime}ms`);

    return Response.json({ 
      success: true,
      metadata: {
        updatedCount: orderUpdates.length,
        updateTime,
        totalTime,
        requestId,
      }
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[REORDER-${requestId}] 💥 Error updating photo order (${totalTime}ms):`, error);
    return Response.json(
      { error: 'Failed to update photo order' },
      { status: 500 }
    );
  }
}
