import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '~/convex/_generated/api'

/**
 * Employee query options for use with React Query.
 */
export const employeeQueries = {
  /** Get employee by Clerk user ID */
  byClerkId: (clerkUserId: string) =>
    convexQuery(api.employees.getByClerkId, { clerkUserId }),

  /** Get the current authenticated employee */
  current: () => convexQuery(api.employees.getCurrentEmployee, {}),

  /** List all employees */
  list: (options?: { status?: 'active' | 'inactive'; includeDeleted?: boolean }) =>
    convexQuery(api.employees.list, options ?? {}),
}

/**
 * Mutation hooks for employee operations.
 * Note: Employee creation is typically done by admins, and linking is done via webhook.
 */
// Future: Add employee CRUD mutations here when needed
