import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List invoices with optional filters.
 */
export const list = query({
  args: {
    shopId: v.optional(v.id('shops')),
  },
  handler: async (ctx, args) => {
    if (args.shopId) {
      return await ctx.db
        .query('invoices')
        .withIndex('by_shop', (q) => q.eq('shopId', args.shopId!))
        .collect()
    }
    return await ctx.db.query('invoices').collect()
  },
})

/**
 * Get invoices with shop details.
 */
export const listWithDetails = query({
  args: {
    shopId: v.optional(v.id('shops')),
  },
  handler: async (ctx, args) => {
    let invoices

    if (args.shopId) {
      invoices = await ctx.db
        .query('invoices')
        .withIndex('by_shop', (q) => q.eq('shopId', args.shopId!))
        .collect()
    } else {
      invoices = await ctx.db.query('invoices').collect()
    }

    const detailed = await Promise.all(
      invoices.map(async (inv) => {
        const shop = await ctx.db.get('shops', inv.shopId)
        const createdByEmployee = await ctx.db.get('employees', inv.createdBy)
        return { ...inv, shop, createdByEmployee }
      }),
    )

    return detailed
  },
})

/**
 * Get a single invoice by ID.
 */
export const get = query({
  args: { id: v.id('invoices') },
  handler: async (ctx, args) => {
    return await ctx.db.get('invoices', args.id)
  },
})

/**
 * Get invoice by invoice number.
 */
export const getByInvoiceNumber = query({
  args: { invoiceNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('invoices')
      .withIndex('by_invoice_number', (q) =>
        q.eq('invoiceNumber', args.invoiceNumber),
      )
      .first()
  },
})

/**
 * Create an invoice - INCREASES shop balance (what they owe).
 * This mutation:
 * 1. Validates invoice number is unique
 * 2. Creates the invoice record
 * 3. Updates shop balance (increases)
 * 4. Creates an audit log entry
 */
export const create = mutation({
  args: {
    shopId: v.id('shops'),
    amount: v.float64(),
    invoiceNumber: v.string(),
    issueDate: v.string(), // YYYY-MM-DD
    createdBy: v.id('employees'),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Check for duplicate invoice number
    const existing = await ctx.db
      .query('invoices')
      .withIndex('by_invoice_number', (q) =>
        q.eq('invoiceNumber', args.invoiceNumber),
      )
      .first()

    if (existing) {
      throw new Error(`Invoice number ${args.invoiceNumber} already exists`)
    }

    // Get the shop
    const shop = await ctx.db.get('shops', args.shopId)
    if (!shop) {
      throw new Error('Shop not found')
    }

    const oldBalance = shop.currentBalance
    const newBalance = oldBalance + args.amount // Invoice INCREASES balance
    const timestamp = Date.now()

    // 2. Create the invoice
    const invoiceId = await ctx.db.insert('invoices', {
      shopId: args.shopId,
      amount: args.amount,
      invoiceNumber: args.invoiceNumber,
      issueDate: args.issueDate,
      createdBy: args.createdBy,
      note: args.note,
    })

    // 3. Update shop balance (increase - they owe more)
    await ctx.db.patch('shops', args.shopId, {
      currentBalance: newBalance,
    })

    // 4. Create audit log entry
    await ctx.db.insert('balanceAuditLogs', {
      shopId: args.shopId,
      previousBalance: oldBalance,
      newBalance,
      changeAmount: args.amount, // Positive = invoice
      type: 'invoice',
      invoiceId,
      changedBy: args.createdBy,
      changedAt: timestamp,
      note: args.note ?? `Invoice ${args.invoiceNumber}`,
    })

    return invoiceId
  },
})
