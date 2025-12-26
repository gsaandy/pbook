import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import type { Id } from '~/convex/_generated/dataModel'
import { api } from '~/convex/_generated/api'

/**
 * Reconciliation query options for use with React Query.
 */
export const reconciliationQueries = {
  /** List reconciliations with optional filters */
  list: (options?: {
    employeeId?: Id<'employees'>
    date?: string
    status?: 'pending' | 'verified' | 'mismatch'
  }) => convexQuery(api.reconciliations.list, options ?? {}),

  /** List reconciliations with employee details */
  listWithDetails: (options?: { date?: string }) =>
    convexQuery(api.reconciliations.listWithDetails, options ?? {}),

  /** Get a single reconciliation by ID */
  detail: (id: Id<'dailyReconciliations'>) =>
    convexQuery(api.reconciliations.get, { id }),

  /** Get reconciliation for a specific employee and date */
  byEmployeeDate: (employeeId: Id<'employees'>, date: string) =>
    convexQuery(api.reconciliations.getByEmployeeDate, { employeeId, date }),
}

/**
 * Verify/create a daily reconciliation.
 */
export function useVerifyReconciliationMutation() {
  const mutationFn = useConvexMutation(api.reconciliations.verify)
  return useMutation({ mutationFn })
}

/**
 * Update reconciliation status (admin override).
 */
export function useUpdateReconciliationStatusMutation() {
  const mutationFn = useConvexMutation(api.reconciliations.updateStatus)
  return useMutation({ mutationFn })
}
