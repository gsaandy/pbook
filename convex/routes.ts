import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List all routes.
 */
export const list = query({
  args: {
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const routes = await ctx.db.query("routes").collect();

    if (!args.includeDeleted) {
      return routes.filter((r) => !r.deletedAt);
    }

    return routes;
  },
});

/**
 * Get a single route by ID.
 */
export const get = query({
  args: { id: v.id("routes") },
  handler: async (ctx, args) => {
    return await ctx.db.get("routes", args.id);
  },
});

/**
 * Get a route with its shops.
 */
export const getWithShops = query({
  args: { id: v.id("routes") },
  handler: async (ctx, args) => {
    const route = await ctx.db.get("routes", args.id);
    if (!route) return null;

    const shops = await ctx.db
      .query("shops")
      .withIndex("by_route", (q) => q.eq("routeId", args.id))
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    return { ...route, shops };
  },
});

/**
 * Create a new route.
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const routeId = await ctx.db.insert("routes", {
      name: args.name,
      description: args.description,
    });

    return routeId;
  },
});

/**
 * Update an existing route.
 */
export const update = mutation({
  args: {
    id: v.id("routes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const cleanUpdates = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch("routes", id, cleanUpdates);
    return id;
  },
});

/**
 * Soft delete a route.
 */
export const remove = mutation({
  args: { id: v.id("routes") },
  handler: async (ctx, args) => {
    await ctx.db.patch("routes", args.id, {
      deletedAt: Date.now(),
    });
    return args.id;
  },
});
