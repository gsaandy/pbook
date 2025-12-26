# Super Admin Role Setup

## Overview

The application now supports a `super_admin` role with the following features:

1. **Hidden from Employee Lists** - Super admins don't appear in the employees screen
2. **Protected from Modification** - Super admins cannot be edited, deleted, or deactivated
3. **Full Admin Access** - Super admins can access all admin features
4. **Visual Distinction** - Super admins are displayed with a purple badge

## How to Create a Super Admin

### Option 1: Direct Database Update (Recommended)

1. Go to Convex Dashboard: https://dashboard.convex.dev/project/grand-bulldog-34/data/employees
2. Find the employee record you want to promote
3. Change the `role` field from `"admin"` to `"super_admin"`
4. Save the changes
5. Refresh your browser

### Option 2: Using the Employee Edit Form

1. Go to **Setup & Configuration** → **Employees**
2. Click **Edit** on the employee you want to promote
3. Change the **Role** dropdown to **Super Admin**
4. Click **Update Employee**

**Note**: Only admins can create super admins. Super admins cannot be modified after creation.

## Super Admin Features

### Access
- ✅ **Full admin access** - Can access all admin routes and features
- ✅ All admin features (Setup, Dashboard, Reconciliation, Reports)
- ✅ Can manage all employees (except other super admins)
- ✅ Can create/edit/delete shops, routes, employees
- ✅ Navigation items for admin routes are visible
- ✅ Protected routes with `requireRole="admin"` are accessible

### Protection
- ❌ Cannot be edited (name, email, phone, role)
- ❌ Cannot be deleted
- ❌ Cannot be deactivated
- ❌ Hidden from employee lists (won't appear in Setup & Configuration)

### Visibility
- Super admins are **automatically hidden** from the employees list
- They can still access all admin features
- Other admins cannot see or modify super admin accounts

## Current Super Admin

To check who has super_admin role:
1. Go to Convex Dashboard → Data → employees
2. Filter or search for records where `role = "super_admin"`

## Security Notes

- Super admins are protected at both UI and server levels
- Even direct API calls cannot modify super admin accounts
- Super admins are filtered out of employee queries automatically
- The role check uses `role === "super_admin"` instead of email-based protection

