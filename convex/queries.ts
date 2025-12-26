import { query } from "./_generated/server";
import { v } from "convex/values";

// Get all active shops (not soft deleted)
export const getShops = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("shops")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();
  },
});

// Get all active routes (not soft deleted)
export const getRoutes = query({
  args: {},
  handler: async (ctx) => {
    const routes = await ctx.db
      .query("routes")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Resolve shop references to get shop details
    return Promise.all(
      routes.map(async (route) => {
        const shops = await Promise.all(
          route.shopIds.map(async (shopId) => {
            try {
              return await ctx.db.get(shopId);
            } catch {
              return null; // Shop was deleted, filter it out
            }
          })
        );
        // Filter out null shops (deleted ones)
        const validShops = shops.filter((shop) => shop !== null && !shop.deletedAt);
        return {
          ...route,
          shopIds: validShops.map((shop) => shop._id),
        };
      })
    );
  },
});

// Get all employees (with optional filter for inactive)
export const getEmployees = query({
  args: {
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("employees")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      // Hide super_admin users from employee lists
      .filter((q) => q.neq(q.field("role"), "super_admin"));

    if (!args.includeInactive) {
      query = query.filter((q) => q.eq(q.field("status"), "active"));
    }

    return await query.collect();
  },
});

// Get a single shop by ID
export const getShop = query({
  args: { id: v.id("shops") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get a single route by ID
export const getRoute = query({
  args: { id: v.id("routes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get a single employee by ID
export const getEmployee = query({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get employee by Clerk user ID (for client-side use)
export const getEmployeeByClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("employees")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
  },
});

// Get current employee from auth identity
export const getCurrentEmployee = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Get Clerk user ID from identity token
    // The identity.subject is the Clerk user ID
    const clerkUserId = identity.subject;
    
    return await ctx.db
      .query("employees")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
      .first();
  },
});

// Get audit logs for a shop
export const getShopAuditLogs = query({
  args: { shopId: v.id("shops") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("balanceAuditLogs")
      .withIndex("by_shop", (q) => q.eq("shopId", args.shopId))
      .order("desc")
      .collect();
  },
});

// Get transactions for a specific date (today by default)
export const getTransactionsForDate = query({
  args: {
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00Z').getTime();
    const endOfDay = new Date(targetDate + 'T23:59:59Z').getTime();

    return await ctx.db
      .query("transactions")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", startOfDay).lte("timestamp", endOfDay)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .collect();
  },
});

// Get transactions for a specific employee on a date
export const getEmployeeTransactionsForDate = query({
  args: {
    employeeId: v.id("employees"),
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00Z').getTime();
    const endOfDay = new Date(targetDate + 'T23:59:59Z').getTime();

    return await ctx.db
      .query("transactions")
      .withIndex("by_employee_timestamp", (q) => 
        q.eq("employeeId", args.employeeId)
          .gte("timestamp", startOfDay)
          .lte("timestamp", endOfDay)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .collect();
  },
});

// Get dashboard summary for a date
export const getDashboardSummary = query({
  args: {
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00Z').getTime();
    const endOfDay = new Date(targetDate + 'T23:59:59Z').getTime();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", startOfDay).lte("timestamp", endOfDay)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const totalCollected = transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const cashInHand = transactions
      .filter((txn) => txn.paymentMode === "cash")
      .reduce((sum, txn) => sum + txn.amount, 0);
    const digitalPayments = transactions
      .filter((txn) => txn.paymentMode === "upi" || txn.paymentMode === "cheque")
      .reduce((sum, txn) => sum + txn.amount, 0);

    return {
      totalCollected,
      cashInHand,
      digitalPayments,
      lastUpdated: new Date().toISOString(),
    };
  },
});

// Get employee status for dashboard
export const getEmployeeStatus = query({
  args: {
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00Z').getTime();
    const endOfDay = new Date(targetDate + 'T23:59:59Z').getTime();

    // Get all active field staff employees
    const employees = await ctx.db
      .query("employees")
      .filter((q) => 
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.eq(q.field("status"), "active"),
          q.eq(q.field("role"), "field_staff")
        )
      )
      .collect();

    // Get all transactions for today
    const allTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", startOfDay).lte("timestamp", endOfDay)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    // Get routes (for route assignment info - simplified for now)
    const routes = await ctx.db
      .query("routes")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    // Calculate status for each employee
    const employeeStatus = await Promise.all(
      employees.map(async (emp) => {
        const empTransactions = allTransactions.filter(
          (txn) => txn.employeeId === emp._id
        );

        const collectionsCount = empTransactions.length;
        const cashInHand = empTransactions
          .filter((txn) => txn.paymentMode === "cash")
          .reduce((sum, txn) => sum + txn.amount, 0);

        const lastTransaction = empTransactions.sort(
          (a, b) => b.timestamp - a.timestamp
        )[0];
        const lastActivity = lastTransaction
          ? new Date(lastTransaction.timestamp).toISOString()
          : null;

        // Determine status based on activity
        let status: "active" | "delayed" | "idle" = "idle";
        if (lastActivity) {
          const now = Date.now();
          const lastActivityTime = new Date(lastActivity).getTime();
          const minutesSinceActivity = (now - lastActivityTime) / 60000;

          if (minutesSinceActivity < 60) {
            status = "active";
          } else if (minutesSinceActivity < 180) {
            status = "delayed";
          } else {
            status = "idle";
          }
        }

        // Find route assignment (simplified - would need route assignments table)
        const route = routes.find((r) => 
          // For now, just return first route or null
          // TODO: Implement proper route assignment lookup
          false
        );

        return {
          id: emp._id,
          name: emp.name,
          route: null, // TODO: Implement route assignment lookup
          collectionsCount,
          cashInHand,
          lastActivity,
          status,
        };
      })
    );

    return employeeStatus;
  },
});

// Get employee transactions grouped by employee ID
export const getEmployeeTransactionsGrouped = query({
  args: {
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00Z').getTime();
    const endOfDay = new Date(targetDate + 'T23:59:59Z').getTime();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", startOfDay).lte("timestamp", endOfDay)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .collect();

    // Group by employee and resolve shop names
    const grouped: Record<string, any[]> = {};

    for (const txn of transactions) {
      const shop = await ctx.db.get(txn.shopId);
      if (!shop) continue;

      if (!grouped[txn.employeeId]) {
        grouped[txn.employeeId] = [];
      }

      grouped[txn.employeeId].push({
        id: txn._id,
        timestamp: new Date(txn.timestamp).toISOString(),
        shopName: shop.name,
        amount: txn.amount,
        paymentMode: txn.paymentMode,
        reference: txn.reference || null,
        gpsLocation: txn.gpsLocation,
      });
    }

    return grouped;
  },
});

// Daily Operations Queries
export const getRouteAssignmentForEmployee = query({
  args: {
    employeeId: v.id("employees"),
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    
    const assignment = await ctx.db
      .query("routeAssignments")
      .withIndex("by_employee_date", (q) => 
        q.eq("employeeId", args.employeeId).eq("date", targetDate)
      )
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();

    if (!assignment) return null;

    const route = await ctx.db.get(assignment.routeId);
    if (!route) return null;

    // Get shops for this route
    const shops = await Promise.all(
      route.shopIds.map(async (shopId) => {
        const shop = await ctx.db.get(shopId);
        if (!shop || shop.deletedAt) return null;
        return {
          id: shop._id,
          name: shop.name,
          address: shop.address,
          currentBalance: shop.currentBalance,
          lastCollectionDate: shop.lastCollectionDate,
        };
      })
    );

    return {
      id: route._id,
      name: route.name,
      description: route.description,
      shops: shops.filter((s) => s !== null),
    };
  },
});

export const getCurrentEmployeeCashInBag = query({
  args: {
    employeeId: v.id("employees"),
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00Z').getTime();
    const endOfDay = new Date(targetDate + 'T23:59:59Z').getTime();

    const cashTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_employee_timestamp", (q) => 
        q.eq("employeeId", args.employeeId)
          .gte("timestamp", startOfDay)
          .lte("timestamp", endOfDay)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("paymentMode"), "cash"),
          q.eq(q.field("status"), "completed")
        )
      )
      .collect();

    return cashTransactions.reduce((sum, txn) => sum + txn.amount, 0);
  },
});

