'use client';

import { DiscussionEmbed } from 'disqus-react';
import { CloudinaryImage } from '@/lib/cloudinary-client';

interface PhotoCommentsProps {
  photo: CloudinaryImage;
  albumSlug?: string;
}

export function PhotoComments({ photo, albumSlug }: PhotoCommentsProps) {
  // Get Disqus shortname from environment variable
  const disqusShortname = process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || 'your-site';

  // Create a unique identifier for this photo
  // Use public_id directly as it already contains the full path (e.g., "2025-vinhs-cabin/photo_id")
  const identifier = photo.public_id;

  // Create a URL for this photo (used by Disqus for tracking)
  // Always use production URL to avoid localhost issues with Disqus
  const productionUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cunningjams.com';
  const url = `${productionUrl}/album/${albumSlug || 'default'}?photo=${encodeURIComponent(photo.public_id)}`;

  // Title for the comment thread
  const title = photo.original_filename || `Photo ${photo.public_id.split('/').pop()}`;

  const disqusConfig = {
    url,
    identifier,
    title,
  };

  return (
    <div className="w-full">
      <DiscussionEmbed
        shortname={disqusShortname}
        config={disqusConfig}
      />
    </div>
  );
}