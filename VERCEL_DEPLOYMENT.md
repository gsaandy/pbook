# Vercel Deployment Guide

This guide explains how to deploy the PS Stores application to Vercel using TanStack Start.

## Prerequisites

1. **Vercel Account**: Sign up at https://vercel.com/signup
2. **Vercel CLI** (optional): `bun add -g vercel` or use the web dashboard
3. **GitHub/GitLab/Bitbucket Repository**: Your code should be in a Git repository

## Setup Steps

### 1. Vercel Configuration

No additional dependencies are required. TanStack Start works with Vercel out of the box using Vite's native support.

The `vercel.json` file has been created with the following configuration:
- **buildCommand**: `bun run build`
- **outputDirectory**: `.output` (TanStack Start output directory)
- **devCommand**: `bun run dev`
- **installCommand**: `bun install`
- **rewrites**: All routes rewrite to `/` for client-side routing

### 4. Environment Variables

You'll need to set environment variables in Vercel. These can be set via:

**Option A: Vercel Dashboard (Recommended)**
1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Description | Environment |
|----------|-------------|-------------|
| `VITE_CONVEX_URL` | Your Convex deployment URL | Production, Preview, Development |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Production, Preview, Development |
| `CLERK_SECRET_KEY` | Clerk secret key (server-side) | Production, Preview, Development |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk JWT issuer domain | Production, Preview, Development |

**Option B: Vercel CLI**
```bash
vercel env add VITE_CONVEX_URL
vercel env add VITE_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
vercel env add CLERK_JWT_ISSUER_DOMAIN
```

**Option C: .env.local (for local development)**
Create `.env.local` in your project root:
```env
VITE_CONVEX_URL=https://your-convex-url.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
```

### 5. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Configure Vercel deployment"
   git push
   ```

2. **Import Project in Vercel**
   - Go to https://vercel.com/new
   - Click **Import Git Repository**
   - Select your repository
   - Vercel will auto-detect TanStack Start

3. **Configure Project**
   - **Framework Preset**: Leave as "Other" or "Vite" (Vercel will auto-detect)
   - **Root Directory**: `./` (if your project is in the root)
   - **Build Command**: `bun run build` (already set in vercel.json)
   - **Output Directory**: `.output` (already set in vercel.json)
   - **Install Command**: `bun install` (already set in vercel.json)

4. **Add Environment Variables**
   - Add all required environment variables (see step 4)

5. **Deploy**
   - Click **Deploy**
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

#### Option B: Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   bun add -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   For production deployment:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add VITE_CONVEX_URL production
   vercel env add VITE_CLERK_PUBLISHABLE_KEY production
   vercel env add CLERK_SECRET_KEY production
   vercel env add CLERK_JWT_ISSUER_DOMAIN production
   ```

## Post-Deployment

After successful deployment:

1. **Get your Vercel URL**: Your app will be available at `https://your-project.vercel.app`
2. **Update Clerk Settings**: 
   - Go to Clerk Dashboard → Applications → Your App → Settings
   - Add your Vercel URL to **Allowed Origins**
   - Update **Redirect URLs** to include your Vercel domain
3. **Update Convex Settings**:
   - Ensure Convex allows requests from your Vercel URL
4. **Test the Deployment**: Visit your Vercel URL and test all features

## Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Vercel will automatically provision SSL certificates

## Environment Variables Reference

### Required Variables

| Variable | Description | Where to Set |
|----------|-------------|--------------|
| `VITE_CONVEX_URL` | Your Convex deployment URL | Vercel Dashboard → Settings → Environment Variables |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Vercel Dashboard → Settings → Environment Variables |
| `CLERK_SECRET_KEY` | Clerk secret key (server-side) | Vercel Dashboard → Settings → Environment Variables |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk JWT issuer domain | Vercel Dashboard → Settings → Environment Variables |

### Environment-Specific Variables

You can set different values for:
- **Production**: Live production environment
- **Preview**: Preview deployments (pull requests, branches)
- **Development**: Local development (when using `vercel dev`)

## Deployment Workflow

1. **Development**: Use `bun run dev` for local development
2. **Build**: Run `bun run build` to create production build
3. **Preview**: Use `bun run preview` to test the production build locally
4. **Deploy**: Push to Git or use `vercel --prod` to deploy

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to your main/master branch
- **Preview**: Every push to other branches and pull requests
- **Development**: When using `vercel dev` locally

## Troubleshooting

### Build Errors

If you encounter build errors:
```bash
# Clean build artifacts
rm -rf dist .output node_modules/.vite

# Rebuild
bun run build
```

### Environment Variable Issues

If environment variables aren't working:
1. Check they're set in Vercel Dashboard → Settings → Environment Variables
2. Ensure they're set for the correct environment (Production/Preview/Development)
3. Redeploy after adding new environment variables
4. Check variable names match exactly (case-sensitive)

### Routing Issues

If client-side routing isn't working:
- The `vercel.json` includes rewrites for all routes
- Ensure `vercel.json` is in the project root
- Check that the output directory is `.output`

### TypeScript Errors

If you see TypeScript errors during build:
```bash
# Check TypeScript configuration
bunx tsc --noEmit
```

### Bun-Specific Issues

Since you're using Bun:
- Vercel will use Bun for installation (`bun install`)
- Build command uses Bun (`bun run build`)
- Ensure Bun is supported in Vercel's build environment

## Monitoring

Monitor your deployment:
- **Vercel Dashboard**: View deployments, logs, and analytics
- **Real-time Logs**: View logs in Vercel Dashboard → Deployments → Your Deployment → Logs
- **Analytics**: View performance metrics in Vercel Dashboard → Analytics

## Additional Resources

- [TanStack Start Hosting Guide - Vercel](https://tanstack.com/start/latest/docs/framework/react/guide/hosting#vercel)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

## Notes

- **Serverless Functions**: Vercel automatically creates serverless functions for your server routes
- **Edge Network**: Your app is automatically distributed globally via Vercel's Edge Network
- **Free Tier**: Vercel free tier includes generous limits for personal projects
- **Automatic HTTPS**: SSL certificates are automatically provisioned
- **Preview Deployments**: Every branch and PR gets its own preview URL

