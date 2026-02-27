"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface BlogPostClientProps {
  post: {
    slug: string;
    title: string;
    date: string;
    description: string;
    author: string;
    tags: string[];
  };
  mdxContent: ReactNode;
}

export function BlogPostClient({ post, mdxContent }: BlogPostClientProps) {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Background gradient effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/20 via-transparent to-transparent" />
      </div>

      {/* Noise texture */}
      <div className="fixed inset-0 bg-noise opacity-10 mix-blend-overlay pointer-events-none -z-10" />

      <div className="max-w-screen-xl mx-auto px-6 md:px-16 py-16">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-lg mb-12 hover:text-gray-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK TO BLOG
          </Link>
        </motion.div>

        {/* Post header */}
        <article className="max-w-4xl">
          <motion.header
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <div className="flex items-center gap-4 mb-6">
              <time className="text-sm text-gray-500 tracking-wider">
                {formatDate(post.date).toUpperCase()}
              </time>
              <div className="flex gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog/tag/${tag.toLowerCase()}`}
                    className="text-xs text-gray-500 border border-white/20 px-2 py-1 hover:bg-white/5 transition-colors"
                  >
                    {tag.toUpperCase()}
                  </Link>
                ))}
              </div>
            </div>
            <h1 className="text-[8vw] md:text-[6vw] lg:text-6xl font-black leading-none mb-6">
              {post.title}
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 leading-relaxed">
              {post.description}
            </p>
          </motion.header>

          {/* MDX content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="prose prose-lg prose-invert max-w-none"
            style={{
              '--tw-prose-body': '#d1d5db',
              '--tw-prose-headings': '#ffffff',
              '--tw-prose-links': '#ffffff',
              '--tw-prose-bold': '#ffffff',
              '--tw-prose-code': '#ffffff',
              '--tw-prose-quotes': '#9ca3af',
            } as any}
          >
            {mdxContent}
          </motion.div>

          {/* Post footer */}
          <motion.footer
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-24 pt-12 border-t border-white/10"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <p className="text-lg text-gray-500">
                Written by <span className="text-white">{post.author}</span>
              </p>
              <Link
                href="/blog"
                className="flex items-center gap-2 border border-white/20 px-6 py-3 hover:bg-white/5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                ALL POSTS
              </Link>
            </div>
          </motion.footer>
        </article>
      </div>
    </div>
  );
}
