import { v } from 'convex/values'
import { internalMutation, mutation, query } from './_generated/server'

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
      .query('employees')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (!employee) {
      console.warn(`Webhook: No placeholder employee found for ${args.email}`)
      return { success: false, reason: 'no_employee_found' }
    }

    if (employee.clerkUserId) {
      console.warn(`Webhook: Employee ${args.email} already linked to Clerk`)
      return { success: false, reason: 'already_linked' }
    }

    // Link the Clerk account to the employee
    await ctx.db.patch('employees', employee._id, {
      clerkUserId: args.clerkUserId,
    })

    console.log(
      `Webhook: Successfully linked ${args.email} to Clerk user ${args.clerkUserId}`,
    )
    return { success: true, employeeId: employee._id }
  },
})

/**
 * Get the current employee based on their Clerk user ID.
 * Used to get the employee record for the authenticated user.
 */
export const getByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('employees')
      .withIndex('by_clerk_user_id', (q) =>
        q.eq('clerkUserId', args.clerkUserId),
      )
      .first()
  },
})

/**
 * Get the current authenticated employee.
 * Returns null if no user is authenticated or employee not found.
 */
export const getCurrentEmployee = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return null
    }

    // Clerk's subject is the user ID
    const clerkUserId = identity.subject

    return await ctx.db
      .query('employees')
      .withIndex('by_clerk_user_id', (q) => q.eq('clerkUserId', clerkUserId))
      .first()
  },
})

/**
 * List all employees.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('employees').collect()
  },
})

/**
 * Get a single employee by ID.
 */
export const get = query({
  args: { id: v.id('employees') },
  handler: async (ctx, args) => {
    return await ctx.db.get('employees', args.id)
  },
})

/**
 * Create a new employee placeholder (admin only).
 * The employee will be linked to a Clerk account when they sign up.
 */
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal('field_staff'),
      v.literal('admin'),
      v.literal('super_admin'),
    ),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query('employees')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .first()

    if (existing) {
      throw new Error('An employee with this email already exists')
    }

    const employeeId = await ctx.db.insert('employees', {
      name: args.name,
      email: args.email,
      role: args.role,
      status: 'active',
    })

    return employeeId
  },
})

/**
 * Update an existing employee.
 */
export const update = mutation({
  args: {
    id: v.id('employees'),
    name: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal('field_staff'),
        v.literal('admin'),
        v.literal('super_admin'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        ([_, value]) => value !== undefined,
      ),
    )

    await ctx.db.patch('employees', id, cleanUpdates)
    return id
  },
})
