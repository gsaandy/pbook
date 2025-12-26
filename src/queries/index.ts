// Query options and mutation hooks for Convex data
// Use these instead of calling Convex API directly in routes/components

export { employeeQueries } from './employees'

export {
  shopQueries,
  useCreateShopMutation,
  useUpdateShopMutation,
  useDeleteShopMutation,
} from './shops'

export {
  routeQueries,
  useCreateRouteMutation,
  useUpdateRouteMutation,
  useDeleteRouteMutation,
} from './routes'

export {
  routeAssignmentQueries,
  useAssignRouteMutation,
  useCancelAssignmentMutation,
  useCompleteAssignmentMutation,
} from './routeAssignments'
