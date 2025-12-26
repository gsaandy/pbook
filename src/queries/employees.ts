import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
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
  list: (options?: {
    status?: 'active' | 'inactive'
    includeDeleted?: boolean
  }) => convexQuery(api.employees.list, options ?? {}),

  /** Get a single employee by ID */
  detail: (id: Id<'employees'>) => convexQuery(api.employees.get, { id }),
}

/**
 * Create a new employee (admin placeholder).
 */
export function useCreateEmployeeMutation() {
  const mutationFn = useConvexMutation(api.employees.create)
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
 * Toggle employee status (active/inactive).
 */
export function useToggleEmployeeStatusMutation() {
  const mutationFn = useConvexMutation(api.employees.toggleStatus)
  return useMutation({ mutationFn })
}
