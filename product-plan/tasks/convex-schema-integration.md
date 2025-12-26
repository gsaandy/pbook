
# Implementation Plan: PSBook Backend (Convex + Clerk + Bun)

## Context
We are building the backend for **PSBook** using React + Convex + Clerk.
The environment is **Bun**.
We are implementing the "Invite & Claim" auth pattern where Admins pre-create employees, and Clerk Webhooks sync the account upon login.

## Step 1: Database Schema (The "Revised" Version)

**Goal:** Define the robust schema with Audit Logs, Reconciliation, and optimized relationships.

* [ ] Overwrite `convex/schema.ts` with the Final Approved Schema:
* **Audit Logs:** `balanceAuditLogs` table.
* **Reconciliation:** `dailyReconciliations` table.
* **Shops:** Must have `routeId` (Single source of truth for location).
* **Transactions:** `gpsLocation` must be optional.

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. AUDIT LOGS (Perfect for accountability)
  balanceAuditLogs: defineTable({
    changeAmount: v.float64(),
    changedAt: v.float64(),
    changedBy: v.id("employees"),
    newBalance: v.float64(),
    note: v.string(),
    previousBalance: v.float64(),
    shopId: v.id("shops"),
  })
    .index("by_changed_at", ["changedAt"])
    .index("by_shop", ["shopId"]),

  // 2. RECONCILIATION (Your best addition)
  dailyReconciliations: defineTable({
    date: v.string(), // "2023-10-27"
    employeeId: v.id("employees"),
    
    expectedCash: v.float64(), // Calculated from transactions
    actualCash: v.optional(v.float64()), // What admin counted
    variance: v.optional(v.float64()), // expected - actual
    
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("mismatch"),
      v.literal("closed")
    ),
    note: v.optional(v.string()),
    verifiedAt: v.optional(v.float64()),
    verifiedBy: v.optional(v.id("employees")),
  })
    .index("by_date", ["date"])
    .index("by_employee_date", ["employeeId", "date"])
    .index("by_status", ["status"]),

  // 3. EMPLOYEES (Standard)
  employees: defineTable({
    clerkUserId: v.optional(v.string()), // Great for Clerk Auth
    email: v.string(),
    name: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("field_staff"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
    status: v.union(v.literal("active"), v.literal("inactive")),
    deletedAt: v.optional(v.float64()),
  })
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  // 4. ROUTE ASSIGNMENTS (Daily Logic)
  routeAssignments: defineTable({
    date: v.string(),
    employeeId: v.id("employees"),
    routeId: v.id("routes"),
    assignedAt: v.float64(),
    status: v.union(
      v.literal("active"), 
      v.literal("completed"), 
      v.literal("cancelled")
    ),
  })
    .index("by_date", ["date"])
    .index("by_employee_date", ["employeeId", "date"]), // "What is John doing today?"

  // 5. ROUTES (Simplified)
  routes: defineTable({
    name: v.string(),
    description: v.optional(v.string()), // Made optional
    deletedAt: v.optional(v.float64()),
    // Removed 'shopIds' array -> Moved to 'shops' table
  }).index("by_deleted", ["deletedAt"]),

  // 6. SHOPS (The Source of Truth)
  shops: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()), // Phone might be missing
    zone: v.string(),
    
    // Core Financials
    currentBalance: v.float64(),
    lastCollectionDate: v.optional(v.string()),
    
    // Relationships
    routeId: v.optional(v.id("routes")), // The FIX: Link shop to route here
    deletedAt: v.optional(v.float64()),
  })
    .index("by_deleted", ["deletedAt"])
    .index("by_route", ["routeId"]) // "Get me all shops in Route A"
    .index("by_zone", ["zone"]),

  // 7. TRANSACTIONS
  transactions: defineTable({
    timestamp: v.float64(),
    amount: v.float64(),
    
    // Links
    shopId: v.id("shops"),
    employeeId: v.id("employees"),
    
    paymentMode: v.union(
      v.literal("cash"),
      v.literal("upi"),
      v.literal("cheque")
    ),
    reference: v.optional(v.string()), // UTR / Cheque No
    
    // Make GPS Optional to prevent errors in basements/offline
    gpsLocation: v.optional(v.object({
      lat: v.float64(),
      lng: v.float64(),
    })),
    
    status: v.union(
      v.literal("completed"),
      v.literal("adjusted"),
      v.literal("reversed")
    ),
  })
    .index("by_employee", ["employeeId"])
    // Composite index for "Get John's transactions for today"
    .index("by_employee_timestamp", ["employeeId", "timestamp"]) 
    .index("by_shop", ["shopId"]),
});
```

---

## Step 2: Authentication Config

**Goal:** Bind Clerk to Convex.

* [ ] Create `convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};

