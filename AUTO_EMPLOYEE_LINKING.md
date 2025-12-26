# Automatic Employee Record Linking

## Overview

The application now **automatically creates employee records** when users sign in for the first time. No manual linking required!

## How It Works

1. **User signs in with Clerk** → Clerk authentication succeeds
2. **Convex validates JWT** → User is authenticated with Convex
3. **Auto-create employee record** → If no employee record exists, one is created automatically
4. **Default role assignment** → New users get `field_staff` role by default
5. **Admin promotion** → Admins can promote users to `admin` role later

## Implementation Details

### Automatic Creation

The `useCurrentUser()` hook in `src/lib/auth.ts` automatically:
- Detects when a Clerk user signs in but has no employee record
- Calls `ensureEmployeeRecord` mutation
- Creates employee record with:
  - Name from Clerk profile
  - Email from Clerk profile
  - Phone from Clerk profile (if available)
  - Default role: `field_staff`
  - Status: `active`
  - Clerk User ID linked automatically

### Mutation: `ensureEmployeeRecord`

Located in `convex/mutations.ts`, this mutation:
- ✅ Checks if employee record exists (by `clerkUserId`)
- ✅ Creates new record if missing
- ✅ Updates existing record if name/email changed in Clerk
- ✅ Can be called by any authenticated user (no admin required)
- ✅ Defaults to `field_staff` role (safe default)

## Benefits

1. **Zero Manual Work** - Users can sign in immediately
2. **Self-Service** - No admin intervention needed for basic access
3. **Automatic Sync** - Name/email updates from Clerk automatically sync
4. **Safe Defaults** - New users get `field_staff` role (limited permissions)
5. **Admin Control** - Admins can still manage roles and permissions

## Admin Workflow

### Promoting Users to Admin

1. User signs in → Employee record auto-created with `field_staff` role
2. Admin goes to **Setup & Configuration** → **Employees**
3. Admin finds the user and edits their record
4. Admin changes role from `field_staff` to `admin`
5. User now has admin access

### Pre-creating Employees (Optional)

Admins can still pre-create employee records:
1. Go to **Setup & Configuration** → **Employees** → **Add Employee**
2. Enter name, email, phone
3. Set role (admin or field_staff)
4. **Leave `clerkUserId` empty** - it will be auto-linked on first sign-in
5. Or enter Clerk User ID if you have it

## Edge Cases Handled

- ✅ **User signs in before employee record exists** → Auto-created
- ✅ **User updates name/email in Clerk** → Employee record syncs automatically
- ✅ **Multiple sign-ins** → Only creates once, then updates if needed
- ✅ **Concurrent requests** → Safe to call multiple times

## Configuration

### Default Role

To change the default role for new users, edit `src/lib/auth.ts`:

```typescript
ensureEmployee({
  // ...
  defaultRole: "field_staff", // Change to "admin" if needed
})
```

**Note:** It's recommended to keep default as `field_staff` for security.

### Disable Auto-Creation

If you want to disable auto-creation and require manual employee creation:

1. Remove the `useEffect` in `useCurrentUser()` hook
2. Users will see "Employee record not found" message
3. Admins must create employee records manually

## Troubleshooting

### User can't access after sign-in

1. Check if employee record was created:
   - Go to Convex Dashboard → Data → `employees` table
   - Search for the user's Clerk User ID
2. Check the role:
   - If role is `field_staff`, they can only access Daily Operations
   - Promote to `admin` if they need admin features
3. Check console for errors:
   - Open browser DevTools (F12)
   - Look for errors in Console tab

### Employee record not auto-creating

1. Verify Convex authentication is working:
   - Check `CLERK_JWT_ISSUER_DOMAIN` is set in Convex Dashboard
   - Run `npx convex dev` to sync auth config
2. Check browser console for errors
3. Verify Clerk user has email/name in profile

## Migration from Manual Linking

If you have existing users who were manually linked:

1. ✅ **No changes needed** - Existing records work as-is
2. ✅ **Auto-sync enabled** - Name/email will sync from Clerk automatically
3. ✅ **New users benefit** - All new sign-ins auto-create records

