"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import type { BlogPostMetadata } from '@/lib/blog';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface BlogIndexClientProps {
  posts: BlogPostMetadata[];
}

export function BlogIndexClient({ posts }: BlogIndexClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Background gradient effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/20 via-transparent to-transparent" />
      </div>

      {/* Noise texture */}
      <div className="fixed inset-0 bg-noise opacity-10 mix-blend-overlay pointer-events-none -z-10" />

      {/* Menu Button */}
      <button
        onClick={toggleMenu}
        className="fixed top-8 right-8 z-50 w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-full"
      >
        {menuOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
      </button>

      {/* Navigation Menu */}
      <motion.nav
        initial={false}
        animate={{ x: menuOpen ? "0%" : "100%" }}
        className="fixed inset-0 bg-black z-40 flex items-center justify-center"
      >
        <ul className="space-y-8 text-center">
          {["HOME", "WORK", "ABOUT", "BLOG", "CONTACT"].map((item, index) => (
            <motion.li
              key={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: menuOpen ? 1 : 0,
                y: menuOpen ? 0 : 20,
                transition: { delay: menuOpen ? index * 0.1 : 0 },
              }}
            >
              <Link
                href={item === "BLOG" ? "/blog" : `/#${item.toLowerCase()}`}
                className="text-5xl md:text-7xl font-extralight hover:text-gray-400 transition-colors"
                onClick={toggleMenu}
              >
                {item}
              </Link>
            </motion.li>
          ))}
        </ul>
      </motion.nav>

      <div className="max-w-screen-xl mx-auto px-6 md:px-16 py-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h1 className="text-[15vw] md:text-[10vw] font-black leading-none mb-6">Nick.Overflow</h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl">
            Thoughts on software and creative projects.
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
                        {post.tags.slice(0, 3).map((tag) => (
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
            <p className="text-xl text-gray-500">No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
