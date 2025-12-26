import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import type { Id } from '~/convex/_generated/dataModel'
import { api } from '~/convex/_generated/api'

/**
 * Shop query options for use with React Query.
 */
export const shopQueries = {
  /** List all shops with optional filters */
  list: (options?: {
    zone?: string
    routeId?: Id<'routes'>
    includeDeleted?: boolean
  }) => convexQuery(api.shops.list, options ?? {}),

  /** Get a single shop by ID */
  detail: (id: Id<'shops'>) => convexQuery(api.shops.get, { id }),

  /** Get all unique zones */
  zones: () => convexQuery(api.shops.getZones, {}),
}

/**
 * Create a new shop.
 */
export function useCreateShopMutation() {
  const mutationFn = useConvexMutation(api.shops.create)
  return useMutation({ mutationFn })
}

/**
 * Update an existing shop.
 */
export function useUpdateShopMutation() {
  const mutationFn = useConvexMutation(api.shops.update)
  return useMutation({ mutationFn })
}

/**
 * Soft delete a shop.
 */
export function useDeleteShopMutation() {
  const mutationFn = useConvexMutation(api.shops.remove)
  return useMutation({ mutationFn })
}
