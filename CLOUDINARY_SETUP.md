# Cloudinary Setup Guide for File Uploads

## Problem
Netlify and other serverless platforms have **read-only file systems**, so you cannot save uploaded files to the local disk. You need cloud storage.

## Solution: Cloudinary (Free Tier)
- **Free**: 25GB storage + 25GB bandwidth/month
- **Easy setup**: No credit card required
- **CDN**: Fast global delivery

## Setup Steps

### 1. Create Cloudinary Account
1. Go to https://cloudinary.com/users/register_free
2. Sign up (free, no credit card needed)
3. Verify your email

### 2. Get Your Credentials
After logging in:
1. Go to **Dashboard** (https://console.cloudinary.com/)
2. You'll see:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key**
   - **API Secret**

### 3. Create Upload Preset
1. Go to **Settings** → **Upload** (https://console.cloudinary.com/settings/upload)
2. Scroll to **Upload presets**
3. Click **Add upload preset**
4. Configure:
   - **Preset name**: `d-report-uploads` (or any name you like)
   - **Signing Mode**: **Unsigned** (important!)
   - **Folder**: `d-report-uploads` (optional, for organization)
5. Click **Save**

### 4. Add Environment Variables

#### For Netlify:
1. Go to your Netlify site dashboard
2. **Site settings** → **Environment variables**
3. Add these variables:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=d-report-uploads
   ```
4. Click **Save**
5. **Redeploy** your site

#### For Local Development (.env file):
Add to your `.env` file:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=d-report-uploads
```

### 5. Test
1. Deploy to Netlify
2. Try uploading a file on the public form
3. It should now upload to Cloudinary instead of trying to save locally

## How It Works

### Local Development
- Files are saved to `public/uploads/` folder
- Accessible at `/uploads/filename.jpg`

### Production (Netlify/Vercel)
- Files are uploaded to Cloudinary
- Returns a CDN URL like: `https://res.cloudinary.com/your-cloud/image/upload/v123/d-report-uploads/filename.jpg`
- Fast, globally distributed

## Verification
After uploading a file, check the Netlify logs. You should see:
```
✅ File uploaded to Cloudinary
```

Instead of the previous error:
```
❌ EROFS: read-only file system
```

## Alternative: Vercel Blob Storage
If you prefer Vercel, you can use **Vercel Blob** (free tier: 500MB):
- https://vercel.com/docs/storage/vercel-blob

But Cloudinary is recommended because:
- More generous free tier (25GB vs 500MB)
- Works on any platform (Netlify, Vercel, AWS, etc.)
- Built-in image optimization and transformations
