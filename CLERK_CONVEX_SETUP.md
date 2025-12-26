# Clerk + Convex Integration Setup

This guide explains how to set up Clerk authentication with Convex for role-based access control.

## Prerequisites

1. Clerk account and application created
2. Convex project initialized

## Setup Steps

### 1. Create JWT Template in Clerk

1. Go to your Clerk Dashboard
2. Navigate to **JWT Templates** (under "Configure" in the sidebar)
3. Click **New template**
4. Select **Convex** from the template list
5. **Important:** Do NOT rename the JWT token. It must be called `convex`.
6. **Add Role Claim**: In the **Claims** section, add:
   ```json
   {
     "role": "{{user.public_metadata.role}}"
   }
   ```
   This ensures the role from Clerk is available in the JWT token for server-side access.
7. Copy the **Issuer** URL (your Clerk Frontend API URL)
   - Development: `https://verb-noun-00.clerk.accounts.dev`
   - Production: `https://clerk.<your-domain>.com`

### 2. Configure Convex Backend

1. The `convex/auth.config.ts` file has been created with the following structure:

```typescript
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

2. Set the `CLERK_JWT_ISSUER_DOMAIN` environment variable in your Convex Dashboard:
   - Go to your Convex Dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add `CLERK_JWT_ISSUER_DOMAIN` with your Clerk Frontend API URL

3. Deploy the configuration:
   ```bash
   npx convex dev
   ```

### 3. Configure Frontend

1. Set your Clerk Publishable Key in `.env.local`:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
   ```

2. The application uses `ConvexProviderWithClerk` which integrates Clerk with Convex automatically.

### 4. Link Employees to Clerk Users

When creating an employee record, you need to link it to a Clerk user:

1. Get the Clerk user ID (from Clerk Dashboard or via `useUser()` hook)
2. When creating/updating an employee, set the `clerkUserId` field to the Clerk user ID

Example mutation:
```typescript
await createEmployee({
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  role: "field_staff",
  clerkUserId: clerkUser.id, // Link to Clerk user
});
```

## Role-Based Access Control

**Important**: Clerk is the source of truth for user roles. Roles are stored in Clerk's `publicMetadata` and automatically synced to Convex.

The application supports three roles:
- **field_staff** (default): Access to Daily Operations and Reports only
- **admin**: Full access to all features
- **super_admin**: Full access, but hidden from employee lists and protected from modification

### Setting Roles in Clerk

1. Go to **Clerk Dashboard** → **Users**
2. Select a user
3. In **Metadata** section, click **Edit** on **Public metadata**
4. Add `role` field with value: `"field_staff"`, `"admin"`, or `"super_admin"`
5. Click **Save**

The role will be automatically synced to Convex when the user signs in.

See `CLERK_ROLES_SETUP.md` for detailed instructions.

### Route Protection

Routes are protected using the `ProtectedRoute` component:

```typescript
<ProtectedRoute requireAuth requireRole="admin">
  <YourComponent />
</ProtectedRoute>
```

### Navigation Filtering

Navigation items are automatically filtered based on user role. Items with `requireRole` are only shown to users with the appropriate role.

### Server-Side Authorization

In Convex queries and mutations, you can check the authenticated user's role:

```typescript
export const myQuery = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Get current employee
    const employee = await ctx.db
      .query("employees")
      .withIndex("by_clerk_user_id", (q) => 
        q.eq("clerkUserId", identity.subject)
      )
      .first();
    
    if (!employee || employee.role !== "admin") {
      throw new Error("Unauthorized");
    }
    
    // Your query logic here
  },
});
```

## Testing

1. Sign in with a Clerk account
2. Ensure the employee record is linked to the Clerk user ID
3. Verify that navigation items are filtered based on role
4. Test that protected routes redirect unauthorized users

## Troubleshooting

### "Not authenticated" errors
- Ensure `CLERK_JWT_ISSUER_DOMAIN` is set in Convex Dashboard
- Verify the JWT template in Clerk is named `convex` (not renamed)
- Run `npx convex dev` to sync the auth configuration

### Navigation items not filtering
- Ensure the employee record has a `clerkUserId` set
- Check that the employee record has a valid `role` field

### Routes not protecting
- Ensure `ProtectedRoute` wraps the route component
- Check that `requireRole` matches the user's role

