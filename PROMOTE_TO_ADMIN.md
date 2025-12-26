# How to Promote Yourself to Admin

Since you're currently a `field_staff` user, you can't access the Setup & Configuration page to change your role. Here are two ways to promote yourself to admin:

## Option 1: Using Convex Dashboard (Recommended)

1. **Go to Convex Dashboard**: https://dashboard.convex.dev
2. **Select your project**: `grand-bulldog-34`
3. **Go to Data** (left sidebar)
4. **Click on `employees` table**
5. **Find your employee record** (look for your email or name)
6. **Click on the record** to edit it
7. **Change the `role` field** from `"field_staff"` to `"admin"`
8. **Save the changes**
9. **Refresh your browser** - you should now have admin access!

## Option 2: Using a Temporary Mutation (One-time use)

I've created a temporary mutation that allows you to promote yourself. After using it once, you can remove it for security.

### Steps:

1. **Run this mutation in Convex Dashboard**:
   - Go to Convex Dashboard → Functions
   - Find `promoteSelfToAdmin` mutation
   - Click "Run" (it will use your current authenticated user)

2. **Or use the Convex CLI**:
   ```bash
   npx convex run mutations:promoteSelfToAdmin
   ```

3. **Refresh your browser** - you should now have admin access!

**Note**: After promoting yourself, you can delete this mutation for security.

## Option 3: Ask Another Admin

If you have another admin user, they can:
1. Go to **Setup & Configuration** → **Employees**
2. Find your name
3. Click **Edit**
4. Change your role to **Admin**
5. Save

---

## Verify Your Role

After promoting yourself:
1. Sign out and sign in again (or refresh the page)
2. You should now see:
   - ✅ **Setup & Configuration** in the navigation
   - ✅ **Admin Dashboard** in the navigation
   - ✅ **End-of-Day Reconciliation** in the navigation
3. You can now edit other employees' roles from Setup & Configuration

