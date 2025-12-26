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
  },
  handler: async (ctx, args) => {
    let transactions

    if (args.employeeId && args.date) {
      // Filter by employee and date - most common case for daily operations
      const employeeId = args.employeeId
      const targetDate = args.date
      transactions = await ctx.db
        .query('transactions')
        .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
        .collect()
      // Filter by date in memory
      transactions = transactions.filter((t) => {
        const txnDate = new Date(t.timestamp).toISOString().split('T')[0]
        return txnDate === targetDate
      })
    } else if (args.employeeId) {
      const employeeId = args.employeeId
      transactions = await ctx.db
        .query('transactions')
        .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
        .collect()
    } else if (args.shopId) {
      const shopId = args.shopId
      transactions = await ctx.db
        .query('transactions')
        .withIndex('by_shop', (q) => q.eq('shopId', shopId))
        .collect()
    } else if (args.date) {
      // Get all transactions and filter by date
      const targetDate = args.date
      transactions = await ctx.db.query('transactions').collect()
      transactions = transactions.filter((t) => {
        const txnDate = new Date(t.timestamp).toISOString().split('T')[0]
        return txnDate === targetDate
      })
    } else {
      transactions = await ctx.db.query('transactions').collect()
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
  },
  handler: async (ctx, args) => {
    let transactions

    if (args.employeeId) {
      const employeeId = args.employeeId
      transactions = await ctx.db
        .query('transactions')
        .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
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
 * Calculate cash in hand for an employee on a specific date.
 */
export const getEmployeeCashInHand = query({
  args: {
    employeeId: v.id('employees'),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    // Filter by date and cash only
    const cashTransactions = transactions.filter((t) => {
      const txnDate = new Date(t.timestamp).toISOString().split('T')[0]
      return txnDate === args.date && t.paymentMode === 'cash'
    })

    return cashTransactions.reduce((sum, t) => sum + t.amount, 0)
  },
})

/**
 * Collect cash from a shop - the main business transaction.
 * This mutation:
 * 1. Creates a transaction record
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
    reference: v.optional(v.string()),
    gpsLocation: v.optional(
      v.object({
        lat: v.float64(),
        lng: v.float64(),
      }),
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

    // 1. Create the transaction
    const transactionId = await ctx.db.insert('transactions', {
      employeeId: args.employeeId,
      shopId: args.shopId,
      amount: args.amount,
      paymentMode: args.paymentMode,
      reference: args.reference,
      timestamp,
      gpsLocation: args.gpsLocation,
      status: 'completed',
    })

    // 2. Update shop balance and last collection date
    await ctx.db.patch('shops', args.shopId, {
      currentBalance: newBalance,
      lastCollectionDate: new Date(timestamp).toISOString().split('T')[0],
    })

    // 3. Create audit log entry
    await ctx.db.insert('balanceAuditLogs', {
      shopId: args.shopId,
      previousBalance: oldBalance,
      newBalance,
      changeAmount: -args.amount,
      changeType: 'collection',
      referenceId: transactionId,
      changedBy: args.employeeId,
      changedAt: timestamp,
      note: `Collection via ${args.paymentMode}${args.reference ? `: ${args.reference}` : ''}`,
    })

    return transactionId
  },
})

/**
 * Reverse a transaction (for corrections).
 */
export const reverse = mutation({
  args: {
    id: v.id('transactions'),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const transaction = await ctx.db.get('transactions', args.id)
    if (!transaction) {
      throw new Error('Transaction not found')
    }

    if (transaction.status === 'reversed') {
      throw new Error('Transaction is already reversed')
    }

    const shop = await ctx.db.get('shops', transaction.shopId)
    if (!shop) {
      throw new Error('Shop not found')
    }

    const oldBalance = shop.currentBalance
    const newBalance = oldBalance + transaction.amount

    // Update transaction status
    await ctx.db.patch('transactions', args.id, { status: 'reversed' })

    // Restore shop balance
    await ctx.db.patch('shops', transaction.shopId, {
      currentBalance: newBalance,
    })

    // Create audit log
    await ctx.db.insert('balanceAuditLogs', {
      shopId: transaction.shopId,
      previousBalance: oldBalance,
      newBalance,
      changeAmount: transaction.amount,
      changeType: 'reversal',
      referenceId: args.id,
      changedBy: transaction.employeeId,
      changedAt: Date.now(),
      note: `Reversal: ${args.reason}`,
    })

    return args.id
  },
})
