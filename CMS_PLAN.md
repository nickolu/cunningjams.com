# Blog CMS Tool - Implementation Plan

## Overview

A lightweight, browser-based CMS for managing MDX blog posts. Runs entirely client-side using the File System Access API, no server required.

## Architecture

### Technology Stack

- **Framework**: Vite + React + TypeScript
- **Editor**: TipTap (extensible WYSIWYG editor)
- **UI Components**: shadcn/ui (same as main site)
- **File Access**: File System Access API
- **Styling**: Tailwind CSS

### Project Structure

```
~/git/personal/
├── blog-cms/                    # CMS application (sibling to main site)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Editor.tsx           # Main TipTap editor
│   │   │   ├── FileManager.tsx      # File browser/picker
│   │   │   ├── FrontmatterForm.tsx  # Metadata editor
│   │   │   ├── Preview.tsx          # Live MDX preview
│   │   │   └── Toolbar.tsx          # Editor controls
│   │   ├── lib/
│   │   │   ├── file-system.ts       # File System Access API wrapper
│   │   │   ├── mdx-parser.ts        # Parse/serialize MDX
│   │   │   └── storage.ts           # LocalStorage for settings
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── README.md
└── cunningjams.com/             # Main website
    └── content/
        └── blog/                # Blog posts directory
```

## Core Features

### Phase 1: Basic Functionality

1. **File System Integration**
   - Open content directory using File System Access API
   - Read existing MDX files
   - Create new MDX files
   - Save changes to existing files

2. **Frontmatter Editor**
   - Form for title, date, description, author, tags
   - Validation for required fields
   - Date picker component

3. **Markdown Editor**
   - TipTap rich text editor
   - Toolbar with formatting options
   - Convert between WYSIWYG and Markdown

4. **File List**
   - Show all blog posts
   - Filter/search functionality
   - Sort by date

### Phase 2: Enhanced Features

1. **Live Preview**
   - Side-by-side editor and preview
   - Real-time rendering with MDX components
   - Mobile responsive preview

2. **Media Management**
   - Upload images to public folder
   - Image optimization preview
   - Insert images with proper syntax

3. **Custom Components**
   - UI for inserting Callouts, FeatureCards, etc.
   - Component picker with preview
   - Prop editor for components

### Phase 3: Advanced Features

1. **Version Control Integration**
   - Git status display (requires backend)
   - Commit changes (requires backend)
   - Or: Generate git commands to copy/paste

2. **Publishing Workflow**
   - Draft vs Published status
   - Scheduled publishing dates
   - SEO preview/checker

3. **Analytics Integration**
   - View counts per post
   - Popular posts dashboard
   - Reader engagement metrics

## Implementation Details

### File System Access API

```typescript
// lib/file-system.ts
export async function openDirectory() {
  const handle = await window.showDirectoryPicker();
  return handle;
}

export async function readFile(handle: FileSystemFileHandle) {
  const file = await handle.getFile();
  return await file.text();
}

export async function writeFile(
  handle: FileSystemFileHandle, 
  content: string
) {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}
```

### TipTap Configuration

```typescript
// components/Editor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlock from '@tiptap/extension-code-block';
import Image from '@tiptap/extension-image';

const editor = useEditor({
  extensions: [
    StarterKit,
    CodeBlock,
    Image,
    // Custom extensions for MDX components
  ],
  content: initialContent,
  onUpdate: ({ editor }) => {
    // Convert to Markdown and save
  },
});
```

### MDX Parsing

```typescript
// lib/mdx-parser.ts
import matter from 'gray-matter';

export function parseMDX(content: string) {
  const { data, content: body } = matter(content);
  return { frontmatter: data, body };
}

export function serializeMDX(frontmatter: any, body: string) {
  return matter.stringify(body, frontmatter);
}
```

## User Experience

### Workflow

