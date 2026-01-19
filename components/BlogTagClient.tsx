"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import type { BlogPostMetadata } from '@/lib/blog';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface BlogTagClientProps {
  tag: string;
  posts: BlogPostMetadata[];
}

export function BlogTagClient({ tag, posts }: BlogTagClientProps) {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Background gradient effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/20 via-transparent to-transparent" />
      </div>

      {/* Noise texture */}
      <div className="fixed inset-0 bg-noise opacity-10 mix-blend-overlay pointer-events-none -z-10" />

      <div className="max-w-screen-xl mx-auto px-6 md:px-16 py-32">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-lg hover:text-gray-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            BACK TO ALL POSTS
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm text-gray-500 tracking-wider">TAGGED WITH</span>
            <span className="text-sm border border-white/20 px-3 py-1 text-gray-400">
              {tag.toUpperCase()}
            </span>
          </div>
          <h1 className="text-[15vw] md:text-[10vw] font-black leading-none mb-6">
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} found
          </p>
        </motion.div>

        {/* Posts Grid */}
        <div className="space-y-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="group border-b border-white/10 pb-8 hover:border-white/30 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <time className="text-sm text-gray-500 tracking-wider">
                        {formatDate(post.date).toUpperCase()}
                      </time>
                      <div className="flex gap-2">
                        {post.tags.slice(0, 3).map((postTag) => (
                          <span
                            key={postTag}
                            className={`text-xs border border-white/20 px-2 py-1 ${
                              postTag.toLowerCase() === tag.toLowerCase()
                                ? 'text-white bg-white/10'
                                : 'text-gray-500'
                            }`}
                          >
                            {postTag.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 group-hover:text-gray-300 transition-colors cursor-pointer">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-lg text-gray-400 leading-relaxed">
                      {post.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="flex items-center gap-2 text-sm border border-white/20 px-4 py-2 group-hover:bg-white/5 transition-colors cursor-pointer">
                        READ
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-24">
            <p className="text-xl text-gray-500">No posts found with this tag.</p>
          </div>
        )}
      </div>
    </div>
  );
}
