import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * List all shops with optional filters.
 */
export const list = query({
  args: {
    zone: v.optional(v.string()),
    routeId: v.optional(v.id("routes")),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let shops;

    if (args.routeId) {
      const routeId = args.routeId;
      shops = await ctx.db
        .query("shops")
        .withIndex("by_route", (q) => q.eq("routeId", routeId))
        .collect();
    } else if (args.zone) {
      const zone = args.zone;
      shops = await ctx.db
        .query("shops")
        .withIndex("by_zone", (q) => q.eq("zone", zone))
        .collect();
    } else {
      shops = await ctx.db.query("shops").collect();
    }

    if (!args.includeDeleted) {
      shops = shops.filter((s) => !s.deletedAt);
    }

    return shops;
  },
});

/**
 * Get a single shop by ID.
 */
export const get = query({
  args: { id: v.id("shops") },
  handler: async (ctx, args) => {
    return await ctx.db.get("shops", args.id);
  },
});

/**
 * Create a new shop.
 */
export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    zone: v.string(),
    currentBalance: v.optional(v.float64()),
    routeId: v.optional(v.id("routes")),
  },
  handler: async (ctx, args) => {
    const shopId = await ctx.db.insert("shops", {
      name: args.name,
      address: args.address,
      phone: args.phone,
      zone: args.zone,
      currentBalance: args.currentBalance ?? 0,
      routeId: args.routeId,
    });

    return shopId;
  },
});

/**
 * Update an existing shop.
 */
export const update = mutation({
  args: {
    id: v.id("shops"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    zone: v.optional(v.string()),
    routeId: v.optional(v.id("routes")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    await ctx.db.patch("shops", id, cleanUpdates);
    return id;
  },
});

/**
 * Soft delete a shop.
 */
export const remove = mutation({
  args: { id: v.id("shops") },
  handler: async (ctx, args) => {
    await ctx.db.patch("shops", args.id, {
      deletedAt: Date.now(),
    });
    return args.id;
  },
});

/**
 * Get unique zones from all shops.
 */
export const getZones = query({
  args: {},
  handler: async (ctx) => {
    const shops = await ctx.db
      .query("shops")
      .filter((q) => q.eq(q.field("deletedAt"), undefined))
      .collect();

    const zones = [...new Set(shops.map((s) => s.zone))];
    return zones.sort();
  },
});
