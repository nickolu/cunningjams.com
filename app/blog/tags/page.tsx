import type { Metadata } from 'next';
import { getAllTags, getAllPosts } from '@/lib/blog';
import { BlogTagsClient } from '@/components/BlogTagsClient';

export const metadata: Metadata = {
  title: 'Browse Tags | Blog | Nickolus Cunningham',
  description: 'Browse all blog post tags and topics.',
};

export default function BlogTagsPage() {
  const allPosts = getAllPosts();
  const allTags = getAllTags();

  // Count posts per tag
  const tagCounts = allTags.map((tag) => ({
    tag,
    count: allPosts.filter((post) =>
      post.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
    ).length,
  }));

  return <BlogTagsClient tags={tagCounts} />;
}