export const getRouteAssignmentsForDate = query({
  args: {
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    
    const assignments = await ctx.db
      .query("routeAssignments")
      .withIndex("by_date", (q) => q.eq("date", targetDate))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    return Promise.all(
      assignments.map(async (assignment) => {
        const employee = await ctx.db.get(assignment.employeeId);
        const route = await ctx.db.get(assignment.routeId);
        
        return {
          id: assignment._id,
          employeeId: assignment.employeeId,
          employeeName: employee?.name || "Unknown",
          routeId: assignment.routeId,
          routeName: route?.name || "Unknown",
          date: assignment.date,
          status: assignment.status,
        };
      })
    );
  },
});

// EOD Reconciliation Queries
export const getEODSummary = query({
  args: {
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00Z').getTime();
    const endOfDay = new Date(targetDate + 'T23:59:59Z').getTime();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", startOfDay).lte("timestamp", endOfDay)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .collect();

    const totalCollected = transactions.reduce((sum, txn) => sum + txn.amount, 0);
    const cashExpected = transactions
      .filter((txn) => txn.paymentMode === "cash")
      .reduce((sum, txn) => sum + txn.amount, 0);
    const digitalPayments = transactions
      .filter((txn) => txn.paymentMode === "upi" || txn.paymentMode === "cheque")
      .reduce((sum, txn) => sum + txn.amount, 0);

    // Get field staff employees who worked today
    const employeeIds = [...new Set(transactions.map((txn) => txn.employeeId))];
    const employeesTotal = employeeIds.length;

    // Get verified count
    const reconciliations = await ctx.db
      .query("dailyReconciliations")
      .withIndex("by_date", (q) => q.eq("date", targetDate))
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "verified"),
          q.eq(q.field("status"), "mismatch")
        )
      )
      .collect();

    return {
      date: targetDate,
      totalCollected,
      cashExpected,
      digitalPayments,
      employeesVerified: reconciliations.length,
      employeesTotal,
    };
  },
});