1. **Open CMS** → Open `cms/index.html` in browser
2. **Select Directory** → Choose content/blog folder
3. **Browse Posts** → See list of all posts
4. **Edit Post** → Click to open in editor
5. **Make Changes** → Edit metadata and content
6. **Save** → Write directly to MDX file
7. **Preview** → See how it will look on site
8. **Test Locally** → Switch to Next.js dev server to verify

### Layout

```
┌─────────────────────────────────────────────────┐
│  Blog CMS                            [Settings] │
├────────────┬────────────────────────────────────┤
│            │ Post Title                         │
│  Posts     │ ┌────────────────────────────────┐ │
│  ▸ All     │ │ Frontmatter Form               │ │
│  ▸ Drafts  │ └────────────────────────────────┘ │
│  ▸ Tags    │                                    │
│            │ ┌────────────────────────────────┐ │
│  [New]     │ │                                │ │
│            │ │  Editor (TipTap WYSIWYG)       │ │
│  • Post 1  │ │                                │ │
│  • Post 2  │ │                                │ │
│  • Post 3  │ │                                │ │
│            │ └────────────────────────────────┘ │
│            │                                    │
│            │ [Save] [Preview] [Cancel]          │
└────────────┴────────────────────────────────────┘
```

## Distribution

### As Standalone Tool

1. **Single HTML File**
   - Bundle everything into one HTML file
   - Use inline CSS and JS
   - No build step needed for users
   - Just download and open in browser

2. **As Web App**
   - Deploy to GitHub Pages or Vercel
   - Access from any device
   - Still works offline via Service Worker

3. **As npm Package**
   - `npx blog-cms`
   - Runs local dev server
   - Auto-opens browser

### Open Source Repository

The CMS is now a sibling directory to the main site:

```
~/git/personal/
├── blog-cms/          # CMS tool (separate from main site)
│   ├── README.md
│   └── src/
└── cunningjams.com/   # Main website
    └── content/blog/  # CMS edits files here
```

## Development Roadmap

### MVP (1-2 weeks)

- [ ] Set up Vite + React + TypeScript project
- [ ] Implement File System Access API wrapper
- [ ] Build basic TipTap editor
- [ ] Create frontmatter form
- [ ] Add file list/browser
- [ ] Implement save functionality

### v1.0 (2-4 weeks)

- [ ] Add live preview
- [ ] Implement search/filter
- [ ] Add media management
- [ ] Create custom component inserters
- [ ] Add keyboard shortcuts
- [ ] Write documentation

### v2.0 (Future)

- [ ] Git integration (with backend)
- [ ] Multi-user support
- [ ] Draft/publish workflow
- [ ] Analytics dashboard
- [ ] Plugin system for extensibility

## Browser Compatibility

File System Access API is supported in:
- ✅ Chrome/Edge 86+
- ✅ Opera 72+
- ❌ Safari (not yet)
- ❌ Firefox (behind flag)

**Fallback**: For unsupported browsers, provide download/upload functionality instead of direct file access.

## Getting Started (When Built)

```bash
# Clone the repo
git clone https://github.com/yourusername/blog-cms
cd blog-cms

# Install dependencies
npm install

# Run dev server
npm run dev

# Or build standalone HTML
npm run build:standalone
```

Then open the CMS and select your `content/blog` directory!

## Security Considerations

- File System Access API requires user permission
- Only works with directories user explicitly grants access to
- No network requests needed (all client-side)
- Can't accidentally access system files
- Works completely offline

## Benefits of This Approach

1. **No Backend** - Pure client-side, no server costs
2. **Fast** - No API calls, direct file access
3. **Offline** - Works without internet
4. **Simple** - Just open HTML file in browser
5. **Portable** - Works on any modern browser
6. **Extensible** - React components are easy to modify
7. **Open Source** - Anyone can contribute or fork

## Next Steps

Once your blog is stable and you're ready to build the CMS:

1. Create separate repository for CMS tool
2. Set up Vite + React project
3. Start with Phase 1 features
4. Test with your own blog
5. Gather feedback
6. Open source it for community use

This CMS will be a great companion to your MDX blog setup! 🚀
