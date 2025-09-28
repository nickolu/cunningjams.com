import { Metadata } from 'next';
import { getAlbumConfig } from '@/lib/album-config';
import { notFound } from 'next/navigation';
import { AlbumPasswordForm } from './AlbumPasswordForm';

interface AlbumPasswordPageProps {
  params: { albumSlug: string };
}

export async function generateMetadata({ params }: AlbumPasswordPageProps): Promise<Metadata> {
  const { albumSlug } = await params;
  const albumConfig = getAlbumConfig(albumSlug);

  if (!albumConfig) {
    return {
      title: 'Album Access - Password Required',
      description: 'Enter password to access this private photo album.',
    };
  }

  return {
    title: `${albumConfig.title} - Enter Password`,
    description: `Enter password to access ${albumConfig.title} - ${albumConfig.subtitle}`,
    robots: {
      index: false, // Don't index password pages
      follow: false,
    },
  };
}

export default async function AlbumPasswordPage({ params }: AlbumPasswordPageProps) {
  const { albumSlug } = await params;

  // Get album configuration on the server
  const albumConfig = getAlbumConfig(albumSlug);
  if (!albumConfig) {
    notFound();
  }

  return <AlbumPasswordForm albumSlug={albumSlug} albumConfig={albumConfig} />;
}