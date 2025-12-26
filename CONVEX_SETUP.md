# Convex Setup Instructions

## Prerequisites

1. Create a Convex account at https://convex.dev
2. Install Convex CLI: `bunx convex dev` (or `npm install -g convex`)
3. Create a new Convex project

## Setup Steps

1. **Initialize Convex in your project:**
   
   **IMPORTANT:** You need to run this command in your terminal (it requires interactive login):
   ```bash
   bunx convex dev
   ```
   
   This will:
   - Prompt you to log in with GitHub (or create a Convex account)
   - Create a new Convex project or link to an existing one
   - Generate deployment URLs
   - Create/update `convex.json` with your project configuration
   - Set up the Convex dashboard
   
   **Note:** The `convex.json` file has been pre-created with basic configuration. The `convex dev` command will update it with your project details.

2. **Get your deployment URL:**
   - After running `convex dev`, you'll see a deployment URL
   - Copy this URL and add it to `.env.local`:
     ```
     VITE_CONVEX_URL=https://your-deployment.convex.cloud
     ```

3. **Deploy your schema:**
   ```bash
   bunx convex deploy
   ```
   
   Or if you're running `convex dev`, it will automatically deploy changes.

## Current Status

✅ Schema defined (`convex/schema.ts`)
✅ Queries created (`convex/queries.ts`)
✅ Mutations created (`convex/mutations.ts`)
✅ Convex project initialized (grand-bulldog-34)
⏳ Needs VITE_CONVEX_URL in local .env.local file

**Note:** Authentication is now handled by Clerk (see CLERK_SETUP.md)

## Testing Without Convex

For now, the app will show errors if Convex is not configured. To test the UI without Convex:

1. The component structure is complete
2. Forms are ready
3. Once Convex is deployed, everything will work automatically