export const getEmployeeSettlements = query({
  args: {
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00Z').getTime();
    const endOfDay = new Date(targetDate + 'T23:59:59Z').getTime();

    // Get all field staff employees
    const employees = await ctx.db
      .query("employees")
      .filter((q) => 
        q.and(
          q.eq(q.field("deletedAt"), undefined),
          q.eq(q.field("status"), "active"),
          q.eq(q.field("role"), "field_staff")
        )
      )
      .collect();

    // Get all cash transactions for today
    const allCashTransactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", startOfDay).lte("timestamp", endOfDay)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("paymentMode"), "cash"),
          q.eq(q.field("status"), "completed")
        )
      )
      .collect();

    // Get route assignments for today
    const routeAssignments = await ctx.db
      .query("routeAssignments")
      .withIndex("by_date", (q) => q.eq("date", targetDate))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    // Get existing reconciliations
    const reconciliations = await ctx.db
      .query("dailyReconciliations")
      .withIndex("by_date", (q) => q.eq("date", targetDate))
      .collect();

    const reconciliationMap = new Map(
      reconciliations.map((r) => [r.employeeId, r])
    );

    // Build settlements
    const settlements = await Promise.all(
      employees.map(async (emp) => {
        const empCashTransactions = allCashTransactions.filter(
          (txn) => txn.employeeId === emp._id
        );
        const expectedCash = empCashTransactions.reduce((sum, txn) => sum + txn.amount, 0);

        const assignment = routeAssignments.find((a) => a.employeeId === emp._id);
        const route = assignment ? await ctx.db.get(assignment.routeId) : null;

        const reconciliation = reconciliationMap.get(emp._id);

        return {
          id: reconciliation?._id || `pending-${emp._id}`,
          employeeId: emp._id,
          employeeName: emp.name,
          route: route?.name || "No route",
          expectedCash,
          actualCash: reconciliation?.actualCash || null,
          variance: reconciliation?.variance || null,
          status: reconciliation?.status || (expectedCash > 0 ? "pending" : "closed"),
          verifiedAt: reconciliation?.verifiedAt 
            ? new Date(reconciliation.verifiedAt).toISOString() 
            : null,
          note: reconciliation?.note || null,
        };
      })
    );

    // Filter to only employees who worked today (have transactions or assignments)
    return settlements.filter(
      (s) => s.expectedCash > 0 || routeAssignments.some((a) => a.employeeId === s.employeeId)
    );
  },
});

