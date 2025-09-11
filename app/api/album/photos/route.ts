import { NextRequest } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAlbumPhotos } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const authenticated = await isAuthenticated();
    
    if (!authenticated) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch photos from Cloudinary
    const photos = await getAlbumPhotos();

    return Response.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return Response.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    );
  }
}
