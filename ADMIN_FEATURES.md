# Admin Features Documentation

## Overview

The photo album now includes comprehensive admin functionality that allows administrators to manage photo organization and customize the viewing experience. All admin features are protected by a separate admin password.

## New Features Implemented

### 1. Admin Authentication
- **Admin Password**: Add `ADMIN_PASSWORD` to your `.env.local` file
- **Dual Authentication**: Regular users can still access with `ALBUM_PASSWORD`, but admins get additional privileges with `ADMIN_PASSWORD`
- **Admin Indicator**: Visual indicator showing admin status in the interface

### 2. Sort Options
- **Multiple Sort Types**:
  - `Custom Order` (default) - Allows drag-and-drop reordering for admins
  - `Newest First` - Sort by upload date (newest first)
  - `Oldest First` - Sort by upload date (oldest first)
  - `Name A-Z` - Sort by filename alphabetically
  - `Name Z-A` - Sort by filename reverse alphabetically

### 3. Thumbnail Size Controls
- **Dynamic Grid Sizing**: Adjust how many thumbnails appear per row
- **Range**: 2-6 thumbnails per row
- **Responsive**: Automatically adjusts for different screen sizes
- **Real-time Updates**: Changes apply immediately without page refresh

### 4. Drag-and-Drop Reordering (Admin Only)
- **Visual Feedback**: Drag handles appear on hover for admin users
- **Custom Order Persistence**: Order is saved to Cloudinary using context metadata
- **Real-time Updates**: Changes are immediately saved and synchronized
- **Disabled for Non-Admins**: Regular users cannot reorder photos

### 5. Custom Order Storage
- **Cloudinary Context Metadata**: Uses Cloudinary's built-in context feature to store custom ordering
- **No External Database Required**: Perfect for Vercel deployment
- **Persistent**: Order survives app restarts and deployments
- **Efficient**: Minimal API calls for updates

## Environment Variables

Add these to your `.env.local` file:

```env
# Existing variables
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=album-upload
ALBUM_PASSWORD=colorado2025
NEXTAUTH_SECRET=your_session_secret_key_here

# New admin password
ADMIN_PASSWORD=your_admin_password_here
```

## How It Works

### Authentication Flow
1. Users enter either `ALBUM_PASSWORD` (regular access) or `ADMIN_PASSWORD` (admin access)
2. JWT token is created with appropriate permissions (`isAdmin: true/false`)
3. Frontend checks admin status on load and shows/hides admin features accordingly

### Custom Ordering System
1. **Storage**: Each photo can have a `custom_order` value stored in Cloudinary context metadata
2. **Sorting**: When "Custom Order" is selected, photos are sorted by this value
3. **Fallback**: Photos without custom order fall back to creation date sorting
4. **Updates**: Drag-and-drop updates all affected photos' order values via batch API call

### Drag-and-Drop Implementation
- **Library**: Uses `@dnd-kit` for smooth, accessible drag-and-drop
- **Visual Cues**: Drag handles, opacity changes, and disabled states
- **Error Handling**: Reverts changes if server update fails
- **Performance**: Optimistic updates for immediate feedback

## API Endpoints

### New Endpoints Added

#### `GET /api/auth/status`
Returns current user's authentication status and admin privileges.

#### `POST /api/album/reorder`
Updates custom order for multiple photos (admin only).

#### `GET /api/album/photos?sort=<option>`
Enhanced to accept sort parameter for different ordering options.

## User Experience

### For Regular Users
- Clean interface with sort options and thumbnail size controls
- No drag-and-drop capabilities
- All sorting options work except custom reordering

### For Admin Users
- Additional admin indicator badge
- Drag handles appear on photo hover
- Can reorder photos when "Custom Order" is selected
- All regular user features plus admin capabilities

## Technical Details

### Components Added
- `SortControls.tsx` - Sort dropdown and thumbnail size slider
- `DraggablePhotoCard.tsx` - Enhanced photo card with drag-and-drop
- Updated `PhotoGallery.tsx` - Main component with all new features

### Dependencies Added
- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable list implementation
- `@dnd-kit/utilities` - Utility functions for drag-and-drop

### Performance Considerations
- **Optimistic Updates**: UI updates immediately, then syncs with server
- **Batch Operations**: Multiple photo order updates sent in single API call
- **Efficient Rendering**: Grid classes calculated dynamically
- **Error Recovery**: Automatic revert on failed server updates

## Deployment Notes

### Vercel Compatibility
- ✅ All features work on Vercel
- ✅ No external database required
- ✅ Uses Cloudinary's built-in metadata storage
- ✅ Serverless functions handle admin operations

### Environment Setup
1. Add `ADMIN_PASSWORD` to Vercel environment variables
2. Redeploy to apply changes
3. Test admin functionality in production

## Security Considerations

- Admin password is separate from regular album password
- JWT tokens include admin status for server-side verification
- All admin operations are protected by server-side authentication checks
- Context metadata updates are restricted to admin users only

## Usage Instructions

### For Admins
1. Log in with admin password
2. Notice the green "Admin" badge in the interface
3. Use sort controls to change photo ordering
4. Select "Custom Order" to enable drag-and-drop
5. Drag photos to reorder them
6. Changes are saved automatically

### For Regular Users
1. Log in with regular album password
2. Use sort controls and thumbnail size adjustments
3. Custom ordering shows admin-defined order but cannot be changed
4. All other features work normally

This implementation provides a complete admin system that's both powerful and user-friendly, perfect for managing photo albums with custom organization requirements.
