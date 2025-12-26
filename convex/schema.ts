import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  shops: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    currentBalance: v.number(),
    zone: v.string(),
    lastCollectionDate: v.string(),
    deletedAt: v.optional(v.number()), // Soft delete timestamp
  })
    .index("by_zone", ["zone"])
    .index("by_deleted", ["deletedAt"]),

  routes: defineTable({
    name: v.string(),
    description: v.string(),
    shopIds: v.array(v.id("shops")),
    deletedAt: v.optional(v.number()), // Soft delete timestamp
  })
    .index("by_deleted", ["deletedAt"]),

  employees: defineTable({
    name: v.string(),
    phone: v.string(),
    email: v.string(),
    clerkUserId: v.optional(v.string()), // Clerk user ID for authentication
    role: v.union(v.literal("field_staff"), v.literal("admin"), v.literal("super_admin")),
    status: v.union(v.literal("active"), v.literal("inactive")),
    deletedAt: v.optional(v.number()), // Soft delete timestamp
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_deleted", ["deletedAt"]),

  // Audit logs for balance changes
  balanceAuditLogs: defineTable({
    shopId: v.id("shops"),
    previousBalance: v.number(),
    newBalance: v.number(),
    changeAmount: v.number(),
    note: v.string(), // Mandatory note for balance edits
    changedBy: v.id("employees"),
    changedAt: v.number(), // Timestamp
  })
    .index("by_shop", ["shopId"])
    .index("by_changed_at", ["changedAt"]),

  // Transactions (cash collections)
  transactions: defineTable({
    employeeId: v.id("employees"),
    shopId: v.id("shops"),
    amount: v.number(),
    paymentMode: v.union(v.literal("cash"), v.literal("upi"), v.literal("cheque")),
    reference: v.optional(v.string()), // For UPI/Cheque
    timestamp: v.number(), // Unix timestamp
    gpsLocation: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    status: v.union(v.literal("completed"), v.literal("adjusted"), v.literal("reversed")),
  })
    .index("by_employee", ["employeeId"])
    .index("by_shop", ["shopId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_employee_timestamp", ["employeeId", "timestamp"]),

  // Route assignments (daily assignments of routes to employees)
  routeAssignments: defineTable({
    employeeId: v.id("employees"),
    routeId: v.id("routes"),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    assignedAt: v.number(), // Unix timestamp
  })
    .index("by_employee_date", ["employeeId", "date"])
    .index("by_date", ["date"])
    .index("by_route_date", ["routeId", "date"]),

  // Daily reconciliations (EOD cash verification)
  dailyReconciliations: defineTable({
    employeeId: v.id("employees"),
    date: v.string(), // ISO date string (YYYY-MM-DD)
    expectedCash: v.number(),
    actualCash: v.optional(v.number()),
    variance: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("mismatch"), v.literal("closed")),
    note: v.optional(v.string()),
    verifiedAt: v.optional(v.number()), // Unix timestamp
    verifiedBy: v.optional(v.id("employees")), // Admin who verified
  })
    .index("by_employee_date", ["employeeId", "date"])
    .index("by_date", ["date"])
    .index("by_status", ["status"]),
});

