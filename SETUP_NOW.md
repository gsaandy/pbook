# Quick Setup - Do This Now! 🚀

You're seeing the "Authentication Setup Required" screen. Here's exactly what to do:

## Your Clerk Issuer Domain

Based on your Clerk publishable key, your issuer domain is:

```
https://modest-pheasant-12.clerk.accounts.dev
```

## Steps (5 minutes)

### 1. Set Environment Variable in Convex Dashboard

1. Go to: https://dashboard.convex.dev
2. Select your project
3. Click **Settings** (left sidebar)
4. Click **Environment Variables**
5. Click **Add Variable**
6. Enter:
   - **Name:** `CLERK_JWT_ISSUER_DOMAIN`
   - **Value:** `https://modest-pheasant-12.clerk.accounts.dev`
   - **Environment:** Development
7. Click **Save**

### 2. Deploy Auth Config

In your terminal, run:

```bash
cd /Users/ssudhakaran/dev/ps-stores
npx convex dev
```

Wait for it to say "Deployed successfully" or similar.

### 3. Refresh Browser

1. Go back to your browser
2. Refresh the page (F5 or Cmd+R)
3. Sign in again if needed

### 4. That's It! 🎉

- ✅ Employee record will be auto-created
- ✅ You'll have `field_staff` role by default
- ✅ You can access Daily Operations immediately
- ✅ Admin can promote you later if needed

## Need Admin Access?

If you need admin access:
1. Sign in (employee record auto-created)
2. Ask an existing admin to:
   - Go to Setup & Configuration → Employees
   - Find your name
   - Edit your record
   - Change role from `field_staff` to `admin`

## Troubleshooting

**Still seeing the error?**
- Make sure you saved the environment variable in Convex Dashboard
- Make sure `npx convex dev` completed successfully
- Check browser console (F12) for any errors
- Try signing out and signing in again

