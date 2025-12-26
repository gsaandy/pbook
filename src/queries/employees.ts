import { useMutation } from '@tanstack/react-query'
import {
  convexQuery,
  useConvexAction,
  useConvexMutation,
} from '@convex-dev/react-query'
import type { Id } from '~/convex/_generated/dataModel'
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
  list: () => convexQuery(api.employees.list, {}),

  /** Get a single employee by ID */
  detail: (id: Id<'employees'>) => convexQuery(api.employees.get, { id }),
}

/**
 * Create a new employee (admin placeholder) - without invitation.
 */
export function useCreateEmployeeMutation() {
  const mutationFn = useConvexMutation(api.employees.create)
  return useMutation({ mutationFn })
}

/**
 * Create a new employee AND send Clerk invitation email.
 * This is the preferred method for adding new employees.
 */
export function useCreateAndInviteEmployeeMutation() {
  const mutationFn = useConvexAction(api.users.createAndInviteEmployee)
  return useMutation({ mutationFn })
}

/**
 * Update an existing employee.
 */
export function useUpdateEmployeeMutation() {
  const mutationFn = useConvexMutation(api.employees.update)
  return useMutation({ mutationFn })
}

/**
 * Re-send invitation to an existing employee.
 */
export function useResendInvitationMutation() {
  const mutationFn = useConvexAction(api.users.resendInvitation)
  return useMutation({ mutationFn })
}
