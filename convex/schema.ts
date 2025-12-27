import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // 1. AUDIT / LEDGER (Source of Truth for Reports)
  balanceAuditLogs: defineTable({
    shopId: v.id('shops'),
    changedBy: v.id('employees'),
    changedAt: v.float64(),

    // The Math
    previousBalance: v.float64(),
    newBalance: v.float64(),
    changeAmount: v.float64(), // Positive = Invoice, Negative = Collection

    // Context
    type: v.union(
      v.literal('invoice'),
      v.literal('collection'),
      v.literal('correction'),
    ),
    note: v.optional(v.string()),

    // Traceability (One of these will be set)
    transactionId: v.optional(v.id('transactions')),
    invoiceId: v.optional(v.id('invoices')),
  }).index('by_shop_date', ['shopId', 'changedAt']),

  // 2. INVOICES (Increases Balance - what shop owes)
  invoices: defineTable({
    invoiceNumber: v.string(), // e.g. "INV-2024-001"
    shopId: v.id('shops'),
    amount: v.float64(),
    issueDate: v.string(), // YYYY-MM-DD
    createdBy: v.id('employees'),
    note: v.optional(v.string()),
  })
    .index('by_shop', ['shopId'])
    .index('by_invoice_number', ['invoiceNumber']),

  // 3. EMPLOYEES
  employees: defineTable({
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal('field_staff'),
      v.literal('admin'),
      v.literal('super_admin'),
    ),
    status: v.literal('active'),
  })
    .index('by_email', ['email'])
    .index('by_clerk_user_id', ['clerkUserId']),

  // 4. ROUTES (Grouping only)
  routes: defineTable({
    name: v.string(),
    nameLower: v.optional(v.string()), // For case-insensitive uniqueness (optional for migration)
    code: v.string(),
    codeLower: v.optional(v.string()), // For case-insensitive uniqueness (optional for migration)
  })
    .index('by_name_lower', ['nameLower'])
    .index('by_code_lower', ['codeLower']),

  // 5. SHOPS
  shops: defineTable({
    name: v.string(),
    nameLower: v.optional(v.string()), // For case-insensitive uniqueness (optional for migration)
    retailerUniqueCode: v.string(),
    // Address fields
    addressLine1: v.optional(v.string()),
    addressLine2: v.optional(v.string()),
    addressLine3: v.optional(v.string()),
    city: v.optional(v.string()),
    district: v.optional(v.string()),
    state: v.optional(v.string()),
    pinCode: v.optional(v.string()),
    // Contact
    phone: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    // Location
    latitude: v.optional(v.float64()),
    longitude: v.optional(v.float64()),
    // Business
    currentBalance: v.float64(),
    routeId: v.optional(v.id('routes')),
    zone: v.string(),
  })
    .index('by_route', ['routeId'])
    .index('by_name_lower', ['nameLower'])
    .index('by_retailer_unique_code', ['retailerUniqueCode']),

  // 6. TRANSACTIONS (Collections - Decreases Balance)
  transactions: defineTable({
    timestamp: v.float64(),
    amount: v.float64(),
    shopId: v.id('shops'),
    employeeId: v.id('employees'),
    paymentMode: v.union(
      v.literal('cash'),
      v.literal('upi'),
      v.literal('cheque'),
    ),

    // Handover Status
    isVerified: v.boolean(), // false = In Bag, true = In Office
    verifiedAt: v.optional(v.float64()),
  })
    .index('by_employee_verified', ['employeeId', 'isVerified'])
    .index('by_shop', ['shopId'])
    .index('by_timestamp', ['timestamp']),
})
