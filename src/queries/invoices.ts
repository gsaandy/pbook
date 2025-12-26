import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import type { Id } from '~/convex/_generated/dataModel'
import { api } from '~/convex/_generated/api'

/**
 * Invoice query options for use with React Query.
 */
export const invoiceQueries = {
  /** List invoices with optional filters */
  list: (options?: { shopId?: Id<'shops'> }) =>
    convexQuery(api.invoices.list, options ?? {}),

  /** List invoices with shop details */
  listWithDetails: (options?: { shopId?: Id<'shops'> }) =>
    convexQuery(api.invoices.listWithDetails, options ?? {}),

  /** Get a single invoice by ID */
  detail: (id: Id<'invoices'>) => convexQuery(api.invoices.get, { id }),

  /** Get invoice by invoice number */
  byInvoiceNumber: (invoiceNumber: string) =>
    convexQuery(api.invoices.getByInvoiceNumber, { invoiceNumber }),
}

/**
 * Create a new invoice.
 */
export function useCreateInvoiceMutation() {
  const mutationFn = useConvexMutation(api.invoices.create)
  return useMutation({ mutationFn })
}
