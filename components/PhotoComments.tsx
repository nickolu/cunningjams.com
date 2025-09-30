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
  // Format: albumSlug/public_id or just public_id for legacy
  const identifier = albumSlug
    ? `${albumSlug}/${photo.public_id}`
    : photo.public_id;

  // Create a URL for this photo (used by Disqus for tracking)
  const url = typeof window !== 'undefined'
    ? `${window.location.origin}/album/${albumSlug || 'default'}?photo=${encodeURIComponent(photo.public_id)}`
    : '';

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