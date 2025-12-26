import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. AUDIT LOGS - Track all balance changes for accountability
  balanceAuditLogs: defineTable({
    shopId: v.id("shops"),
    previousBalance: v.float64(),
    newBalance: v.float64(),
    changeAmount: v.float64(),
    changedBy: v.id("employees"),
    changedAt: v.float64(),
    note: v.string(),
  })
    .index("by_shop", ["shopId"])
    .index("by_changed_at", ["changedAt"]),

  // 2. DAILY RECONCILIATIONS - End-of-day cash verification
  dailyReconciliations: defineTable({
    date: v.string(), // "2024-12-26"
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

  // 3. EMPLOYEES - With Clerk auth linking
  employees: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("field_staff"),
      v.literal("admin"),
      v.literal("super_admin")
    ),
    status: v.union(v.literal("active"), v.literal("inactive")),
    clerkUserId: v.optional(v.string()), // Linked when user signs up via Clerk
    deletedAt: v.optional(v.float64()),
  })
    .index("by_email", ["email"])
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_status", ["status"])
    .index("by_deleted", ["deletedAt"]),

  // 4. INVOICES - Track amounts owed by shops
  invoices: defineTable({
    shopId: v.id("shops"),
    amount: v.float64(),
    invoiceNumber: v.string(),
    invoiceDate: v.string(), // "2024-12-26"
    reference: v.optional(v.string()),
    createdAt: v.float64(),
    createdBy: v.id("employees"),
    status: v.union(v.literal("active"), v.literal("cancelled")),
    cancelledAt: v.optional(v.float64()),
    cancelledBy: v.optional(v.id("employees")),
  })
    .index("by_shop", ["shopId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // 5. ROUTE ASSIGNMENTS - Daily route assignments
  routeAssignments: defineTable({
    date: v.string(), // "2024-12-26"
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
    .index("by_employee_date", ["employeeId", "date"])
    .index("by_route_date", ["routeId", "date"]),

  // 6. ROUTES - Collection routes (shops link to routes, not vice versa)
  routes: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    deletedAt: v.optional(v.float64()),
  }).index("by_deleted", ["deletedAt"]),

  // 7. SHOPS - The source of truth for shop data
  shops: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    zone: v.string(),
    currentBalance: v.float64(), // Amount shop owes (positive = they owe us)
    lastCollectionDate: v.optional(v.string()),
    routeId: v.optional(v.id("routes")), // Shop belongs to a route
    deletedAt: v.optional(v.float64()),
  })
    .index("by_zone", ["zone"])
    .index("by_route", ["routeId"])
    .index("by_deleted", ["deletedAt"]),

  // 8. TRANSACTIONS - Cash collection records
  transactions: defineTable({
    shopId: v.id("shops"),
    employeeId: v.id("employees"),
    amount: v.float64(),
    paymentMode: v.union(
      v.literal("cash"),
      v.literal("upi"),
      v.literal("cheque")
    ),
    reference: v.optional(v.string()), // UTR / Cheque number
    timestamp: v.float64(),
    gpsLocation: v.optional(
      v.object({
        lat: v.float64(),
        lng: v.float64(),
      })
    ),
    status: v.union(
      v.literal("completed"),
      v.literal("adjusted"),
      v.literal("reversed")
    ),
  })
    .index("by_shop", ["shopId"])
    .index("by_employee", ["employeeId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_employee_timestamp", ["employeeId", "timestamp"]),
});
