# Verify Your Setup - Checklist ✅

Use this checklist to verify everything is configured correctly:

## ✅ Step 1: Clerk JWT Template

1. Go to: https://dashboard.clerk.com
2. Select your application: **modest-pheasant-12**
3. Navigate to: **Configure** → **JWT Templates**
4. Check:
   - [ ] You have a template named **"Convex"**
   - [ ] The token name is exactly **"convex"** (not "Convex" or "CONVEX")
   - [ ] The Issuer URL is: `https://modest-pheasant-12.clerk.accounts.dev`

**If missing:** Click "New template" → Select "Convex" → Keep token name as "convex"

## ✅ Step 2: Convex Environment Variable

1. Go to: https://dashboard.convex.dev
2. Select your project: **grand-bulldog-34**
3. Navigate to: **Settings** → **Environment Variables**
4. Check:
   - [ ] Variable name: `CLERK_JWT_ISSUER_DOMAIN`
   - [ ] Variable value: `https://modest-pheasant-12.clerk.accounts.dev`
   - [ ] Environment: **Development**

**If missing:** Click "Add Variable" and set it.

## ✅ Step 3: Convex Dev Running

In your terminal, check:
```bash
ps aux | grep "convex dev"
```

Should show a running process. If not:
```bash
cd /Users/ssudhakaran/dev/ps-stores
npx convex dev
```

## ✅ Step 4: Verify Auth Config Deployed

After running `npx convex dev`, you should see:
- ✅ "Deployed successfully" or similar message
- ✅ No errors about `CLERK_JWT_ISSUER_DOMAIN`

## ✅ Step 5: Test in Browser

1. Open: http://localhost:4040
2. Sign in with Clerk
3. Check browser console (F12) for errors
4. Should see:
   - ✅ No authentication errors
   - ✅ Application loads (not sign-in page)
   - ✅ Employee record auto-created

## Common Issues

### Issue: "CLERK_JWT_ISSUER_DOMAIN is not defined"
**Fix:** Set the environment variable in Convex Dashboard (Step 2)

### Issue: "Invalid JWT token"
**Fix:** 
1. Check JWT template exists in Clerk (Step 1)
2. Verify token name is exactly "convex"
3. Make sure you ran `npx convex dev` after setting the env var

### Issue: Still seeing sign-in page after setup
**Fix:**
1. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)
2. Sign out and sign in again
3. Check browser console for specific errors

## Still Not Working?

1. **Check Convex Logs:**
   - Go to Convex Dashboard → Logs
   - Look for authentication errors

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Look in Console tab for errors
   - Look in Network tab for failed requests

3. **Verify Clerk User:**
   - Make sure you're signed in with Clerk
   - Check Clerk Dashboard → Users to see your user

4. **Restart Everything:**
   ```bash
   # Stop convex dev (Ctrl+C)
   # Restart it
   npx convex dev
   
   # Restart dev server
   bun run dev
   ```

