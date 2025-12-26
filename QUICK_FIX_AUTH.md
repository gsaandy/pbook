# Quick Fix: Authentication Redirect Issue

## Problem
After signing in with Clerk, you're redirected back to the sign-in page with a console error.

## Root Cause
Convex authentication isn't configured. Clerk sign-in works, but Convex can't validate the JWT token.

## Solution

### Step 1: Get Your Clerk Issuer Domain

1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Select your application
3. Go to **Configure** → **JWT Templates**
4. If you don't have a "Convex" template yet:
   - Click **New template**
   - Select **Convex** from the list
   - **Important:** Keep the token name as `convex` (don't rename it)
5. Copy the **Issuer** URL (also called "Frontend API URL")
   - It looks like: `https://modest-pheasant-12.clerk.accounts.dev`
   - This is your `CLERK_JWT_ISSUER_DOMAIN`

### Step 2: Set Environment Variable in Convex

1. Go to your Convex Dashboard: https://dashboard.convex.dev
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add Variable**
5. Set:
   - **Name:** `CLERK_JWT_ISSUER_DOMAIN`
   - **Value:** Your Clerk Issuer URL (from Step 1)
   - **Environment:** Development (or Production if deploying)
6. Click **Save**

### Step 3: Deploy Convex Auth Config

Run this command in your terminal:

```bash
npx convex dev
```

This will sync your `convex/auth.config.ts` to Convex and enable authentication.

### Step 4: Test (Employee Record Auto-Created!)

**Good news:** Employee records are now created automatically! No manual linking needed.

When you sign in:
1. ✅ Employee record is auto-created with your Clerk user info
2. ✅ Default role: `field_staff` (you can access Daily Operations)
3. ✅ Admin can promote you to `admin` role later if needed

### Step 5: Test

1. Sign out and sign in again
2. You should now see the application instead of the sign-in page

## Verification

After completing these steps, you should see:
- ✅ No console errors about authentication
- ✅ Application loads after sign-in
- ✅ Employee record automatically created
- ✅ Navigation items appear based on your role (default: field_staff)
- ✅ You can access protected routes

**Note:** If you need admin access, ask an existing admin to promote your role in Setup & Configuration → Employees.

## Still Having Issues?

1. **Check Console Errors:** Open browser DevTools (F12) and look for errors
2. **Verify Environment Variable:** Make sure `CLERK_JWT_ISSUER_DOMAIN` is set in Convex Dashboard
3. **Check Convex Logs:** Go to Convex Dashboard → Logs to see if there are authentication errors
4. **Verify Employee Record:** Make sure your employee record has the correct `clerkUserId`

