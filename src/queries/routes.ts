import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import type { Id } from '~/convex/_generated/dataModel'
import { api } from '~/convex/_generated/api'

/**
 * Route query options for use with React Query.
 */
export const routeQueries = {
  /** List all routes */
  list: () => convexQuery(api.routes.list, {}),

  /** List all routes with shop counts */
  listWithShopCounts: () => convexQuery(api.routes.listWithShopCounts, {}),

  /** Get a single route by ID */
  detail: (id: Id<'routes'>) => convexQuery(api.routes.get, { id }),

  /** Get a route with its shops */
  withShops: (id: Id<'routes'>) => convexQuery(api.routes.getWithShops, { id }),
}

/**
 * Create a new route.
 */
export function useCreateRouteMutation() {
  const mutationFn = useConvexMutation(api.routes.create)
  return useMutation({ mutationFn })
}

/**
 * Update an existing route.
 */
export function useUpdateRouteMutation() {
  const mutationFn = useConvexMutation(api.routes.update)
  return useMutation({ mutationFn })
}
