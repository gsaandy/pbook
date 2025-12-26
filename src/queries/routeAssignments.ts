import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import type { Id } from '~/convex/_generated/dataModel'
import { api } from '~/convex/_generated/api'

/**
 * Route assignment query options for use with React Query.
 */
export const routeAssignmentQueries = {
  /** Get assignments for a specific date */
  byDate: (date: string) => convexQuery(api.routeAssignments.getByDate, { date }),

  /** Get assignments for a specific date with employee and route details */
  byDateWithDetails: (date: string) =>
    convexQuery(api.routeAssignments.getByDateWithDetails, { date }),

  /** Get today's assignment for a specific employee */
  employeeAssignment: (employeeId: Id<'employees'>, date: string) =>
    convexQuery(api.routeAssignments.getEmployeeAssignment, { employeeId, date }),
}

/**
 * Assign a route to an employee for a specific date.
 */
export function useAssignRouteMutation() {
  const mutationFn = useConvexMutation(api.routeAssignments.assign)
  return useMutation({ mutationFn })
}

/**
 * Cancel a route assignment.
 */
export function useCancelAssignmentMutation() {
  const mutationFn = useConvexMutation(api.routeAssignments.cancel)
  return useMutation({ mutationFn })
}

/**
 * Mark a route assignment as completed.
 */
export function useCompleteAssignmentMutation() {
  const mutationFn = useConvexMutation(api.routeAssignments.complete)
  return useMutation({ mutationFn })
}
