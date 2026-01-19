"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Tag } from 'lucide-react';

interface TagCount {
  tag: string;
  count: number;
}

interface BlogTagsClientProps {
  tags: TagCount[];
}

export function BlogTagsClient({ tags }: BlogTagsClientProps) {
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
            BACK TO BLOG
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h1 className="text-[15vw] md:text-[10vw] font-black leading-none mb-6">TAGS</h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl">
            Browse posts by topic. {tags.length} {tags.length === 1 ? 'tag' : 'tags'} available.
          </p>
        </motion.div>

        {/* Tags Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tags.map((tagItem, index) => (
            <motion.div
              key={tagItem.tag}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
            >
              <Link
                href={`/blog/tag/${tagItem.tag.toLowerCase()}`}
                className="group block border border-white/10 p-6 hover:border-white/30 hover:bg-white/5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <Tag className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
                  <span className="text-3xl font-bold text-gray-600 group-hover:text-gray-400 transition-colors">
                    {tagItem.count}
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2 group-hover:text-gray-300 transition-colors">
                  {tagItem.tag}
                </h2>
                <p className="text-sm text-gray-500">
                  {tagItem.count} {tagItem.count === 1 ? 'post' : 'posts'}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        {tags.length === 0 && (
          <div className="text-center py-24">
            <p className="text-xl text-gray-500">No tags found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
