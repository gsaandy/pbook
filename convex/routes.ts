import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List all routes.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('routes').collect()
  },
})

/**
 * List all routes with shop counts.
 */
export const listWithShopCounts = query({
  args: {},
  handler: async (ctx) => {
    const routes = await ctx.db.query('routes').collect()
    const allShops = await ctx.db.query('shops').collect()

    // Count shops per route
    const shopCountByRoute = new Map<string, number>()
    for (const shop of allShops) {
      if (shop.routeId) {
        const count = shopCountByRoute.get(shop.routeId) ?? 0
        shopCountByRoute.set(shop.routeId, count + 1)
      }
    }

    return routes.map((route) => ({
      ...route,
      shopCount: shopCountByRoute.get(route._id) ?? 0,
    }))
  },
})

/**
 * Get a single route by ID.
 */
export const get = query({
  args: { id: v.id('routes') },
  handler: async (ctx, args) => {
    return await ctx.db.get('routes', args.id)
  },
})

/**
 * Get a route with its shops.
 */
export const getWithShops = query({
  args: { id: v.id('routes') },
  handler: async (ctx, args) => {
    const route = await ctx.db.get('routes', args.id)
    if (!route) return null

    const shops = await ctx.db
      .query('shops')
      .withIndex('by_route', (q) => q.eq('routeId', args.id))
      .collect()

    return { ...route, shops }
  },
})

/**
 * Create a new route.
 */
export const create = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const nameLower = args.name.toLowerCase().trim()

    // Check for duplicate name (case-insensitive)
    // First try the index, then fallback to full scan for unmigrated records
    let existing = await ctx.db
      .query('routes')
      .withIndex('by_name_lower', (q) => q.eq('nameLower', nameLower))
      .first()

    if (!existing) {
      // Fallback: check for unmigrated records by comparing name directly
      const allRoutes = await ctx.db.query('routes').collect()
      existing =
        allRoutes.find(
          (r) => !r.nameLower && r.name.toLowerCase().trim() === nameLower,
        ) ?? null
    }

    if (existing) {
      throw new Error(`A route named "${existing.name}" already exists`)
    }

    const routeId = await ctx.db.insert('routes', {
      name: args.name.trim(),
      nameLower,
    })

    return routeId
  },
})

/**
 * Update an existing route.
 */
export const update = mutation({
  args: {
    id: v.id('routes'),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, name } = args

    if (name === undefined) {
      return id // Nothing to update
    }

    const nameLower = name.toLowerCase().trim()

    // Check for duplicate name (case-insensitive)
    // First try the index, then fallback to full scan for unmigrated records
    let existing = await ctx.db
      .query('routes')
      .withIndex('by_name_lower', (q) => q.eq('nameLower', nameLower))
      .first()

    if (!existing) {
      // Fallback: check for unmigrated records
      const allRoutes = await ctx.db.query('routes').collect()
      existing =
        allRoutes.find(
          (r) => !r.nameLower && r.name.toLowerCase().trim() === nameLower,
        ) ?? null
    }

    if (existing && existing._id !== id) {
      throw new Error(`A route named "${existing.name}" already exists`)
    }

    await ctx.db.patch('routes', id, {
      name: name.trim(),
      nameLower,
    })

    return id
  },
})
