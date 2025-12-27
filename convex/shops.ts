import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List all shops with optional filters.
 */
export const list = query({
  args: {
    zone: v.optional(v.string()),
    routeId: v.optional(v.id('routes')),
  },
  handler: async (ctx, args) => {
    if (args.routeId) {
      return await ctx.db
        .query('shops')
        .withIndex('by_route', (q) => q.eq('routeId', args.routeId))
        .collect()
    } else if (args.zone) {
      // No zone index in new schema, filter in memory
      const shops = await ctx.db.query('shops').collect()
      return shops.filter((s) => s.zone === args.zone)
    }
    return await ctx.db.query('shops').collect()
  },
})

/**
 * Get a single shop by ID.
 */
export const get = query({
  args: { id: v.id('shops') },
  handler: async (ctx, args) => {
    return await ctx.db.get('shops', args.id)
  },
})

/**
 * Get a shop by retailer unique code.
 */
export const getByRetailerUniqueCode = query({
  args: { retailerUniqueCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('shops')
      .withIndex('by_retailer_unique_code', (q) =>
        q.eq('retailerUniqueCode', args.retailerUniqueCode),
      )
      .first()
  },
})

/**
 * Create a new shop.
 */
export const create = mutation({
  args: {
    name: v.string(),
    retailerUniqueCode: v.string(),
    zone: v.string(),
    currentBalance: v.optional(v.float64()),
    routeId: v.optional(v.id('routes')),
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
  },
  handler: async (ctx, args) => {
    const nameLower = args.name.toLowerCase().trim()

    // Check for duplicate name (case-insensitive)
    // First try the index, then fallback to full scan for unmigrated records
    let existing = await ctx.db
      .query('shops')
      .withIndex('by_name_lower', (q) => q.eq('nameLower', nameLower))
      .first()

    if (!existing) {
      // Fallback: check for unmigrated records by comparing name directly
      const allShops = await ctx.db.query('shops').collect()
      existing =
        allShops.find(
          (s) => !s.nameLower && s.name.toLowerCase().trim() === nameLower,
        ) ?? null
    }

    if (existing) {
      throw new Error(`A shop named "${existing.name}" already exists`)
    }

    // Check for duplicate retailerUniqueCode
    const existingByCode = await ctx.db
      .query('shops')
      .withIndex('by_retailer_unique_code', (q) =>
        q.eq('retailerUniqueCode', args.retailerUniqueCode),
      )
      .first()

    if (existingByCode) {
      throw new Error(
        `A shop with retailer unique code "${args.retailerUniqueCode}" already exists`,
      )
    }

    const shopId = await ctx.db.insert('shops', {
      name: args.name.trim(),
      nameLower,
      retailerUniqueCode: args.retailerUniqueCode.trim(),
      zone: args.zone,
      currentBalance: args.currentBalance ?? 0,
      routeId: args.routeId,
      addressLine1: args.addressLine1?.trim(),
      addressLine2: args.addressLine2?.trim(),
      addressLine3: args.addressLine3?.trim(),
      city: args.city?.trim(),
      district: args.district?.trim(),
      state: args.state?.trim(),
      pinCode: args.pinCode?.trim(),
      phone: args.phone?.trim(),
      whatsapp: args.whatsapp?.trim(),
      latitude: args.latitude,
      longitude: args.longitude,
    })

    return shopId
  },
})

/**
 * Update an existing shop.
 */
