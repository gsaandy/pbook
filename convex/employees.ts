import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

/**
 * Internal mutation to link a Clerk user to an existing employee.
 * Called by the webhook when a user signs up via Clerk.
 *
 * The "Invite & Claim" pattern:
 * 1. Admin creates employee record with email (placeholder)
 * 2. User signs up via Clerk with that email
 * 3. Webhook calls this function to link the accounts
 */
export const linkUser = internalMutation({
  args: {
    email: v.string(),
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find the placeholder employee by email
    const employee = await ctx.db
      .query("employees")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!employee) {
      console.warn(`Webhook: No placeholder employee found for ${args.email}`);
      return { success: false, reason: "no_employee_found" };
    }

    if (employee.clerkUserId) {
      console.warn(`Webhook: Employee ${args.email} already linked to Clerk`);
      return { success: false, reason: "already_linked" };
    }

    // Link the Clerk account to the employee
    await ctx.db.patch(employee._id, {
      clerkUserId: args.clerkUserId,
      status: "active",
    });

    console.log(`Webhook: Successfully linked ${args.email} to Clerk user ${args.clerkUserId}`);
    return { success: true, employeeId: employee._id };
  },
});

/**
 * Get the current employee based on their Clerk user ID.
 * Used to get the employee record for the authenticated user.
 */
export const getByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("employees")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
  },
});

/**
 * Get the current authenticated employee.
 * Returns null if no user is authenticated or employee not found.
 */
export const getCurrentEmployee = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Clerk's subject is the user ID
    const clerkUserId = identity.subject;

    return await ctx.db
      .query("employees")
      .withIndex("by_clerk_user_id", (q) => q.eq("clerkUserId", clerkUserId))
      .first();
  },
});

/**
 * List all employees (for admin use).
 * Optionally filter by status.
 */
export const list = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    includeDeleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let employees;

    if (args.status) {
      employees = await ctx.db
        .query("employees")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      employees = await ctx.db.query("employees").collect();
    }

    // Filter out deleted unless specifically requested
    if (!args.includeDeleted) {
      employees = employees.filter((e) => !e.deletedAt);
    }

    return employees;
  },
});
