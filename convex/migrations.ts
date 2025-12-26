import { internalMutation } from './_generated/server'

/**
 * Migration: Add nameLower field to all shops and routes.
 * Run this once after deploying the new schema.
 *
 * Usage: npx convex run migrations:addNameLowerFields
 */
export const addNameLowerFields = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Migrate shops
    const shops = await ctx.db.query('shops').collect()
    let shopsUpdated = 0
    for (const shop of shops) {
      if (!shop.nameLower) {
        await ctx.db.patch('shops', shop._id, {
          nameLower: shop.name.toLowerCase().trim(),
        })
        shopsUpdated++
      }
    }

    // Migrate routes
    const routes = await ctx.db.query('routes').collect()
    let routesUpdated = 0
    for (const route of routes) {
      if (!route.nameLower) {
        await ctx.db.patch('routes', route._id, {
          nameLower: route.name.toLowerCase().trim(),
        })
        routesUpdated++
      }
    }

    console.log(
      `Migration complete: ${shopsUpdated} shops, ${routesUpdated} routes updated`,
    )
    return { shopsUpdated, routesUpdated }
  },
})
