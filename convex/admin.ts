import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * Get employees with pending (unverified) cash collections.
 * Used by admin to see who needs to hand over cash.
 */
export const getPendingHandovers = query({
  args: {},
  handler: async (ctx) => {
    // Get all unverified transactions
    const unverifiedTransactions = await ctx.db
      .query('transactions')
      .filter((q) => q.eq(q.field('isVerified'), false))
      .collect()

    // Group by employee and sum cash amounts
    const employeeMap = new Map<
      string,
      { total: number; cashTotal: number; count: number }
    >()

    for (const txn of unverifiedTransactions) {
      const empId = txn.employeeId as string
      const existing = employeeMap.get(empId) ?? { total: 0, cashTotal: 0, count: 0 }
      existing.total += txn.amount
      existing.count += 1
      if (txn.paymentMode === 'cash') {
        existing.cashTotal += txn.amount
      }
      employeeMap.set(empId, existing)
    }

    // Fetch employee details
    const results = await Promise.all(
      Array.from(employeeMap.entries()).map(async ([empId, data]) => {
        const employee = await ctx.db.get('employees', empId as never)
        return {
          employeeId: empId,
          employeeName: employee?.name ?? 'Unknown',
          totalAmount: data.total,
          cashAmount: data.cashTotal,
          transactionCount: data.count,
        }
      }),
    )

    return results.filter((r) => r.cashAmount > 0) // Only show those with cash to hand over
  },
})

/**
 * Verify handover - marks all unverified CASH transactions for an employee as verified.
 * This moves the money from "In Bag" to "In Office".
 */
export const verifyHandover = mutation({
  args: {
    employeeId: v.id('employees'),
  },
  handler: async (ctx, args) => {
    // Get all unverified cash transactions for this employee
    const unverifiedCash = await ctx.db
      .query('transactions')
      .withIndex('by_employee_verified', (q) =>
        q.eq('employeeId', args.employeeId).eq('isVerified', false),
      )
      .collect()

    // Filter for cash only
    const cashTransactions = unverifiedCash.filter(
      (t) => t.paymentMode === 'cash',
    )

    if (cashTransactions.length === 0) {
      return { verified: 0, amount: 0 }
    }

    const timestamp = Date.now()
    let totalAmount = 0

    // Mark each transaction as verified
    for (const txn of cashTransactions) {
      await ctx.db.patch('transactions', txn._id, {
        isVerified: true,
        verifiedAt: timestamp,
      })
      totalAmount += txn.amount
    }

    return {
      verified: cashTransactions.length,
      amount: totalAmount,
    }
  },
})

/**
 * Add a balance correction for a shop.
 * Used for adjustments that don't come from invoices or collections.
 */
export const addCorrection = mutation({
  args: {
    shopId: v.id('shops'),
    amount: v.float64(), // Positive = increase balance, Negative = decrease
    changedBy: v.id('employees'),
    note: v.string(),
  },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get('shops', args.shopId)
    if (!shop) {
      throw new Error('Shop not found')
    }

    const oldBalance = shop.currentBalance
    const newBalance = oldBalance + args.amount
    const timestamp = Date.now()

    // Update shop balance
    await ctx.db.patch('shops', args.shopId, {
      currentBalance: newBalance,
    })

    // Create audit log
    await ctx.db.insert('balanceAuditLogs', {
      shopId: args.shopId,
      previousBalance: oldBalance,
      newBalance,
      changeAmount: args.amount,
      type: 'correction',
      changedBy: args.changedBy,
      changedAt: timestamp,
      note: args.note,
    })

    return { oldBalance, newBalance }
  },
})
