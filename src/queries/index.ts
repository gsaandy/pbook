// Query options and mutation hooks for Convex data
// Use these instead of calling Convex API directly in routes/components

export {
  employeeQueries,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useToggleEmployeeStatusMutation,
} from './employees'

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

export {
  transactionQueries,
  useCollectCashMutation,
  useReverseTransactionMutation,
} from './transactions'

export {
  settlementQueries,
  useCreateSettlementMutation,
  useReceiveSettlementMutation,
  useVerifySettlementMutation,
  useUpdateSettlementStatusMutation,
} from './settlements'

export {
  invoiceQueries,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useCancelInvoiceMutation,
} from './invoices'
