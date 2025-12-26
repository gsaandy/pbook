import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List settlements with optional filters.
 */
export const list = query({
  args: {
    employeeId: v.optional(v.id('employees')),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('received'),
        v.literal('discrepancy'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    let settlements

    if (args.employeeId) {
      const employeeId = args.employeeId
      settlements = await ctx.db
        .query('settlements')
        .withIndex('by_employee', (q) => q.eq('employeeId', employeeId))
        .collect()
    } else if (args.status) {
      const status = args.status
      settlements = await ctx.db
        .query('settlements')
        .withIndex('by_status', (q) => q.eq('status', status))
        .collect()
    } else {
      settlements = await ctx.db.query('settlements').collect()
    }

    return settlements
  },
})

/**
 * Get settlements with employee details.
 */
export const listWithDetails = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('received'),
        v.literal('discrepancy'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    let settlements

    if (args.status) {
      const status = args.status
      settlements = await ctx.db
        .query('settlements')
        .withIndex('by_status', (q) => q.eq('status', status))
        .collect()
    } else {
      settlements = await ctx.db.query('settlements').collect()
    }

    const detailed = await Promise.all(
      settlements.map(async (settlement) => {
        const employee = await ctx.db.get('employees', settlement.employeeId)
        return { ...settlement, employee }
      }),
    )

    return detailed
  },
})

/**
 * Get a single settlement by ID.
 */
export const get = query({
  args: { id: v.id('settlements') },
  handler: async (ctx, args) => {
    return await ctx.db.get('settlements', args.id)
  },
})

/**
 * Get pending settlements for an employee (cash not yet handed over).
 */
export const getPendingForEmployee = query({
  args: {
    employeeId: v.id('employees'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('settlements')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .filter((q) => q.eq(q.field('status'), 'pending'))
      .collect()
  },
})

/**
 * Create a pending settlement for cash transactions.
 * Called when field staff is ready to hand over cash.
 */
export const create = mutation({
  args: {
    employeeId: v.id('employees'),
    transactionIds: v.array(v.id('transactions')),
  },
  handler: async (ctx, args) => {
    // Calculate expected amount from transactions
    let expectedAmount = 0
    for (const txnId of args.transactionIds) {
      const txn = await ctx.db.get('transactions', txnId)
      if (txn && txn.paymentMode === 'cash' && txn.status === 'completed') {
        expectedAmount += txn.amount
      }
    }

    const settlementId = await ctx.db.insert('settlements', {
      employeeId: args.employeeId,
      expectedAmount,
      transactionIds: args.transactionIds,
      status: 'pending',
      createdAt: Date.now(),
    })

    return settlementId
  },
})

/**
 * Receive cash and verify the settlement.
 */
export const receive = mutation({
  args: {
    id: v.id('settlements'),
    receivedAmount: v.float64(),
    receivedBy: v.id('employees'),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const settlement = await ctx.db.get('settlements', args.id)
    if (!settlement) {
      throw new Error('Settlement not found')
    }

    const variance = args.receivedAmount - settlement.expectedAmount
    const status = variance === 0 ? 'received' : 'discrepancy'

    await ctx.db.patch('settlements', args.id, {
      receivedAmount: args.receivedAmount,
      variance,
      status,
      receivedAt: Date.now(),
      receivedBy: args.receivedBy,
      note: args.note,
    })

    return args.id
  },
})

/**
 * Verify cash handover - creates settlement and marks as received.
 * If receivedAmount matches expected, status is 'received'.
 * If receivedAmount differs, status is 'discrepancy'.
 */
export const verify = mutation({
  args: {
    employeeId: v.id('employees'),
    transactionIds: v.array(v.id('transactions')),
    receivedAmount: v.optional(v.float64()), // If not provided, assumes match
    receivedBy: v.id('employees'),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Calculate expected amount from transactions
    let expectedAmount = 0
    for (const txnId of args.transactionIds) {
      const txn = await ctx.db.get('transactions', txnId)
      if (txn && txn.paymentMode === 'cash' && txn.status === 'completed') {
        expectedAmount += txn.amount
      }
    }

    const receivedAmount = args.receivedAmount ?? expectedAmount
    const variance = receivedAmount - expectedAmount
    const status = variance === 0 ? 'received' : 'discrepancy'

    const settlementId = await ctx.db.insert('settlements', {
      employeeId: args.employeeId,
      expectedAmount,
      receivedAmount,
      variance,
      transactionIds: args.transactionIds,
      status,
      note: args.note,
      createdAt: Date.now(),
      receivedAt: Date.now(),
      receivedBy: args.receivedBy,
    })

    return settlementId
  },
})

/**
 * Update settlement status (for admin override).
 */
export const updateStatus = mutation({
  args: {
    id: v.id('settlements'),
    status: v.union(
      v.literal('pending'),
      v.literal('received'),
      v.literal('discrepancy'),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status }
    if (args.note !== undefined) {
      updates.note = args.note
    }
    await ctx.db.patch('settlements', args.id, updates)
    return args.id
  },
})