export const getCashTransactionsByEmployee = query({
  args: {
    date: v.optional(v.string()), // ISO date string (YYYY-MM-DD)
  },
  handler: async (ctx, args) => {
    const targetDate = args.date || new Date().toISOString().split('T')[0];
    const startOfDay = new Date(targetDate + 'T00:00:00Z').getTime();
    const endOfDay = new Date(targetDate + 'T23:59:59Z').getTime();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", startOfDay).lte("timestamp", endOfDay)
      )
      .filter((q) => 
        q.and(
          q.eq(q.field("paymentMode"), "cash"),
          q.eq(q.field("status"), "completed")
        )
      )
      .order("desc")
      .collect();

    const grouped: Record<string, any[]> = {};

    for (const txn of transactions) {
      const shop = await ctx.db.get(txn.shopId);
      if (!shop) continue;

      if (!grouped[txn.employeeId]) {
        grouped[txn.employeeId] = [];
      }

      grouped[txn.employeeId].push({
        id: txn._id,
        timestamp: new Date(txn.timestamp).toISOString(),
        shopName: shop.name,
        amount: txn.amount,
        paymentMode: "cash" as const,
      });
    }

    return grouped;
  },
});

// Reports & History Queries
export const getTransactionsWithFilters = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    employeeId: v.optional(v.id("employees")),
    shopId: v.optional(v.id("shops")),
    paymentMode: v.optional(v.union(v.literal("cash"), v.literal("upi"), v.literal("cheque"))),
    searchQuery: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const startDate = args.dateRange?.start 
      ? new Date(args.dateRange.start + 'T00:00:00Z').getTime()
      : new Date().setHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    const endDate = args.dateRange?.end
      ? new Date(args.dateRange.end + 'T23:59:59Z').getTime()
      : Date.now();

    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp", (q) => 
        q.gte("timestamp", startDate).lte("timestamp", endDate)
      )
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .collect();

    // Apply filters
    if (args.employeeId) {
      transactions = transactions.filter((txn) => txn.employeeId === args.employeeId);
    }
    if (args.shopId) {
      transactions = transactions.filter((txn) => txn.shopId === args.shopId);
    }
    if (args.paymentMode) {
      transactions = transactions.filter((txn) => txn.paymentMode === args.paymentMode);
    }

    // Resolve employee and shop names
    const result = await Promise.all(
      transactions.map(async (txn) => {
        const employee = await ctx.db.get(txn.employeeId);
        const shop = await ctx.db.get(txn.shopId);

        if (!employee || !shop) return null;

        // Apply search query filter
        if (args.searchQuery) {
          const query = args.searchQuery.toLowerCase();
          const matches = 
            shop.name.toLowerCase().includes(query) ||
            employee.name.toLowerCase().includes(query) ||
            txn._id.toLowerCase().includes(query);
          if (!matches) return null;
        }

        return {
          id: txn._id,
          timestamp: new Date(txn.timestamp).toISOString(),
          employeeName: employee.name,
          shopName: shop.name,
          amount: txn.amount,
          paymentMode: txn.paymentMode,
          reference: txn.reference || null,
          status: txn.status,
          gpsLocation: txn.gpsLocation,
        };
      })
    );

    return result.filter((t) => t !== null);
  },
});

export const getReconciliationEvents = query({
  args: {
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const startDate = args.dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = args.dateRange?.end || new Date().toISOString().split('T')[0];

    const reconciliations = await ctx.db
      .query("dailyReconciliations")
      .withIndex("by_date", (q) => 
        q.gte("date", startDate).lte("date", endDate)
      )
      .filter((q) => 
        q.or(
          q.eq(q.field("status"), "verified"),
          q.eq(q.field("status"), "mismatch")
        )
      )
      .order("desc")
      .collect();

    return Promise.all(
      reconciliations.map(async (recon) => {
        const employee = await ctx.db.get(recon.employeeId);
        return {
          id: recon._id,
          date: recon.date,
          employeeName: employee?.name || "Unknown",
          expectedCash: recon.expectedCash,
          actualCash: recon.actualCash || 0,
          variance: recon.variance || 0,
          status: recon.status === "verified" ? "verified" : "mismatch",
          note: recon.note || null,
          verifiedAt: recon.verifiedAt 
            ? new Date(recon.verifiedAt).toISOString() 
            : new Date().toISOString(),
        };
      })
    );
  },
});

