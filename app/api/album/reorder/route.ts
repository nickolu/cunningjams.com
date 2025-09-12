import { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { updatePhotoOrder } from '@/lib/cloudinary';

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
    const body = await request.json();
    const { photoIds, updates } = body || {};

    if (!Array.isArray(photoIds) && !Array.isArray(updates)) {
      return Response.json(
        { error: 'Provide either photoIds (array) or updates (array)' },
        { status: 400 }
      );
    }

    // Create order updates from either full array or partial updates
    const orderUpdates = Array.isArray(updates)
      ? updates.map((u: any) => ({
          currentPublicId: u.publicId ?? u.currentPublicId,
          newOrder: typeof u.newIndex === 'number' ? u.newIndex : u.newOrder,
          newSortKey: u.newSortKey,
        })).filter((u: any) => !!u.currentPublicId && (typeof u.newOrder === 'number' || typeof u.newSortKey === 'string'))
      : (photoIds as string[]).map((publicId: string, index: number) => ({
          currentPublicId: publicId,
          newOrder: index,
        }));

    // Update photo order by renaming public IDs
    console.log(`[REORDER-${requestId}] 🔍 Updating photo order for ${orderUpdates.length} photos...`);
    const updateStartTime = Date.now();
    
    try {
      const success = await updatePhotoOrder(orderUpdates);
      const updateTime = Date.now() - updateStartTime;

      if (!success) {
        console.log(`[REORDER-${requestId}] ❌ Failed to update custom order - updatePhotoOrder returned false`);
        return Response.json(
          { error: 'Failed to update photo order - operation returned false' },
          { status: 500 }
        );
      }
      
      const totalTime = Date.now() - startTime;
      console.log(`[REORDER-${requestId}] ✅ Custom order updated successfully in ${totalTime}ms (update: ${updateTime}ms)`);

      return Response.json({ 
        success: true,
        metadata: {
          updatedCount: orderUpdates.length,
          updateTime,
          totalTime,
          requestId,
        }
      });
    } catch (updateError) {
      const updateTime = Date.now() - updateStartTime;
      console.error(`[REORDER-${requestId}] ❌ Exception during photo order update (${updateTime}ms):`, updateError);
      return Response.json(
        { 
          error: 'Failed to update photo order - exception occurred',
          details: updateError instanceof Error ? updateError.message : String(updateError)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`[REORDER-${requestId}] 💥 Error updating photo order (${totalTime}ms):`, error);
    return Response.json(
      { error: 'Failed to update photo order' },
      { status: 500 }
    );
  }
}
