import { v } from 'convex/values'
import { action, internalAction, internalMutation } from './_generated/server'
import { internal } from './_generated/api'
import type { Id } from './_generated/dataModel'

/**
 * Create a new employee placeholder (internal).
 * This saves the employee to the database with status "active".
 * The employee will be linked when they accept the Clerk invitation.
 */
export const createEmployeeInternal = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal('field_staff'),
      v.literal('admin'),
      v.literal('super_admin'),
    ),
  },
  handler: async (ctx, args): Promise<Id<'employees'>> => {
    // Check if email already exists
    const existing = await ctx.db
      .query('employees')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first()

    if (existing) {
      throw new Error('An employee with this email already exists')
    }

    // Insert employee record
    const employeeId = await ctx.db.insert('employees', {
      name: args.name,
      email: args.email.toLowerCase(),
      role: args.role,
      status: 'active',
      // clerkUserId will be set when they accept the invite via webhook
    })

    return employeeId
  },
})

/**
 * Send a Clerk invitation email to the employee (internal).
 * This action calls the Clerk API to send an official invitation.
 *
 * Prerequisites:
 * - CLERK_SECRET_KEY must be set in Convex Dashboard > Environment Variables
 */
export const inviteUserToClerkInternal = internalAction({
  args: {
    email: v.string(),
  },
  handler: async (
    _ctx,
    args,
  ): Promise<{ success: boolean; invitationId: string }> => {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY

    if (!clerkSecretKey) {
      throw new Error(
        'CLERK_SECRET_KEY not configured. Add it in Convex Dashboard > Environment Variables.',
      )
    }

    const response = await fetch('https://api.clerk.com/v1/invitations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: args.email.toLowerCase(),
        ignore_existing: true, // Don't error if user already exists
      }),
    })

    if (!response.ok) {
      const error = (await response.json()) as {
        errors?: Array<{ message: string }>
      }
      console.error('Clerk invitation error:', error)
      throw new Error(error.errors?.[0]?.message ?? 'Failed to send invitation')
    }

    const result = (await response.json()) as { id: string }
    console.log(`Invitation sent to ${args.email}:`, result.id)

    return { success: true, invitationId: result.id }
  },
})

/**
 * Re-send invitation to an existing employee (public action).
 * Use this when you need to re-invite someone who didn't get the first email.
 */
export const resendInvitation = action({
  args: {
    email: v.string(),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ success: boolean; invitationId: string }> => {
    return await ctx.runAction(internal.users.inviteUserToClerkInternal, {
      email: args.email,
    })
  },
})

/**
 * Combined action: Create employee AND send Clerk invitation.
 * This is the main entry point for adding a new employee.
 */
export const createAndInviteEmployee = action({
  args: {
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal('field_staff'),
      v.literal('admin'),
      v.literal('super_admin'),
    ),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    success: boolean
    employeeId: Id<'employees'>
    invitationId?: string
    error?: string
  }> => {
    // Step 1: Create the employee record in the database
    const employeeId = await ctx.runMutation(
      internal.users.createEmployeeInternal,
      {
        name: args.name,
        email: args.email,
        role: args.role,
      },
    )

    // Step 2: Send the Clerk invitation email
    try {
      const invitation = await ctx.runAction(
        internal.users.inviteUserToClerkInternal,
        {
          email: args.email,
        },
      )

      return {
        success: true,
        employeeId,
        invitationId: invitation.invitationId,
      }
    } catch (error) {
      // If invitation fails, the employee record still exists
      // They can be re-invited later or sign up manually
      console.error('Invitation failed but employee created:', error)

      return {
        success: false,
        employeeId,
        error: 'Employee created but invitation email failed to send',
      }
    }
  },
})
