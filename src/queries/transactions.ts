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
  }) => convexQuery(api.transactions.list, options ?? {}),

  /** List transactions with employee and shop details */
  listWithDetails: (options?: {
    employeeId?: Id<'employees'>
    date?: string
  }) => convexQuery(api.transactions.listWithDetails, options ?? {}),

  /** Get a single transaction by ID */
  detail: (id: Id<'transactions'>) => convexQuery(api.transactions.get, { id }),

  /** Get cash in hand for an employee on a specific date */
  cashInHand: (employeeId: Id<'employees'>, date: string) =>
    convexQuery(api.transactions.getEmployeeCashInHand, { employeeId, date }),
}

/**
 * Collect cash from a shop.
 */
export function useCollectCashMutation() {
  const mutationFn = useConvexMutation(api.transactions.collectCash)
  return useMutation({ mutationFn })
}

/**
 * Reverse a transaction.
 */
export function useReverseTransactionMutation() {
  const mutationFn = useConvexMutation(api.transactions.reverse)
  return useMutation({ mutationFn })
}
