import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Helper function to check if an employee is protected (super_admin cannot be modified)
async function isProtectedEmployee(ctx: any, employeeId: any): Promise<boolean> {
  const employee = await ctx.db.get(employeeId);
  return employee?.role === "super_admin";
}

// Helper function to get current employee and check role
// super_admin can access everything admin can access
async function getCurrentEmployeeAndCheckRole(
  ctx: any,
  requiredRole?: "admin" | "field_staff"
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const employee = await ctx.db
    .query("employees")
    .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", identity.subject))
    .first();

  if (!employee) {
    throw new Error("Employee record not found. Please contact your admin.");
  }

  if (requiredRole) {
    // super_admin can do everything admin can do
    if (requiredRole === "admin" && (employee.role === "admin" || employee.role === "super_admin")) {
      return employee;
    }
    if (employee.role !== requiredRole) {
      throw new Error(`Unauthorized: This action requires ${requiredRole} role.`);
    }
  }

  return employee;
}

// Shop mutations
export const createShop = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    zone: v.string(),
    currentBalance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Only admins can create shops
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    const now = Date.now();
    return await ctx.db.insert("shops", {
      name: args.name,
      address: args.address,
      phone: args.phone,
      zone: args.zone,
      currentBalance: args.currentBalance ?? 0,
      lastCollectionDate: new Date().toISOString().split("T")[0],
    });
  },
});

export const updateShop = mutation({
  args: {
    id: v.id("shops"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    zone: v.optional(v.string()),
    currentBalance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Only admins can update shops
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    const { id, ...updates } = args;
    const shop = await ctx.db.get(id);
    if (!shop) throw new Error("Shop not found");

    // If balance is being updated, we need to log it (but note is required separately)
    // We'll handle balance updates separately with audit logging
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const updateShopBalance = mutation({
  args: {
    shopId: v.id("shops"),
    newBalance: v.number(),
    note: v.string(), // Mandatory note
  },
  handler: async (ctx, args) => {
    // Only admins can update shop balance
    const employee = await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    const shop = await ctx.db.get(args.shopId);
    if (!shop) throw new Error("Shop not found");

    const previousBalance = shop.currentBalance;
    const changeAmount = args.newBalance - previousBalance;

    // Update the shop balance
    await ctx.db.patch(args.shopId, {
      currentBalance: args.newBalance,
    });

    // Create audit log
    await ctx.db.insert("balanceAuditLogs", {
      shopId: args.shopId,
      previousBalance,
      newBalance: args.newBalance,
      changeAmount,
      note: args.note,
      changedBy: employee._id,
      changedAt: Date.now(),
    });

    return args.shopId;
  },
});

export const deleteShop = mutation({
  args: { id: v.id("shops") },
  handler: async (ctx, args) => {
    // Only admins can delete shops
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
    });

    // Remove shop from all routes that reference it
    const routes = await ctx.db
      .query("routes")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    for (const route of routes) {
      if (route.shopIds.includes(args.id)) {
        await ctx.db.patch(route._id, {
          shopIds: route.shopIds.filter((shopId) => shopId !== args.id),
        });
      }
    }

    return args.id;
  },
});

// Route mutations
export const createRoute = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    shopIds: v.optional(v.array(v.id("shops"))),
  },
  handler: async (ctx, args) => {
    // Only admins can create routes
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    return await ctx.db.insert("routes", {
      name: args.name,
      description: args.description,
      shopIds: args.shopIds ?? [],
    });
  },
});

export const updateRoute = mutation({
  args: {
    id: v.id("routes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    shopIds: v.optional(v.array(v.id("shops"))),
  },
  handler: async (ctx, args) => {
    // Only admins can update routes
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const deleteRoute = mutation({
  args: { id: v.id("routes") },
  handler: async (ctx, args) => {
    // Only admins can delete routes
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
    });
    return args.id;
  },
});

// Employee mutations
export const createEmployee = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    role: v.union(v.literal("field_staff"), v.literal("admin"), v.literal("super_admin")),
    clerkUserId: v.optional(v.string()), // Optional Clerk user ID
  },
  handler: async (ctx, args) => {
    // Only admins can create employees
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    return await ctx.db.insert("employees", {
      name: args.name,
      phone: args.phone,
      email: args.email,
      role: args.role,
      status: "active",
      clerkUserId: args.clerkUserId,
    });
  },
});