export const update = mutation({
  args: {
    id: v.id('shops'),
    name: v.optional(v.string()),
    retailerUniqueCode: v.optional(v.string()),
    zone: v.optional(v.string()),
    routeId: v.optional(v.id('routes')),
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
  },
  handler: async (ctx, args) => {
    const {
      id,
      name,
      retailerUniqueCode,
      zone,
      routeId,
      addressLine1,
      addressLine2,
      addressLine3,
      city,
      district,
      state,
      pinCode,
      phone,
      whatsapp,
      latitude,
      longitude,
    } = args

    const updates: Record<string, unknown> = {}

    // If name is being updated, check for duplicates
    if (name !== undefined) {
      const nameLower = name.toLowerCase().trim()

      // Check via index first
      let existing = await ctx.db
        .query('shops')
        .withIndex('by_name_lower', (q) => q.eq('nameLower', nameLower))
        .first()

      if (!existing) {
        // Fallback: check for unmigrated records
        const allShops = await ctx.db.query('shops').collect()
        existing =
          allShops.find(
            (s) => !s.nameLower && s.name.toLowerCase().trim() === nameLower,
          ) ?? null
      }

      if (existing && existing._id !== id) {
        throw new Error(`A shop named "${existing.name}" already exists`)
      }

      updates.name = name.trim()
      updates.nameLower = nameLower
    }

    // If retailerUniqueCode is being updated, check for duplicates
    if (retailerUniqueCode !== undefined) {
      const existingByCode = await ctx.db
        .query('shops')
        .withIndex('by_retailer_unique_code', (q) =>
          q.eq('retailerUniqueCode', retailerUniqueCode),
        )
        .first()

      if (existingByCode && existingByCode._id !== id) {
        throw new Error(
          `A shop with retailer unique code "${retailerUniqueCode}" already exists`,
        )
      }

      updates.retailerUniqueCode = retailerUniqueCode.trim()
    }

    // Update other fields
    if (zone !== undefined) updates.zone = zone
    if (routeId !== undefined) updates.routeId = routeId
    if (addressLine1 !== undefined) updates.addressLine1 = addressLine1.trim()
    if (addressLine2 !== undefined) updates.addressLine2 = addressLine2.trim()
    if (addressLine3 !== undefined) updates.addressLine3 = addressLine3.trim()
    if (city !== undefined) updates.city = city.trim()
    if (district !== undefined) updates.district = district.trim()
    if (state !== undefined) updates.state = state.trim()
    if (pinCode !== undefined) updates.pinCode = pinCode.trim()
    if (phone !== undefined) updates.phone = phone.trim()
    if (whatsapp !== undefined) updates.whatsapp = whatsapp.trim()
    if (latitude !== undefined) updates.latitude = latitude
    if (longitude !== undefined) updates.longitude = longitude

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch('shops', id, updates)
    }

    return id
  },
})

/**
 * Get unique zones from all shops.
 */
export const getZones = query({
  args: {},
  handler: async (ctx) => {
    const shops = await ctx.db.query('shops').collect()
    const zones = [...new Set(shops.map((s) => s.zone))]
    return zones.sort()
  },
})

/**
 * Get shop ledger - all balance changes for a shop.
 * Returns a list suitable for displaying as a Credit/Debit table.
 */
export const getLedger = query({
  args: {
    shopId: v.id('shops'),
    startDate: v.optional(v.string()), // YYYY-MM-DD
    endDate: v.optional(v.string()), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db
      .query('balanceAuditLogs')
      .withIndex('by_shop_date', (q) => q.eq('shopId', args.shopId))
      .collect()

    // Filter by date range if provided
    if (args.startDate) {
      const startMs = new Date(args.startDate).getTime()
      logs = logs.filter((l) => l.changedAt >= startMs)
    }
    if (args.endDate) {
      const endMs = new Date(args.endDate).setHours(23, 59, 59, 999)
      logs = logs.filter((l) => l.changedAt <= endMs)
    }

    // Sort by date ascending for ledger view
    logs.sort((a, b) => a.changedAt - b.changedAt)

    // Format for ledger display
    return logs.map((log) => ({
      id: log._id,
      date: new Date(log.changedAt).toISOString().split('T')[0],
      type: log.type,
      debit: log.changeAmount > 0 ? log.changeAmount : null, // Invoice = debit
      credit: log.changeAmount < 0 ? Math.abs(log.changeAmount) : null, // Collection = credit
      balance: log.newBalance,
      note: log.note,
      invoiceId: log.invoiceId,
      transactionId: log.transactionId,
    }))
  },
})
