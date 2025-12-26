import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List invoices with optional filters.
 */
export const list = query({
  args: {
    shopId: v.optional(v.id('shops')),
    status: v.optional(v.union(v.literal('active'), v.literal('cancelled'))),
    includeShopDetails: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let invoices

    if (args.shopId) {
      const shopId = args.shopId
      invoices = await ctx.db
        .query('invoices')
        .withIndex('by_shop', (q) => q.eq('shopId', shopId))
        .collect()
      // Apply status filter if provided
      if (args.status) {
        const status = args.status
        invoices = invoices.filter((inv) => inv.status === status)
      }
    } else if (args.status) {
      const status = args.status
      invoices = await ctx.db
        .query('invoices')
        .withIndex('by_status', (q) => q.eq('status', status))
        .collect()
    } else {
      invoices = await ctx.db.query('invoices').collect()
    }

    // Sort by invoice date descending
    invoices.sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate))

    // Include shop details if requested
    if (args.includeShopDetails) {
      const detailed = await Promise.all(
        invoices.map(async (inv) => {
          const shop = await ctx.db.get("shops", inv.shopId)
          return { ...inv, shop }
        }),
      )
      return detailed
    }

    return invoices
  },
})

/**
 * Get a single invoice by ID.
 */
export const get = query({
  args: { id: v.id('invoices') },
  handler: async (ctx, args) => {
    return await ctx.db.get("invoices", args.id)
  },
})

/**
 * Search invoices by invoice number, reference, or shop name.
 */
export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const lowerQuery = args.query.toLowerCase()

    // Get all active invoices
    const invoices = await ctx.db
      .query('invoices')
      .withIndex('by_status', (q) => q.eq('status', 'active'))
      .collect()

    // Get all shops for name matching
    const shops = await ctx.db.query('shops').collect()
    const shopMap = new Map(shops.map((s) => [s._id, s]))

    // Filter by query
    const results = invoices.filter((inv) => {
      const shop = shopMap.get(inv.shopId)
      return (
        inv.invoiceNumber.toLowerCase().includes(lowerQuery) ||
        (inv.reference && inv.reference.toLowerCase().includes(lowerQuery)) ||
        shop?.name.toLowerCase().includes(lowerQuery)
      )
    })

    // Add shop details to results
    return results.map((inv) => ({
      ...inv,
      shop: shopMap.get(inv.shopId),
    }))
  },
})

/**
 * Create a new invoice.
 * This increases the shop's balance (they owe more).
 */
export const create = mutation({
  args: {
    shopId: v.id('shops'),
    amount: v.float64(),
    invoiceNumber: v.string(),
    invoiceDate: v.string(),
    reference: v.string(),
    createdBy: v.id('employees'),
  },
  handler: async (ctx, args) => {
    const shop = await ctx.db.get("shops", args.shopId)
    if (!shop) {
      throw new Error('Shop not found')
    }

    const oldBalance = shop.currentBalance
    const newBalance = oldBalance + args.amount

    // Create the invoice
    const invoiceId = await ctx.db.insert('invoices', {
      shopId: args.shopId,
      amount: args.amount,
      invoiceNumber: args.invoiceNumber,
      invoiceDate: args.invoiceDate,
      reference: args.reference,
      createdBy: args.createdBy,
      createdAt: Date.now(),
      status: 'active',
    })

    // Update shop balance
    await ctx.db.patch("shops", args.shopId, {
      currentBalance: newBalance,
    })

    // Create audit log
    await ctx.db.insert('balanceAuditLogs', {
      shopId: args.shopId,
      previousBalance: oldBalance,
      newBalance,
      changeAmount: args.amount,
      changeType: 'invoice',
      referenceId: invoiceId,
      changedBy: args.createdBy,
      changedAt: Date.now(),
      note: `Invoice ${args.invoiceNumber}`,
    })

    return invoiceId
  },
})

/**
 * Update an invoice (only amount and metadata, not status).
 */
export const update = mutation({
  args: {
    id: v.id('invoices'),
    amount: v.optional(v.float64()),
    invoiceNumber: v.optional(v.string()),
    invoiceDate: v.optional(v.string()),
    reference: v.optional(v.string()),
    updatedBy: v.id('employees'),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get("invoices", args.id)
    if (!invoice) {
      throw new Error('Invoice not found')
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Cannot update a cancelled invoice')
    }

    const { id, updatedBy, ...updates } = args

    // Handle amount change with balance adjustment
    if (updates.amount !== undefined && updates.amount !== invoice.amount) {
      const shop = await ctx.db.get("shops", invoice.shopId)
      if (!shop) {
        throw new Error('Shop not found')
      }

      const oldBalance = shop.currentBalance
      const amountDelta = updates.amount - invoice.amount
      const newBalance = oldBalance + amountDelta

      // Update shop balance
      await ctx.db.patch("shops", invoice.shopId, {
        currentBalance: newBalance,
      })

      // Create audit log
      await ctx.db.insert('balanceAuditLogs', {
        shopId: invoice.shopId,
        previousBalance: oldBalance,
        newBalance,
        changeAmount: amountDelta,
        changeType: 'adjustment',
        referenceId: id,
        changedBy: updatedBy,
        changedAt: Date.now(),
        note: `Invoice ${invoice.invoiceNumber} amount adjusted`,
      })
    }

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ([_, value]) => value !== undefined,
      ),
    )

    await ctx.db.patch("invoices", id, cleanUpdates)
    return id
  },
})

/**
 * Cancel an invoice.
 * This decreases the shop's balance (they owe less).
 */
export const cancel = mutation({
  args: {
    id: v.id('invoices'),
    cancelledBy: v.id('employees'),
  },
  handler: async (ctx, args) => {
    const invoice = await ctx.db.get("invoices", args.id)
    if (!invoice) {
      throw new Error('Invoice not found')
    }

    if (invoice.status === 'cancelled') {
      throw new Error('Invoice is already cancelled')
    }

    const shop = await ctx.db.get("shops", invoice.shopId)
    if (!shop) {
      throw new Error('Shop not found')
    }

    const oldBalance = shop.currentBalance
    const newBalance = oldBalance - invoice.amount

    // Update invoice status
    await ctx.db.patch("invoices", args.id, { status: 'cancelled' })

    // Update shop balance
    await ctx.db.patch("shops", invoice.shopId, {
      currentBalance: newBalance,
    })

    // Create audit log
    await ctx.db.insert('balanceAuditLogs', {
      shopId: invoice.shopId,
      previousBalance: oldBalance,
      newBalance,
      changeAmount: -invoice.amount,
      changeType: 'invoice_cancel',
      referenceId: args.id,
      changedBy: args.cancelledBy,
      changedAt: Date.now(),
      note: `Invoice ${invoice.invoiceNumber} cancelled`,
    })

    return args.id
  },
})