export const updateEmployee = mutation({
  args: {
    id: v.id("employees"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("field_staff"), v.literal("admin"), v.literal("super_admin"))),
  },
  handler: async (ctx, args) => {
    // Only admins can update employees
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    // Check if this is a protected user
    if (await isProtectedEmployee(ctx, args.id)) {
      throw new Error("Super admin users cannot be modified.");
    }
    
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const toggleEmployeeStatus = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    // Only admins can toggle employee status
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    // Check if this is a protected user
    if (await isProtectedEmployee(ctx, args.id)) {
      throw new Error("Super admin users cannot be deactivated.");
    }
    
    const employee = await ctx.db.get(args.id);
    if (!employee) throw new Error("Employee not found");

    const newStatus = employee.status === "active" ? "inactive" : "active";
    await ctx.db.patch(args.id, {
      status: newStatus,
    });
    return args.id;
  },
});

export const deleteEmployee = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    // Only admins can delete employees
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    // Check if this is a protected user
    if (await isProtectedEmployee(ctx, args.id)) {
      throw new Error("Super admin users cannot be deleted.");
    }
    
    // Soft delete
    await ctx.db.patch(args.id, {
      deletedAt: Date.now(),
    });
    return args.id;
  },
});

// Auto-create employee record for authenticated Clerk user
// This mutation can be called by any authenticated user to ensure their employee record exists
// IMPORTANT: Clerk is the source of truth for roles. The role passed here should come from Clerk's publicMetadata.
// The role is synced from Clerk to Convex to ensure consistency.
export const ensureEmployeeRecord = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    defaultRole: v.optional(v.union(v.literal("field_staff"), v.literal("admin"), v.literal("super_admin"))),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;
    
    // Check if employee record already exists
    const existing = await ctx.db
      .query("employees")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (existing) {
      // Sync data from Clerk to Convex
      // Role is synced from Clerk (source of truth) if provided
      const updates: any = {};
      if (args.name && args.name !== existing.name) {
        updates.name = args.name;
      }
      if (args.email && args.email !== existing.email) {
        updates.email = args.email;
      }
      if (args.phone && args.phone !== existing.phone) {
        updates.phone = args.phone;
      }
      
      // Sync role from Clerk if provided (Clerk is source of truth)
      // Only update if role is provided and different from current
      if (args.defaultRole && args.defaultRole !== existing.role) {
        // Don't allow downgrading super_admin unless explicitly set
        if (existing.role !== "super_admin" || args.defaultRole === "super_admin") {
          updates.role = args.defaultRole;
        }
      }
      
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(existing._id, updates);
      }
      
      return existing._id;
    }

    // Create new employee record
    // Default to field_staff role unless specified
    const role = args.defaultRole || "field_staff";
    
    // Use provided values or fallback to identity info
    const name = args.name || identity.name || identity.email || "Unknown User";
    const email = args.email || identity.email || "";
    const phone = args.phone || "";

    return await ctx.db.insert("employees", {
      name,
      email,
      phone,
      role,
      status: "active",
      clerkUserId,
    });
  },
});

// TEMPORARY: Self-promotion mutation (remove after first admin is created)
// This allows a user to promote themselves to admin (one-time use)
export const promoteSelfToAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const clerkUserId = identity.subject;
    
    // Find the employee record
    const employee = await ctx.db
      .query("employees")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
      .first();

    if (!employee) {
      throw new Error("Employee record not found. Please sign in first.");
    }

    // Check if already admin
    if (employee.role === "admin") {
      return { message: "You are already an admin!", employeeId: employee._id };
    }

    // Promote to admin
    await ctx.db.patch(employee._id, {
      role: "admin",
    });

    return { 
      message: "Successfully promoted to admin! Please refresh your browser.", 
      employeeId: employee._id 
    };
  },
});

