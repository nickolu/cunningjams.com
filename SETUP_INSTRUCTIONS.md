# Setup Instructions for Steve's 40th Birthday Album

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=album-upload

# Album Authentication
ALBUM_PASSWORD=colorado2025
NEXTAUTH_SECRET=your_session_secret_key_here
```

## Quick Start

1. **Install dependencies** (already done):
   ```bash
   pnpm install
   ```

2. **Set up environment variables**:
   - Copy the example above to `.env.local`
   - Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with your actual Cloudinary credentials
   - **Important**: Use the same value for both `CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - Generate a secure random string for `NEXTAUTH_SECRET`
   - Change `ALBUM_PASSWORD` to your desired password

3. **Configure Cloudinary Upload Preset**:
   - Log into your Cloudinary dashboard
   - Go to Settings → Upload → Add upload preset
   - Set preset name to `album-upload` (or update the env var to match)
   - Set mode to "Unsigned"
   - Set folder to `2025-steves-40th`
   - Configure allowed formats: jpg, jpeg, png, gif, webp, mp4, mov, avi, webm
   - Set max file size to 100MB
   - Save the preset

4. **Run the development server**:
   ```bash
   pnpm dev
   ```

5. **Access the album**:
   - Go to `http://localhost:3000/album`
   - You'll be redirected to the password page
   - Enter your password to access the album

## Current Status

✅ **Completed Phase 1:**
- Password protection with cookie-based sessions
- Protected `/album` routes (your main site remains unprotected)
- Basic photo gallery display
- Cloudinary integration for photo fetching
- Responsive design with shadcn/ui components

🚧 **Next Phases:**
- Upload functionality with drag & drop
- Bulk download as ZIP
- Enhanced photo viewer features

## Routes

- **Main site**: `/` (unprotected, your existing content)
- **Album**: `/album` (protected, requires password)
- **Album login**: `/auth/album/password`

The middleware only protects routes starting with `/album`, so your existing site remains completely unprotected.
