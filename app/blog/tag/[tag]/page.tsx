import type { Metadata } from 'next';
import { getAllTags, getPostsByTag } from '@/lib/blog';
import { BlogTagClient } from '@/components/BlogTagClient';

interface BlogTagPageProps {
  params: Promise<{ tag: string }>;
}

// Generate static params for all tags
export async function generateStaticParams() {
  const tags = getAllTags();
  return tags.map((tag) => ({
    tag: tag.toLowerCase(),
  }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: BlogTagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  return {
    title: `Posts tagged "${decodedTag}" | Nickolus Cunningham`,
    description: `Browse all blog posts tagged with "${decodedTag}".`,
  };
}

export default async function BlogTagPage({ params }: BlogTagPageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);

  return <BlogTagClient tag={decodedTag} posts={posts} />;
}
