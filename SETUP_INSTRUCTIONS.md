# Setup Instructions for Steve's 40th Birthday Album

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

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
   - Generate a secure random string for `NEXTAUTH_SECRET`
   - Change `ALBUM_PASSWORD` to your desired password

3. **Create the Cloudinary folder**:
   - Log into your Cloudinary dashboard
   - Create a folder named `2025-steves-40th`
   - Upload a test image to verify the setup

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
