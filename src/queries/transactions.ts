import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import type { Id } from '~/convex/_generated/dataModel'
import { api } from '~/convex/_generated/api'

/**
 * Transaction query options for use with React Query.
 */
export const transactionQueries = {
  /** List transactions with optional filters */
  list: (options?: {
    employeeId?: Id<'employees'>
    shopId?: Id<'shops'>
    date?: string
    isVerified?: boolean
  }) => convexQuery(api.transactions.list, options ?? {}),

  /** List transactions with employee and shop details */
  listWithDetails: (options?: {
    employeeId?: Id<'employees'>
    date?: string
    isVerified?: boolean
  }) => convexQuery(api.transactions.listWithDetails, options ?? {}),

  /** Get a single transaction by ID */
  detail: (id: Id<'transactions'>) => convexQuery(api.transactions.get, { id }),

  /** Get unverified cash for an employee ("Cash in Bag") */
  cashInBag: (employeeId: Id<'employees'>) =>
    convexQuery(api.transactions.getCashInBag, { employeeId }),
}

/**
 * Collect cash from a shop.
 */
export function useCollectCashMutation() {
  const mutationFn = useConvexMutation(api.transactions.collectCash)
  return useMutation({ mutationFn })
}
