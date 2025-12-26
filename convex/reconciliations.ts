import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List reconciliations with optional filters.
 */
export const list = query({
  args: {
    employeeId: v.optional(v.id('employees')),
    date: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('verified'),
        v.literal('mismatch'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    let reconciliations

    if (args.date) {
      const date = args.date
      reconciliations = await ctx.db
        .query('dailyReconciliations')
        .withIndex('by_date', (q) => q.eq('date', date))
        .collect()
      // Apply employee filter if provided
      if (args.employeeId) {
        const employeeId = args.employeeId
        reconciliations = reconciliations.filter(
          (r) => r.employeeId === employeeId,
        )
      }
    } else if (args.employeeId) {
      const employeeId = args.employeeId
      reconciliations = await ctx.db
        .query('dailyReconciliations')
        .filter((q) => q.eq(q.field('employeeId'), employeeId))
        .collect()
    } else if (args.status) {
      const status = args.status
      reconciliations = await ctx.db
        .query('dailyReconciliations')
        .withIndex('by_status', (q) => q.eq('status', status))
        .collect()
    } else {
      reconciliations = await ctx.db.query('dailyReconciliations').collect()
    }

    return reconciliations
  },
})

/**
 * Get reconciliations with employee details.
 */
export const listWithDetails = query({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let reconciliations

    if (args.date) {
      const date = args.date
      reconciliations = await ctx.db
        .query('dailyReconciliations')
        .withIndex('by_date', (q) => q.eq('date', date))
        .collect()
    } else {
      reconciliations = await ctx.db.query('dailyReconciliations').collect()
    }

    const detailed = await Promise.all(
      reconciliations.map(async (recon) => {
        const employee = await ctx.db.get('employees', recon.employeeId)
        return { ...recon, employee }
      }),
    )

    return detailed
  },
})

/**
 * Get a single reconciliation by ID.
 */
export const get = query({
  args: { id: v.id('dailyReconciliations') },
  handler: async (ctx, args) => {
    return await ctx.db.get('dailyReconciliations', args.id)
  },
})

/**
 * Get reconciliation for a specific employee and date.
 */
export const getByEmployeeDate = query({
  args: {
    employeeId: v.id('employees'),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('dailyReconciliations')
      .withIndex('by_employee_date', (q) =>
        q.eq('employeeId', args.employeeId).eq('date', args.date),
      )
      .first()
  },
})

/**
 * Create or update a daily reconciliation.
 * Calculates expected cash from transactions automatically.
 */
export const verify = mutation({
  args: {
    employeeId: v.id('employees'),
    date: v.string(),
    actualCash: v.float64(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Calculate expected cash from transactions
    const transactions = await ctx.db
      .query('transactions')
      .withIndex('by_employee', (q) => q.eq('employeeId', args.employeeId))
      .collect()

    const cashTransactions = transactions.filter((t) => {
      const txnDate = new Date(t.timestamp).toISOString().split('T')[0]
      return (
        txnDate === args.date &&
        t.paymentMode === 'cash' &&
        t.status === 'completed'
      )
    })

    const expectedCash = cashTransactions.reduce((sum, t) => sum + t.amount, 0)
    const variance = args.actualCash - expectedCash
    const status = variance === 0 ? 'verified' : 'mismatch'

    // Check for existing reconciliation
    const existing = await ctx.db
      .query('dailyReconciliations')
      .withIndex('by_employee_date', (q) =>
        q.eq('employeeId', args.employeeId).eq('date', args.date),
      )
      .first()

    if (existing) {
      // Update existing
      await ctx.db.patch('dailyReconciliations', existing._id, {
        actualCash: args.actualCash,
        expectedCash,
        variance,
        status,
        note: args.note,
        verifiedAt: Date.now(),
      })
      return existing._id
    }

    // Create new
    const reconciliationId = await ctx.db.insert('dailyReconciliations', {
      employeeId: args.employeeId,
      date: args.date,
      expectedCash,
      actualCash: args.actualCash,
      variance,
      status,
      note: args.note,
      verifiedAt: Date.now(),
    })

    return reconciliationId
  },
})

/**
 * Update reconciliation status (for admin override).
 */
export const updateStatus = mutation({
  args: {
    id: v.id('dailyReconciliations'),
    status: v.union(
      v.literal('pending'),
      v.literal('verified'),
      v.literal('mismatch'),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status }
    if (args.note !== undefined) {
      updates.note = args.note
    }
    await ctx.db.patch('dailyReconciliations', args.id, updates)
    return args.id
  },
})
