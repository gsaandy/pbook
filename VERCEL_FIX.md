# Vercel Deployment Fix

## Problem

You encountered this error:
```
Error: The pattern ".output/server/index.mjs" defined in `functions` doesn't match any Serverless Functions inside the `api` directory.
```

## Root Cause

Vercel expects serverless functions to be in the `api` directory, but TanStack Start outputs to `.output/server/index.mjs`. Without Nitro, Vercel can't properly detect and configure the serverless functions.

## Solution: Integrate Nitro

Nitro is a server engine that bridges TanStack Start and Vercel's serverless infrastructure.

### Changes Made

1. **Installed Nitro**:
   ```bash
   bun add -d nitro
   ```

2. **Updated `vite.config.ts`**:
   ```typescript
   import { nitro } from "nitro/vite";
   
   plugins: [
     tanstackStart(),
     nitro({ preset: "vercel" }),
     // ... other plugins
   ]
   ```

3. **Simplified `vercel.json`**:
   - Removed `functions` configuration (Nitro handles this)
   - Removed `rewrites` (Nitro handles routing)
   - Kept only essential build configuration

### How Nitro Works

1. **Build Time**: Nitro transforms TanStack Start's output into Vercel-compatible serverless functions
2. **Deployment**: Vercel automatically detects Nitro's output structure
3. **Runtime**: Server functions work seamlessly through Nitro's adapter

### What Changed

**Before:**
- TanStack Start → `.output/server/index.mjs`
- Manual Vercel function configuration needed
- Routing handled manually

**After:**
- TanStack Start + Nitro → Vercel-compatible output
- Automatic function detection
- Automatic routing configuration

## Next Steps

1. **Rebuild locally** (optional, to test):
   ```bash
   bun run build
   ```

2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Add Nitro for Vercel deployment"
   git push
   ```

3. **Redeploy on Vercel**:
   - Vercel will automatically detect the changes
   - The build should now succeed
   - Server functions will work correctly

## Verification

After deployment, verify:
- ✅ Build completes without errors
- ✅ Server functions work (test your routes)
- ✅ SSR works correctly
- ✅ Client-side navigation works

## Additional Notes

- Nitro is a dev dependency (only needed for build)
- The `preset: "vercel"` tells Nitro to optimize for Vercel
- Nitro handles all the Vercel-specific configuration automatically
- No changes needed to your server function code

