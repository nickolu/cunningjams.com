import type { Metadata } from 'next';
import { getAllPosts } from '@/lib/blog';
import { BlogIndexClient } from '@/components/BlogIndexClient';

export const metadata: Metadata = {
  title: 'Blog | Nickolus Cunningham',
  description: 'Thoughts on web development, music production, and creative projects.',
};

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogIndexClient posts={posts} />;
}
