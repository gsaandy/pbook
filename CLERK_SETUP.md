# Clerk Authentication Setup

## Overview

This application uses Clerk for authentication. Clerk handles all user authentication, session management, and user profile management.

## Prerequisites

1. Create a Clerk account at https://clerk.com
2. Create a new Clerk application

## Setup Steps

1. **Create a Clerk Application:**
   - Go to https://dashboard.clerk.com
   - Click "Create Application"
   - Choose your application name
   - Select authentication methods (Email, OAuth providers, etc.)

2. **Get your Clerk Keys:**
   - After creating the application, go to "API Keys"
   - Copy your **Publishable Key** (starts with `pk_`)
   - Copy your **Secret Key** (starts with `sk_`) - keep this secure!

3. **Add Environment Variables:**
   
   Create or update `.env.local` in your project root:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```
   
   **Note:** The publishable key is safe to expose in client-side code. The secret key is only needed for server-side operations (if any).

4. **Configure Authentication Methods:**
   
   In Clerk Dashboard → User & Authentication:
   - Enable Email/Password (if needed)
   - Enable OAuth providers (Google, GitHub, etc.)
   - Configure sign-up/sign-in flows
   - Set up user metadata for roles (Admin/Employee)

5. **Set up User Roles (Optional but Recommended):**
   
   In Clerk Dashboard → User & Authentication → Metadata:
   - Add a "role" field to user metadata
   - Or use Clerk's built-in roles feature
   - This will be synced with your Convex employees table

## Integration with Convex

The application stores Clerk user IDs in the Convex `employees` table to link Clerk users with employee records:

- `clerkUserId`: The Clerk user ID (from `user.id`)
- Employee role and status are stored in Convex
- Clerk handles authentication
- Convex handles business data and role associations

## Current Status

✅ Clerk package installed (`@clerk/clerk-react`)
✅ ClerkProvider configured in root component
✅ User menu integrated with Clerk
⏳ Needs `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local`
⏳ Needs Clerk application created

## Testing

Once Clerk is configured:
1. The app will show Clerk's sign-in UI for unauthenticated users
2. After sign-in, user info will appear in the user menu
3. Logout will work via Clerk's signOut function

## Next Steps

1. Create Clerk application
2. Add `VITE_CLERK_PUBLISHABLE_KEY` to `.env.local`
3. Restart dev server
4. Test authentication flow

