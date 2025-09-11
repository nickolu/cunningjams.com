import { NextRequest } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { deleteImages } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const adminStatus = await isAdmin();
    if (!adminStatus) {
      return Response.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { photoIds } = body;

    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return Response.json(
        { error: 'Invalid request. photoIds array is required.' },
        { status: 400 }
      );
    }

    console.log(`Admin deleting ${photoIds.length} photos:`, photoIds);

    // Delete photos from Cloudinary using bulk delete for better performance
    const result = await deleteImages(photoIds);
    
    console.log(`Deletion complete: ${result.successful.length} successful, ${result.failed.length} failed`);

    return Response.json({
      success: true,
      deleted: result.successful.length,
      failed: result.failed.length,
      successful: result.successful,
      failedIds: result.failed,
      message: result.failed.length > 0 
        ? `${result.successful.length} photos deleted successfully, ${result.failed.length} failed`
        : `${result.successful.length} photos deleted successfully`
    });

  } catch (error) {
    console.error('Delete photos error:', error);
    return Response.json(
      { error: 'Failed to delete photos' },
      { status: 500 }
    );
  }
}
