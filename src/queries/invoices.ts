import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import type { Id } from '~/convex/_generated/dataModel'
import { api } from '~/convex/_generated/api'

/**
 * Invoice query options for use with React Query.
 */
export const invoiceQueries = {
  /** List invoices with optional filters */
  list: (options?: {
    shopId?: Id<'shops'>
    status?: 'active' | 'cancelled'
    includeShopDetails?: boolean
  }) => convexQuery(api.invoices.list, options ?? {}),

  /** Get a single invoice by ID */
  detail: (id: Id<'invoices'>) => convexQuery(api.invoices.get, { id }),

  /** Search invoices by invoice number, reference, or shop name */
  search: (query: string) => convexQuery(api.invoices.search, { query }),
}

/**
 * Create a new invoice.
 */
export function useCreateInvoiceMutation() {
  const mutationFn = useConvexMutation(api.invoices.create)
  return useMutation({ mutationFn })
}

/**
 * Update an invoice.
 */
export function useUpdateInvoiceMutation() {
  const mutationFn = useConvexMutation(api.invoices.update)
  return useMutation({ mutationFn })
}

/**
 * Cancel an invoice.
 */
export function useCancelInvoiceMutation() {
  const mutationFn = useConvexMutation(api.invoices.cancel)
  return useMutation({ mutationFn })
}
