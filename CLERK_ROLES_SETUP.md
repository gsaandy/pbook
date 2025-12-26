# Clerk Roles Setup Guide

## Overview

This application uses **Clerk as the source of truth** for user roles. Roles are stored in Clerk's `publicMetadata` and automatically synced to Convex when employee records are created or updated.

## Why Clerk as Source of Truth?

✅ **Single Source of Truth**: Roles are managed in one place (Clerk Dashboard)  
✅ **Centralized Management**: Easy to update roles without touching code  
✅ **JWT Integration**: Roles are included in JWT tokens for server-side access  
✅ **Security**: Role changes are managed through Clerk's secure dashboard  
✅ **Best Practice**: Follows industry standards for role-based access control

## Setup Steps

### 1. Configure JWT Template in Clerk

To include roles in JWT tokens (for server-side access):

1. Go to **Clerk Dashboard** → **JWT Templates**
2. Find or create the **Convex** template (must be named `convex`)
3. Click **Edit** on the template
4. In the **Claims** section, add:

```json
{
  "role": "{{user.public_metadata.role}}"
}
```

This ensures the role is available in the JWT token that Convex receives.

### 2. Set Up Roles in Clerk

#### Option A: Using Clerk Dashboard (Recommended)

1. Go to **Clerk Dashboard** → **Users**
2. Select a user
3. Scroll to **Metadata** section
4. Click **Edit** on **Public metadata**
5. Add a `role` field with one of these values:
   - `"field_staff"` - For field staff employees
   - `"admin"` - For admin users
   - `"super_admin"` - For super admin users (hidden from employee lists)

Example:
```json
{
  "role": "admin"
}
```

6. Click **Save**

#### Option B: Using Clerk API

You can also set roles programmatically using Clerk's API:

```typescript
import { clerkClient } from '@clerk/clerk-sdk-node';

await clerkClient.users.updateUserMetadata('user_xxx', {
  publicMetadata: {
    role: 'admin'
  }
});
```

### 3. Role Values

The following role values are supported:

- **`field_staff`** (default)
  - Access to Daily Operations and Reports
  - Cannot access Setup, Dashboard, or Reconciliation

- **`admin`**
  - Full access to all features
  - Can manage employees, shops, routes
  - Can access Dashboard and Reconciliation

- **`super_admin`**
  - Same access as admin
  - Hidden from employee lists
  - Cannot be modified or deleted
  - Protected from all changes

### 4. How It Works

1. **User Signs In**: Clerk authenticates the user
2. **Role Read from Clerk**: Application reads `user.publicMetadata.role` from Clerk
3. **Employee Record Created**: If no employee record exists, one is created with the role from Clerk
4. **Role Synced**: The role from Clerk is stored in Convex for quick access
5. **Authorization**: Both client and server use the role for access control

### 5. Updating Roles

To change a user's role:

1. Go to **Clerk Dashboard** → **Users**
2. Select the user
3. Update the `role` in **Public metadata**
4. The next time the user signs in, their role will be synced to Convex

**Note**: For immediate sync, you can also update the role directly in Convex, but Clerk remains the source of truth and will override on next sign-in.

### 6. Migration from Convex-Only Roles

If you have existing users with roles stored only in Convex:

1. For each user, set their role in Clerk's public metadata
2. The role will be synced to Convex on their next sign-in
3. You can also manually update Convex records, but Clerk will be the source of truth going forward

## Troubleshooting

### Role Not Updating

- **Check Clerk Metadata**: Verify the role is set in Clerk Dashboard → Users → Metadata
- **Check JWT Template**: Ensure the JWT template includes the role claim
- **Sign Out/In**: User may need to sign out and sign back in for changes to take effect

### Role Not Available in Convex

- **Check JWT Template**: The role must be included in the JWT template
- **Check publicMetadata**: Ensure the role is in `publicMetadata`, not `privateMetadata`
- **Verify Sync**: Check that `ensureEmployeeRecord` mutation is being called

### Super Admin Still Visible

- **Check Query Filter**: The `getEmployees` query filters out `super_admin` users
- **Verify Role**: Ensure the role is exactly `"super_admin"` (case-sensitive)

## Best Practices

1. **Always Update Roles in Clerk**: Don't update roles directly in Convex
2. **Use Consistent Values**: Always use lowercase with underscores (`field_staff`, not `FieldStaff`)
3. **Document Role Changes**: Keep track of role changes for audit purposes
4. **Test Role Changes**: After updating a role, test that access control works correctly
5. **Backup Roles**: Consider exporting role assignments periodically

## Security Notes

- Roles in `publicMetadata` are visible in JWT tokens (this is intentional for server-side access)
- Use `privateMetadata` for sensitive data that shouldn't be in JWTs
- Super admins are protected at both UI and server levels
- Role changes in Clerk require appropriate permissions

## Example: Setting Up a New Admin User

1. User signs up via Clerk (or is invited)
2. Go to Clerk Dashboard → Users → Select user
3. Set `publicMetadata.role = "admin"`
4. User signs in to the application
5. Employee record is automatically created with `role: "admin"`
6. User now has full admin access

## Support

For issues or questions:
- Check Clerk documentation: https://clerk.com/docs
- Check Convex documentation: https://docs.convex.dev
- Review JWT template configuration in Clerk Dashboard

