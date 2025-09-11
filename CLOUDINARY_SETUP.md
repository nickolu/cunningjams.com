# Cloudinary Upload Preset Setup Guide

## 📋 **Step-by-Step Upload Preset Configuration**

### 1. **Access Cloudinary Dashboard**
- Go to [cloudinary.com](https://cloudinary.com) and log in
- Navigate to your dashboard

### 2. **Create Upload Preset**
- Go to **Settings** (gear icon) → **Upload**
- Click **Add upload preset** button
- You'll see the upload preset configuration form

### 3. **Basic Settings**
Configure these essential settings:

```
Preset name: album-upload
Signing mode: Unsigned
```

### 4. **Upload Parameters**
Set these parameters:

```
Folder: 2025-steves-40th
Resource type: Auto
Access mode: Public
```

### 5. **File Restrictions**
Configure allowed file types and sizes:

```
Allowed formats: jpg,jpeg,png,gif,webp,mp4,mov,avi,webm
Max file size: 100000000 (100MB in bytes)
Max image width: 4000 (optional)
Max image height: 4000 (optional)
Max video duration: 300 (5 minutes, optional)
```

### 6. **Upload Control**
Recommended settings:

```
Overwrite: false (keeps original files)
Unique filename: true (prevents conflicts)
Use filename: true (preserves original names)
```

### 7. **Security Settings**
For additional security (optional):

```
Allowed IPs: (leave empty for public access)
Return delete token: false
Notification URL: (leave empty)
```

### 8. **Save Preset**
- Click **Save** at the bottom
- Your preset is now ready!

## 🔍 **Verification**

Test your preset by:
1. Running your app locally
2. Trying to upload a small image
3. Checking if it appears in the `2025-steves-40th` folder

## ⚙️ **Environment Variable**

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=album-upload
```

## 🎯 **What This Enables**

With this preset configured:
- ✅ **Direct uploads** from browser to Cloudinary
- ✅ **100MB file limit** (no server restrictions)
- ✅ **Automatic folder organization**
- ✅ **Support for images and videos**
- ✅ **No server-side processing needed**
- ✅ **Faster upload speeds**

## 🔒 **Security Notes**

**Unsigned presets** are secure because:
- Upload parameters are controlled by the preset
- Users can't modify folder, file size limits, etc.
- Only allowed file types can be uploaded
- Files go to your designated folder only

**For production**, consider:
- Setting IP restrictions if needed
- Monitoring upload usage in Cloudinary dashboard
- Setting up webhooks for upload notifications (optional)

## 🚨 **Troubleshooting**

**Upload fails?**
- Check preset name matches environment variable
- Verify preset is set to "Unsigned"
- Ensure file types are in allowed formats list
- Check file size is under 100MB

**Files not appearing?**
- Verify folder name is `2025-steves-40th`
- Check if files are going to root folder instead
- Refresh the gallery page

Your direct upload setup is now complete! 🎉
