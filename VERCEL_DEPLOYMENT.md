# Vercel Deployment Guide

## ✅ **Vercel Compatibility Status**

This app is **compatible with Vercel** with the following optimizations implemented:

### **🔧 Optimizations Made:**
- ✅ **Implemented direct uploads** - files go straight to Cloudinary
- ✅ **Removed server upload limits** - now supports 100MB+ files
- ✅ Added `vercel.json` with function timeout configurations  
- ✅ Separated client/server Cloudinary code to avoid build issues
- ✅ Used Next.js App Router (fully supported)

## 📋 **Deployment Steps**

### 1. **Environment Variables**
Set these in your Vercel dashboard:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=album-upload
ALBUM_PASSWORD=colorado2025
NEXTAUTH_SECRET=your_secure_random_string
```

### 2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. **Configure Cloudinary Upload Preset**
Follow the detailed guide in `CLOUDINARY_SETUP.md` to create your upload preset.

### 4. **Verify Deployment**
- Test password login at `/album`
- Try uploading images and videos (up to 100MB each!)
- Test photo viewing and downloading

## ✅ **No More Upload Limitations!**

### **File Size Limits:**
- **Images**: 100MB max (or whatever you set in upload preset)
- **Videos**: 100MB max (or whatever you set in upload preset)  
- **Reason**: Direct uploads bypass all Vercel serverless limits!

### **Function Timeouts:**
- **Photos fetch**: 15 seconds max
- **Upload function**: N/A (uploads are direct to Cloudinary)
- **Reason**: Only photo fetching uses serverless functions now

## 🚀 **Performance on Vercel**

### **What Works Great:**
- ✅ Fast cold starts with Next.js 14
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Environment variable management
- ✅ Photo viewing and downloading
- ✅ Authentication and sessions

### **Potential Issues:**
- ⚠️ Very slow internet connections might timeout during large uploads
- ⚠️ Upload preset misconfiguration could block uploads
- ⚠️ Cloudinary account limits (storage/bandwidth) might apply

## 🛠️ **Alternative Solutions for Large Files**

If you need larger file support, consider:

### **Option 1: Upgrade Vercel Plan**
- Pro plan: Longer timeouts, more memory
- Enterprise: Even higher limits

### **Option 2: Direct Upload to Cloudinary**
- Implement Cloudinary's upload widget
- Files go directly to Cloudinary (bypasses Vercel limits)
- More complex but supports unlimited file sizes

### **Option 3: Different Host**
- Railway, Render, or DigitalOcean App Platform
- Traditional hosting with higher limits

## 📊 **Expected Performance**

### **Typical Upload Times with Direct Upload:**
- 5MB image: ~2-4 seconds (direct to Cloudinary)
- 25MB video: ~8-15 seconds (direct to Cloudinary)
- 100MB video: ~30-60 seconds (direct to Cloudinary)

### **Gallery Loading:**
- Empty album: ~200-500ms
- 50 photos: ~1-2 seconds
- 100+ photos: ~2-4 seconds

## 🔍 **Monitoring**

Check Vercel's function logs for:
- Upload timeouts
- Memory usage warnings
- Error rates

The app includes logging to help debug any issues:
```
📤 Uploading 3 file(s)
✅ photo1.jpg uploaded successfully  
✅ video1.mp4 uploaded successfully
📊 Upload completed: 3 successful, 0 failed (12450ms)
```

## 🎯 **Recommended Vercel Configuration**

The app works best on Vercel with:
- **Plan**: Pro (for better limits) or Hobby (for testing)
- **Region**: Choose closest to your users
- **Node.js**: 18.x (default)
- **Build Command**: `pnpm build` (default)

Your album should work perfectly for most use cases on Vercel! 🚀
