import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import type { Id } from '~/convex/_generated/dataModel'
import { api } from '~/convex/_generated/api'

/**
 * Settlement query options for use with React Query.
 */
export const settlementQueries = {
  /** List settlements with optional filters */
  list: (options?: {
    employeeId?: Id<'employees'>
    status?: 'pending' | 'received' | 'discrepancy'
  }) => convexQuery(api.settlements.list, options ?? {}),

  /** List settlements with employee details */
  listWithDetails: (options?: {
    status?: 'pending' | 'received' | 'discrepancy'
  }) => convexQuery(api.settlements.listWithDetails, options ?? {}),

  /** Get a single settlement by ID */
  detail: (id: Id<'settlements'>) => convexQuery(api.settlements.get, { id }),

  /** Get pending settlements for an employee */
  pendingForEmployee: (employeeId: Id<'employees'>) =>
    convexQuery(api.settlements.getPendingForEmployee, { employeeId }),
}

/**
 * Create a pending settlement for cash handover.
 */
export function useCreateSettlementMutation() {
  const mutationFn = useConvexMutation(api.settlements.create)
  return useMutation({ mutationFn })
}

/**
 * Receive cash and verify the settlement.
 */
export function useReceiveSettlementMutation() {
  const mutationFn = useConvexMutation(api.settlements.receive)
  return useMutation({ mutationFn })
}

/**
 * Verify cash handover - handles both match and mismatch cases.
 */
export function useVerifySettlementMutation() {
  const mutationFn = useConvexMutation(api.settlements.verify)
  return useMutation({ mutationFn })
}

/**
 * Update settlement status (admin override).
 */
export function useUpdateSettlementStatusMutation() {
  const mutationFn = useConvexMutation(api.settlements.updateStatus)
  return useMutation({ mutationFn })
}
