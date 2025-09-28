import { Suspense } from 'react';
import { Metadata } from 'next';
import { PhotoGallery } from '@/components/PhotoGallery';
import { LoadingGallery } from '@/components/LoadingGallery';
import { albumExists, getAlbumConfig } from '@/lib/album-config';
import { notFound } from 'next/navigation';

interface AlbumPageProps {
  params: { albumSlug: string };
}

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { albumSlug } = await params;

  if (!albumExists(albumSlug)) {
    return {
      title: 'Album Not Found',
      description: 'The requested photo album could not be found.',
    };
  }

  const albumConfig = getAlbumConfig(albumSlug);
  if (!albumConfig) {
    return {
      title: 'Album Error',
      description: 'There was an error loading the album configuration.',
    };
  }

  return {
    title: `${albumConfig.title} - Photo Album`,
    description: `View photos from ${albumConfig.title} - ${albumConfig.subtitle}. Private photo album with shared memories and moments.`,
    openGraph: {
      title: albumConfig.title,
      description: albumConfig.subtitle,
      type: 'website',
      images: [
        {
          url: '/og-image.png', // You can add a dynamic image later if needed
          width: 1200,
          height: 630,
          alt: albumConfig.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: albumConfig.title,
      description: albumConfig.subtitle,
    },
    robots: {
      index: false, // Don't index private photo albums
      follow: false,
    },
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { albumSlug } = await params;

  // Check if album exists and get configuration
  if (!albumExists(albumSlug)) {
    notFound();
  }

  const albumConfig = getAlbumConfig(albumSlug);
  if (!albumConfig) {
    throw new Error(`Album configuration not found for: ${albumSlug}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<LoadingGallery />}>
        <PhotoGallery albumSlug={albumSlug} />
      </Suspense>
    </div>
  );
}