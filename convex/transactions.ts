import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List transactions with optional filters.
 */
export const list = query({
  args: {
    employeeId: v.optional(v.id('employees')),
    shopId: v.optional(v.id('shops')),
    date: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let transactions

    if (args.employeeId && args.isVerified !== undefined) {
      // Use the optimized index for employee + verified status
      transactions = await ctx.db
        .query('transactions')
        .withIndex('by_employee_verified', (q) =>
          q.eq('employeeId', args.employeeId!).eq('isVerified', args.isVerified!),
        )
        .collect()
    } else if (args.employeeId) {
      transactions = await ctx.db
        .query('transactions')
        .withIndex('by_employee_verified', (q) =>
          q.eq('employeeId', args.employeeId!),
        )
        .collect()
    } else if (args.shopId) {
      transactions = await ctx.db
        .query('transactions')
        .withIndex('by_shop', (q) => q.eq('shopId', args.shopId!))
        .collect()
    } else {
      transactions = await ctx.db.query('transactions').collect()
    }

    // Filter by date if provided
    if (args.date) {
      const targetDate = args.date
      transactions = transactions.filter((t) => {
        const txnDate = new Date(t.timestamp).toISOString().split('T')[0]
        return txnDate === targetDate
      })
    }

    return transactions
  },
})

/**
 * Get transactions with shop and employee details.
 */
export const listWithDetails = query({
  args: {
    employeeId: v.optional(v.id('employees')),
    date: v.optional(v.string()),
    isVerified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let transactions

    if (args.employeeId && args.isVerified !== undefined) {
      transactions = await ctx.db
        .query('transactions')
        .withIndex('by_employee_verified', (q) =>
          q.eq('employeeId', args.employeeId!).eq('isVerified', args.isVerified!),
        )
        .collect()
    } else if (args.employeeId) {
      transactions = await ctx.db
        .query('transactions')
        .withIndex('by_employee_verified', (q) =>
          q.eq('employeeId', args.employeeId!),
        )
        .collect()
    } else {
      transactions = await ctx.db.query('transactions').collect()
    }

    // Filter by date if provided
    if (args.date) {
      const targetDate = args.date
      transactions = transactions.filter((t) => {
        const txnDate = new Date(t.timestamp).toISOString().split('T')[0]
        return txnDate === targetDate
      })
    }

    // Fetch details
    const detailed = await Promise.all(
      transactions.map(async (txn) => {
        const employee = await ctx.db.get('employees', txn.employeeId)
        const shop = await ctx.db.get('shops', txn.shopId)
        return { ...txn, employee, shop }
      }),
    )

    return detailed
  },
})

/**
 * Get a single transaction by ID.
 */
export const get = query({
  args: { id: v.id('transactions') },
  handler: async (ctx, args) => {
    return await ctx.db.get('transactions', args.id)
  },
})

/**
 * Get unverified cash for an employee ("Cash in Bag").
 */
export const getCashInBag = query({
  args: {
    employeeId: v.id('employees'),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_employee_verified', (q) =>
        q.eq('employeeId', args.employeeId).eq('isVerified', false),
      )
      .collect()

    // Only cash transactions count for "cash in bag"
    const cashTransactions = transactions.filter((t) => t.paymentMode === 'cash')

    return {
      total: cashTransactions.reduce((sum, t) => sum + t.amount, 0),
      count: cashTransactions.length,
      transactions: cashTransactions,
    }
  },
})

/**
 * Collect cash from a shop - the main business transaction.
 * This mutation:
 * 1. Creates a transaction record (isVerified: false)
 * 2. Updates shop balance (decreases)
 * 3. Creates an audit log entry
 */
export const collectCash = mutation({
  args: {
    employeeId: v.id('employees'),
    shopId: v.id('shops'),
    amount: v.float64(),
    paymentMode: v.union(
      v.literal('cash'),
      v.literal('upi'),
      v.literal('cheque'),
    ),
  },
  handler: async (ctx, args) => {
    // Get the shop to verify it exists and get current balance
    const shop = await ctx.db.get('shops', args.shopId)
    if (!shop) {
      throw new Error('Shop not found')
    }

    const oldBalance = shop.currentBalance
    const newBalance = Math.max(0, oldBalance - args.amount)
    const timestamp = Date.now()

    // 1. Create the transaction (starts unverified - "in bag")
    const transactionId = await ctx.db.insert('transactions', {
      employeeId: args.employeeId,
      shopId: args.shopId,
      amount: args.amount,
      paymentMode: args.paymentMode,
      timestamp,
      isVerified: false,
    })

    // 2. Update shop balance
    await ctx.db.patch('shops', args.shopId, {
      currentBalance: newBalance,
    })

    // 3. Create audit log entry
    await ctx.db.insert('balanceAuditLogs', {
      shopId: args.shopId,
      previousBalance: oldBalance,
      newBalance,
      changeAmount: -args.amount, // Negative = collection
      type: 'collection',
      transactionId,
      changedBy: args.employeeId,
      changedAt: timestamp,
      note: `Collection via ${args.paymentMode}`,
    })

    return transactionId
  },
})
