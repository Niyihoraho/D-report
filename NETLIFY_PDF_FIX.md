# Netlify PDF Export Fix - Implementation Summary

## Problem
The PDF export feature was failing on Netlify with the error:
```
Error: The input directory "/var/task/node_modules/@sparticuz/chromium/bin" does not exist.
```

This occurred because `@sparticuz/chromium` requires bundling large binary files (~150MB) which weren't being included in the Netlify deployment.

## Solution Implemented

### 1. Switched to `@sparticuz/chromium-min`
- **What**: Replaced `@sparticuz/chromium` with `@sparticuz/chromium-min`
- **Why**: chromium-min downloads the Chromium binary from a CDN at runtime instead of bundling it
- **Benefit**: Reduces deployment size and avoids bundling issues

### 2. Updated `lib/pdf-generator.ts`
- Dynamic import of chromium-min to avoid bundling
- Uses CDN-hosted Chromium binary: `https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar`
- Added serverless-optimized Chrome flags: `--single-process`, `--no-zygote`
- Better error logging for debugging

### 3. Created `netlify.toml`
- Configured Netlify to use esbuild bundler
- Set up proper environment for serverless functions
- Ensured chromium files are included if needed

## Files Modified
1. `lib/pdf-generator.ts` - Complete rewrite of serverless Chromium handling
2. `netlify.toml` - New file for Netlify configuration
3. `package.json` - Added `@sparticuz/chromium-min` dependency

## How It Works Now
1. When PDF export is triggered on Netlify:
   - Detects serverless environment (AWS_LAMBDA_FUNCTION_VERSION is set)
   - Dynamically imports `@sparticuz/chromium-min`
   - Downloads Chromium binary from GitHub CDN (cached after first use)
   - Launches Puppeteer with the downloaded binary
   - Generates PDF and returns it

2. Local development:
   - Uses standard `puppeteer` package with local Chrome/Chromium
   - No changes to local workflow

## Testing
- ✅ Build passes locally
- ⏳ Needs deployment to Netlify to verify

## Next Steps
1. **Deploy to Netlify** - Push these changes
2. **Test PDF Export** - Try exporting a report
3. **Monitor Logs** - Check for "✅ Browser launched successfully" message
4. **Verify Download** - First run will download ~150MB binary (subsequent runs use cache)

## Fallback Plan
If this still fails, we can:
- Use a Netlify Build Plugin for Chromium
- Switch to a different PDF generation service (e.g., Puppeteer as a service)
- Use Vercel instead (better Puppeteer support)
