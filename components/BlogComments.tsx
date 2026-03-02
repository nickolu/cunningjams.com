'use client';

import Giscus from '@giscus/react';

interface BlogCommentsProps {
  slug: string;
}

export function BlogComments({ slug }: BlogCommentsProps) {
  return (
    <div className="mt-16 pt-12 border-t border-white/10">
      <h2 className="text-2xl font-bold mb-8">Comments</h2>
      <Giscus
        repo="nickolu/cunningjams.com"
        repoId={process.env.NEXT_PUBLIC_GISCUS_REPO_ID || ''}
        category={process.env.NEXT_PUBLIC_GISCUS_CATEGORY || 'Blog Comments'}
        categoryId={process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || ''}
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="dark_tritanopia"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
