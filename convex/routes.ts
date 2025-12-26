import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

/**
 * List all routes.
 */
export const list = query({
  args: {
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const routes = await ctx.db.query('routes').collect()

    if (!args.includeDeleted) {
      return routes.filter((r) => !r.deletedAt)
    }

    return routes
  },
})

/**
 * List all routes with shop counts.
 */
export const listWithShopCounts = query({
  args: {
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let routes = await ctx.db.query('routes').collect()

    if (!args.includeDeleted) {
      routes = routes.filter((r) => !r.deletedAt)
    }

    // Get all active shops
    const allShops = await ctx.db.query('shops').collect()
    const activeShops = allShops.filter((s) => !s.deletedAt)

    // Count shops per route
    const shopCountByRoute = new Map<string, number>()
    for (const shop of activeShops) {
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
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
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
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const routeId = await ctx.db.insert('routes', {
      name: args.name,
      description: args.description,
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
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const cleanUpdates = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      Object.entries(updates).filter(([_, value]) => value !== undefined),
    )

    await ctx.db.patch('routes', id, cleanUpdates)
    return id
  },
})

/**
 * Soft delete a route.
 */
export const remove = mutation({
  args: { id: v.id('routes') },
  handler: async (ctx, args) => {
    await ctx.db.patch('routes', args.id, {
      deletedAt: Date.now(),
    })
    return args.id
  },
})