// Route assignment mutations
export const assignRoute = mutation({
  args: {
    employeeId: v.id("employees"),
    routeId: v.id("routes"),
    date: v.string(), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    // Only admins can assign routes
    await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    // Check if assignment already exists for this employee and date
    const existing = await ctx.db
      .query("routeAssignments")
      .withIndex("by_employee_date", (q) => 
        q.eq("employeeId", args.employeeId).eq("date", args.date)
      )
      .first();

    if (existing) {
      // Update existing assignment
      await ctx.db.patch(existing._id, {
        routeId: args.routeId,
        status: "active",
      });
      return existing._id;
    } else {
      // Create new assignment
      return await ctx.db.insert("routeAssignments", {
        employeeId: args.employeeId,
        routeId: args.routeId,
        date: args.date,
        status: "active",
        assignedAt: Date.now(),
      });
    }
  },
});

export const cancelRouteAssignment = mutation({
  args: { assignmentId: v.id("routeAssignments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.assignmentId, {
      status: "cancelled",
    });
    return args.assignmentId;
  },
});

// Transaction mutations
export const logCollection = mutation({
  args: {
    employeeId: v.id("employees"),
    shopId: v.id("shops"),
    amount: v.number(),
    paymentMode: v.union(v.literal("cash"), v.literal("upi"), v.literal("cheque")),
    reference: v.optional(v.string()),
    gpsLocation: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    // Only field staff can log collections, and only for themselves
    const currentEmployee = await getCurrentEmployeeAndCheckRole(ctx, "field_staff");
    
    // Verify the employee is logging for themselves
    if (currentEmployee._id !== args.employeeId) {
      throw new Error("Unauthorized: You can only log collections for yourself");
    }
    
    const now = Date.now();
    
    // Create transaction
    const transactionId = await ctx.db.insert("transactions", {
      employeeId: args.employeeId,
      shopId: args.shopId,
      amount: args.amount,
      paymentMode: args.paymentMode,
      reference: args.reference,
      timestamp: now,
      gpsLocation: args.gpsLocation,
      status: "completed",
    });

    // Update shop balance (reduce by amount collected)
    const shop = await ctx.db.get(args.shopId);
    if (shop) {
      const newBalance = Math.max(0, shop.currentBalance - args.amount);
      await ctx.db.patch(args.shopId, {
        currentBalance: newBalance,
        lastCollectionDate: new Date().toISOString().split("T")[0],
      });
    }

    return transactionId;
  },
});

// EOD Reconciliation mutations
export const verifyEmployeeSettlement = mutation({
  args: {
    settlementId: v.id("dailyReconciliations"),
    actualCash: v.optional(v.number()),
    note: v.optional(v.string()),
    status: v.union(v.literal("verified"), v.literal("mismatch")),
  },
  handler: async (ctx, args) => {
    // Only admins can verify employee settlements
    const adminEmployee = await getCurrentEmployeeAndCheckRole(ctx, "admin");
    
    // Get the existing reconciliation
    const settlement = await ctx.db.get(args.settlementId);
    if (!settlement) {
      throw new Error("Settlement not found");
    }

    // Calculate variance if actualCash is provided
    const actualCash = args.actualCash ?? settlement.expectedCash;
    const variance = actualCash - settlement.expectedCash;

    // Update the reconciliation
    await ctx.db.patch(args.settlementId, {
      actualCash,
      variance,
      status: args.status,
      note: args.note,
      verifiedAt: Date.now(),
      verifiedBy: adminEmployee._id,
    });

    return args.settlementId;
  },
});

export const closeDailyReconciliation = mutation({
  args: {
    date: v.string(), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    // Get all reconciliations for this date
    const reconciliations = await ctx.db
      .query("dailyReconciliations")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    // Update all to "closed" status
    for (const reconciliation of reconciliations) {
      await ctx.db.patch(reconciliation._id, {
        status: "closed",
      });
    }

    return reconciliations.length;
  },
});