```

* [ ] **Action Required:** Go to Convex Dashboard > Settings > Environment Variables.
* Add `CLERK_JWT_ISSUER_DOMAIN` (e.g., `https://your-domain.clerk.accounts.dev`).
* Add `CLERK_WEBHOOK_SECRET` (Get this from Clerk Dashboard > Webhooks > Signing Secret).



---

## Step 3: Webhook Infrastructure (The Sync)

**Goal:** Link Clerk Users to "Placeholder" Employees.

* [ ] Create `convex/employees.ts` (Internal Mutation):
* Function: `linkUser`
* Arguments: `{ email: v.string(), clerkUserId: v.string() }`
* Logic: Find employee by `email`. If found, patch `clerkUserId` and set `status: "active"`.


* [ ] Create `convex/http.ts` (The Webhook Handler):
* Route: `/clerk-webhook`
* Logic: Verify Svix signature. On `user.created`, call `internal.employees.linkUser`.



---

## Step 4: Core Logic (Mutations)

**Goal:** Implement the "Cash Collection" logic.

* [ ] Implement `collectCash` in `convex/transactions.ts`:
* **Check Role:** Ensure `ctx.auth` user maps to an 'active' employee.
* **Transaction:** Insert record.
* **Balance:** Update `shop.currentBalance`.
* **Audit:** Insert into `balanceAuditLogs`.



---

## Step 5: Verification

1. **Bun Check:** Run `bunx convex dev`. Ensure no type errors.
2. **Auth Sync:** Create a test user in Clerk. Check Convex Dashboard `employees` table to see if `clerkUserId` was populated automatically.

---

### The Code for Step 3 (Copy & Paste)

Since setting up Svix with Convex handles can be annoying, here is the working code for the webhook logic.

#### 1. The Internal Mutation (`convex/employees.ts`)
This is the function that actually updates your database. It is "internal" so it can't be called from the frontend.

```typescript
import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const linkUser = internalMutation({
  args: { email: v.string(), clerkUserId: v.string() },
  handler: async (ctx, args) => {
    // 1. Find the placeholder employee
    const employee = await ctx.db
      .query("employees")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!employee) {
      console.warn(`Webhook: No placeholder found for ${args.email}`);
      return; // Or handle as an unauthorized sign-up
    }

    // 2. Link the accounts
    await ctx.db.patch(employee._id, {
      clerkUserId: args.clerkUserId,
      status: "active",
      // Optional: Sync name from Clerk if needed
    });
    
    console.log(`Webhook: Successfully linked ${args.email}`);
  },
});
```

#### 2. The HTTP Handler (`convex/http.ts`)

This receives the POST request from Clerk.

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const payloadString = await request.text();
    const headerPayload = request.headers;

    try {
      const svix_id = headerPayload.get("svix-id");
      const svix_timestamp = headerPayload.get("svix-timestamp");
      const svix_signature = headerPayload.get("svix-signature");

      if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occured -- no svix headers", { status: 400 });
      }

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);
      const evt = wh.verify(payloadString, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as any;

      // Handle the event
      if (evt.type === "user.created") {
        const { id, email_addresses } = evt.data;
        // Clerk sends an array of emails. We usually grab the first one.
        const email = email_addresses[0]?.email_address;

        if (email) {
          await ctx.runMutation(internal.employees.linkUser, {
            clerkUserId: id,
            email: email,
          });
        }
      }

      return new Response("Webhook processed", { status: 200 });

    } catch (err) {
      console.error("Webhook Error:", err);
      return new Response("Error occurred", { status: 400 });
    }
  }),
});

export default http;
```