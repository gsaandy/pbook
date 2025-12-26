// Query options and mutation hooks for Convex data
// Use these instead of calling Convex API directly in routes/components

export {
  employeeQueries,
  useCreateEmployeeMutation,
  useCreateAndInviteEmployeeMutation,
  useUpdateEmployeeMutation,
  useResendInvitationMutation,
} from './employees'

export {
  shopQueries,
  useCreateShopMutation,
  useUpdateShopMutation,
} from './shops'

export {
  routeQueries,
  useCreateRouteMutation,
  useUpdateRouteMutation,
} from './routes'

export { transactionQueries, useCollectCashMutation } from './transactions'

export { invoiceQueries, useCreateInvoiceMutation } from './invoices'

export {
  adminQueries,
  useVerifyHandoverMutation,
  useAddCorrectionMutation,
} from './admin'
