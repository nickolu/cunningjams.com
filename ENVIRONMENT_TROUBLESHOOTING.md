# Environment Variables Troubleshooting

## 🚨 **"Cloudinary Cloud name is required" Error**

This error occurs when `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` isn't properly loaded.

### **🔧 Quick Fix Steps:**

1. **Restart your development server**:
   ```bash
   # Stop the server (Ctrl+C)
   pnpm dev
   ```

2. **Check your `.env.local` file**:
   ```env
   # Make sure this line exists and has your actual cloud name
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
   ```

3. **Verify the file location**:
   - `.env.local` should be in your project ROOT directory
   - Same level as `package.json`

### **🔍 Debug Steps:**

1. **Check console output**:
   - Open browser dev tools
   - Look for: `Cloudinary config: { cloudName: 'your-name', uploadPreset: 'album-upload' }`
   - If `cloudName` is `undefined`, the env var isn't loading

2. **Verify environment variables**:
   ```bash
   # In your terminal, check if the variable is set
   echo $NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
   ```

3. **Check file contents**:
   ```bash
   # Make sure .env.local exists and has content
   cat .env.local
   ```

### **📝 Complete .env.local Template:**

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

### **🎯 Common Issues:**

1. **Wrong file name**: Should be `.env.local` (not `.env`)
2. **Wrong location**: Must be in project root
3. **Server not restarted**: Environment changes require restart
4. **Typos**: Check spelling of variable names
5. **Missing values**: Make sure you have actual values, not placeholders

### **✅ Test Your Configuration:**

After fixing, you should see in the browser console:
```
Cloudinary config: { cloudName: 'your-actual-name', uploadPreset: 'album-upload' }
```

### **🆘 Still Not Working?**

Try this temporary hardcoded test:

1. **Edit `DirectUploadModal.tsx`**:
   ```typescript
   // Temporarily hardcode for testing
   const cloudName = 'your-actual-cloudinary-name';
   ```

2. **If this works**, the issue is definitely environment variables
3. **If this doesn't work**, there might be a different issue

### **📞 Get Your Cloud Name:**

1. Go to [cloudinary.com](https://cloudinary.com)
2. Log into your dashboard
3. Your cloud name is shown in the top-left corner
4. It's also in your dashboard URL: `https://console.cloudinary.com/console/c-[YOUR_CLOUD_NAME]`

The cloud name should be something like: `dm8emwil4` or `my-company-name`
