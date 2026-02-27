# Blog System Documentation

## Overview

Your Next.js site now includes a fully functional MDX-based blog with static generation, SEO optimization, and custom components.

## Features

- ✅ **MDX Support** - Write blog posts in Markdown with React components
- ✅ **Static Generation** - All posts are pre-rendered at build time for optimal performance
- ✅ **Syntax Highlighting** - Code blocks with GitHub Dark theme
- ✅ **SEO Optimized** - Metadata, Open Graph tags, and structured data
- ✅ **Typography** - Beautiful prose styling with @tailwindcss/typography
- ✅ **Custom Components** - Callouts, feature cards, enhanced images, and more
- ✅ **Tag Support** - Organize posts with tags
- ✅ **Version Control** - Blog content lives in Git

## Writing Blog Posts

### Creating a New Post

1. Create a new `.mdx` file in `content/blog/`
2. Add frontmatter at the top:

```mdx
---
title: "Your Post Title"
date: "2026-01-19"
description: "A brief description for SEO and the blog index"
author: "Nickolus Cunningham"
tags: ["nextjs", "tutorial", "webdev"]
---

# Your Post Title

Your content goes here...
```

### Frontmatter Fields

- **title** (required): The post title
- **date** (required): Publication date in YYYY-MM-DD format
- **description** (required): Brief description for SEO and post listings
- **author** (required): Author name
- **tags** (optional): Array of tags for categorization

### Markdown Features

All standard Markdown syntax is supported:

- **Bold** and *italic* text
- [Links](https://example.com)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Blockquotes
- Tables (via remark-gfm)
- Task lists (via remark-gfm)

### Custom MDX Components

You can use these React components in your MDX files:

#### Callouts

```mdx
<Callout type="info" title="Pro Tip">
  This is an informational callout!
</Callout>

<Callout type="warning" title="Warning">
  Be careful with this!
</Callout>

<Callout type="error" title="Error">
  Something went wrong!
</Callout>

<Callout type="success" title="Success">
  Everything worked perfectly!
</Callout>
```

#### Feature Cards

```mdx
<FeatureCard title="Amazing Feature" description="A brief description">
  More detailed content about this feature.
</FeatureCard>
```

#### Images

```mdx
<Image 
  src="/images/my-photo.jpg" 
  alt="Description" 
  width={800} 
  height={600} 
/>
```

## File Structure

```
your-app/
├── app/
│   └── blog/
│       ├── page.tsx                 # Blog index page
│       └── [slug]/
│           └── page.tsx             # Individual blog post page
├── content/
│   └── blog/
│       ├── post-one.mdx             # Blog posts
│       ├── post-two.mdx
│       └── post-three.mdx
├── lib/
│   └── blog.ts                      # Blog utility functions
└── components/
    └── mdx-components.tsx           # Custom MDX components
```

## Deployment

The blog works seamlessly with your existing deployment:

1. **Build**: Run `pnpm build` to generate static pages
2. **Deploy**: Push to your Git repository (Vercel will auto-deploy)

All blog posts are statically generated at build time, ensuring:
- Fast page loads
- Excellent SEO
- No runtime processing needed

## Development Workflow

### Local Development

```bash
pnpm dev
```

Visit `http://localhost:3000/blog` to see your blog.

### Adding a New Post

1. Create a new `.mdx` file in `content/blog/`
2. Add frontmatter with all required fields
3. Write your content using Markdown and MDX components
4. Save the file
5. Refresh your browser to see the new post

### Preview Before Publishing

Since content is version-controlled:
1. Create a branch for your new post
2. Test locally with `pnpm dev`
3. Build with `pnpm build` to verify static generation
4. Commit and push when ready
5. Merge to main to publish

## Extending the Blog

### Adding More MDX Components

Edit `components/mdx-components.tsx` to add new components:

```typescript
export const MDXComponents = {
  // ... existing components
  
  YourCustomComponent: (props) => {
    return <div>Your custom component</div>;
  },
};
```

### Customizing Styles

- **Typography**: Edit Tailwind config to customize prose styles
- **Syntax highlighting**: Change the theme in `app/blog/[slug]/page.tsx` (import different highlight.js theme)
- **Layout**: Modify `app/blog/page.tsx` and `app/blog/[slug]/page.tsx`

### Adding Features

Some ideas for enhancement:
- **Search**: Add client-side search with Fuse.js
- **Related posts**: Use tags to show related content
- **Reading time**: Calculate from content length
- **Table of contents**: Extract headings for in-page navigation
- **RSS feed**: Generate from blog posts
- **Comments**: Already have Disqus, can integrate per-post

## Troubleshooting

### Build fails with "Cannot read frontmatter"

- Ensure all MDX files have valid YAML frontmatter
- Check that frontmatter is surrounded by `---` markers
- Verify all required fields are present

### Syntax highlighting not working

- Ensure highlight.js CSS is imported in the post page
- Check that code blocks have language specified: \`\`\`typescript

### Images not loading

- Place images in `public/` directory
- Reference with absolute path: `/images/photo.jpg`
- Use the `<Image>` component for optimization

## Blog CMS

A browser-based CMS tool is available as a sibling directory at `../blog-cms/`.

To use it:
```bash
cd ../blog-cms
pnpm dev
```

Then open http://localhost:5173 and select the `content/blog/` directory.

See `../blog-cms/README.md` for full documentation.

## Next Steps

Your blog is ready to use! Consider:

1. Writing your first real post
2. Adding a link to `/blog` in your main navigation
3. Using the CMS tool for easier editing (see above)
4. Configuring analytics to track post views
5. Adding an RSS feed for subscribers

Enjoy your new MDX-powered blog! 🎉
