# Role Management - Quick Reference

## Overview

**Clerk is the source of truth for user roles.** All role management should be done in Clerk Dashboard.

## Quick Steps

### To Set a User's Role:

1. Go to **Clerk Dashboard** → **Users**
2. Select the user
3. Click **Edit** on **Public metadata**
4. Add/update `role` field:
   - `"field_staff"` - Default role for field employees
   - `"admin"` - Full admin access
   - `"super_admin"` - Admin access, hidden from lists, protected
5. Click **Save**

### Role Values

| Role | Access | Notes |
|------|--------|-------|
| `field_staff` | Daily Operations, Reports | Default role |
| `admin` | All features | Can manage everything |
| `super_admin` | All features | Hidden from employee lists, cannot be modified |

## How It Works

1. **Role stored in Clerk**: `user.publicMetadata.role`
2. **Synced to Convex**: Automatically on sign-in via `ensureEmployeeRecord`
3. **Used for authorization**: Both client and server check the role

## Important Notes

- ✅ **Always update roles in Clerk** - Don't update directly in Convex
- ✅ **Role syncs automatically** - Changes take effect on next sign-in
- ✅ **JWT includes role** - Configure JWT template to include role claim
- ❌ **Don't modify roles in Convex** - Clerk will override on next sync

## Documentation

- **Detailed Setup**: See `CLERK_ROLES_SETUP.md`
- **Integration Guide**: See `CLERK_CONVEX_SETUP.md`
- **Super Admin Info**: See `SUPER_ADMIN_SETUP.md`

