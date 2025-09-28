# Photo Gallery Multi-Album Refactor Plan

## Overview
This plan outlines the steps needed to refactor the current single-album photo gallery into a generic, multi-album system that supports any Cloudinary folder within your API key. The current system is hardcoded to use the folder `2025-steves-40th` and has fixed passwords.

## Current Architecture Analysis

### Current Structure
- **Single album route**: `/app/album/page.tsx` (hardcoded to Steve's 40th Birthday)
- **Target structure**: `/app/albums/[albumSlug]/page.tsx` (dynamic album support)
- **Example target**: `/app/albums/steves-40th-birthday/page.tsx` (already created)

### Current Hardcoded Elements
1. **Album folder**: `ALBUM_FOLDER = '2025-steves-40th'` in `lib/cloudinary.ts:15`
2. **Album title/description**: Hardcoded in `PhotoGallery.tsx:642-650`
3. **Authentication**: Fixed `ALBUM_PASSWORD` and `ADMIN_PASSWORD` in `.env`
4. **Middleware**: Hardcoded `/album` routes in `middleware.ts`
5. **API routes**: Hardcoded to single album context

## Required Changes

### 1. Environment Variables & Configuration

**Current `.env` structure:**
```
ALBUM_PASSWORD=pumphouse
ADMIN_PASSWORD=admin2025
```

**New `.env` structure:**
```
# Global admin (can access all albums)
GLOBAL_ADMIN_PASSWORD=admin2025

# Album-specific configurations (JSON format)
ALBUM_CONFIGS='{
  "steves-40th-birthday": {
    "title": "Steve'\''s 40th Birthday",
    "subtitle": "Colorado Trip 2025",
    "cloudinaryFolder": "2025-steves-40th",
    "password": "pumphouse",
    "adminPassword": "steve-admin"
  },
  "family-reunion-2025": {
    "title": "Smith Family Reunion",
    "subtitle": "Summer 2025",
    "cloudinaryFolder": "2025-family-reunion",
    "password": "reunion2025",
    "adminPassword": "reunion-admin"
  }
}'
```

### 2. Core Library Changes

#### 2.1 Update `lib/cloudinary.ts`
- **Remove hardcoded `ALBUM_FOLDER`** (line 15)
- **Modify `getAlbumPhotos()`** to accept `albumSlug` parameter
- **Update `uploadToAlbum()`** to accept `albumSlug` parameter
- **Update all album-specific functions** to work with dynamic folders

#### 2.2 Create `lib/album-config.ts`
- **New file** to handle album configuration management
- **Parse `ALBUM_CONFIGS`** environment variable
- **Provide functions**:
  - `getAlbumConfig(albumSlug: string)`
  - `validateAlbumPassword(albumSlug: string, password: string)`
  - `getAllAlbumSlugs()`

#### 2.3 Update `lib/auth.ts`
- **Modify `validatePassword()`** to accept `albumSlug` parameter
- **Add album-specific authentication logic**
- **Support both album-specific admin and global admin**
- **Update session to include `albumSlug`**

### 3. Route Structure Changes

#### 3.1 Move Album Route
- **Move** `app/album/page.tsx` → `app/albums/[albumSlug]/page.tsx`
- **Delete** old `app/album/` directory
- **Update** to use dynamic album slug from URL params

#### 3.2 Update Authentication Routes
- **Move** `app/auth/album/password/page.tsx` → `app/auth/albums/[albumSlug]/password/page.tsx`
- **Update** to handle album-specific authentication

#### 3.3 Update API Routes
- **Update** `app/api/album/photos/route.ts` → `app/api/albums/[albumSlug]/photos/route.ts`
- **Update** `app/api/album/reorder/route.ts` → `app/api/albums/[albumSlug]/reorder/route.ts`
- **Update** `app/api/album/set-custom/route.ts` → `app/api/albums/[albumSlug]/set-custom/route.ts`
- **Update** `app/api/album/delete/route.ts` → `app/api/albums/[albumSlug]/delete/route.ts`
- **Update** `app/api/auth/login/route.ts` to handle album-specific auth

### 4. Component Changes

#### 4.1 Update `PhotoGallery.tsx`
- **Remove hardcoded album title/subtitle** (lines 642-650)
- **Accept `albumConfig` as prop** or fetch from URL params
- **Update API calls** to use album slug
- **Make title/subtitle dynamic** based on album config

#### 4.2 Create Album Layout Component
- **New** `app/albums/[albumSlug]/layout.tsx`
- **Handle album-not-found cases**
- **Provide album context** to child components

### 5. Middleware Updates

#### 5.1 Update `middleware.ts`
- **Change route matching** from `/album` to `/albums/[albumSlug]`
- **Add album slug validation**
- **Update redirect logic** for album-specific password pages
- **Handle album-not-found scenarios**

### 6. Type System Updates

#### 6.1 Create Album Types
```typescript
// types/album.ts
export interface AlbumConfig {
  title: string;
  subtitle: string;
  cloudinaryFolder: string;
  password: string;
  adminPassword: string;
}

export interface AlbumSession extends SessionPayload {
  albumSlug: string;
}
```

## Implementation Steps

### Phase 1: Core Infrastructure
1. **Create `lib/album-config.ts`** with album configuration management
2. **Update `lib/auth.ts`** to support album-specific authentication
3. **Create album types** in `types/album.ts`
4. **Update `.env`** with new configuration structure

### Phase 2: API Layer
1. **Update all API routes** to support dynamic album slugs
2. **Update `lib/cloudinary.ts`** to accept album parameters
3. **Test API endpoints** with different album slugs

### Phase 3: Frontend Components
1. **Update `PhotoGallery.tsx`** to be album-agnostic
2. **Create dynamic album pages** at `app/albums/[albumSlug]/page.tsx`
3. **Update authentication pages** for album-specific login
4. **Update middleware** for new route structure

### Phase 4: Migration & Cleanup
1. **Move existing album** to new structure
2. **Delete old routes** (`app/album/`)
3. **Test all functionality** with multiple albums
4. **Update any remaining hardcoded references**

## Migration Notes

### Existing Album Migration
The existing "Steve's 40th Birthday" album should be accessible at:
- **New URL**: `/albums/steves-40th-birthday`
- **Old URL**: `/album` (should redirect or show 404)

### Testing Strategy
1. **Create a second test album** to verify multi-album functionality
2. **Test authentication** for each album separately
3. **Test admin functions** across different albums
4. **Verify middleware redirects** work correctly

### Backward Compatibility
- **Old `/album` route**: Consider adding a redirect to a default album or 404 page
- **Environment variables**: The old `ALBUM_PASSWORD`/`ADMIN_PASSWORD` can be removed after migration

## Files to Modify

### New Files
- `lib/album-config.ts`
- `types/album.ts`
- `app/albums/[albumSlug]/page.tsx`
- `app/albums/[albumSlug]/layout.tsx`
- `app/auth/albums/[albumSlug]/password/page.tsx`
- `app/api/albums/[albumSlug]/photos/route.ts`
- `app/api/albums/[albumSlug]/reorder/route.ts`
- `app/api/albums/[albumSlug]/set-custom/route.ts`
- `app/api/albums/[albumSlug]/delete/route.ts`

### Modified Files
- `.env`
- `lib/cloudinary.ts`
- `lib/auth.ts`
- `components/PhotoGallery.tsx`
- `middleware.ts`
- `app/api/auth/login/route.ts`

### Deleted Files/Directories
- `app/album/` (entire directory)
- `app/auth/album/` (entire directory)
- `app/api/album/` (entire directory)

## Post-Refactor Benefits
1. **Scalability**: Easy to add new albums by updating `ALBUM_CONFIGS`
2. **Isolation**: Each album has its own authentication and configuration
3. **Maintainability**: No hardcoded album-specific values in code
4. **Flexibility**: Can easily customize titles, passwords, and Cloudinary folders per album
5. **Security**: Album-specific admin passwords with global admin override

This refactor maintains all existing functionality while making the system generic and extensible for multiple photo albums.