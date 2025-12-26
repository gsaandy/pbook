# Quick Guide: Promote Yourself to Admin

## Fastest Method (30 seconds)

### Step 1: Open Convex Dashboard
Go to: https://dashboard.convex.dev/project/grand-bulldog-34/data/employees

### Step 2: Find Your Record
- Look for your email address or name in the employees table
- Click on your record to open it

### Step 3: Change Role
- Find the `role` field
- Change it from `"field_staff"` to `"admin"`
- Click **Save**

### Step 4: Refresh Browser
- Go back to your app: http://localhost:4040
- Refresh the page (Cmd+R or F5)
- Sign out and sign in again if needed

### Done! ✅
You should now see:
- Setup & Configuration (in navigation)
- Admin Dashboard (in navigation)
- End-of-Day Reconciliation (in navigation)

---

## Alternative: Use Mutation

If you prefer using code:

1. **Open Convex Dashboard** → **Functions**
2. **Find** `promoteSelfToAdmin` mutation
3. **Click "Run"** (it uses your current authenticated user)
4. **Refresh browser**

---

**Note**: After you're an admin, you can edit other employees' roles from:
**Setup & Configuration** → **Employees** → **Edit**

