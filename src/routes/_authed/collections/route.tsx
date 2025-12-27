import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { CollectionsView } from './-components/CollectionsView'
import { FieldStaffCollections } from './-components/FieldStaffCollections'
import type { Id } from '~/convex/_generated/dataModel'
import {
  employeeQueries,
  shopQueries,
  transactionQueries,
  useCollectCashMutation,
} from '~/queries'

export const Route = createFileRoute('/_authed/collections')({
  component: OperationsPage,
  loader: async ({ context: { queryClient } }) => {
    const today = new Date().toISOString().split('T')[0]
    await Promise.all([
      queryClient.ensureQueryData(employeeQueries.list()),
      queryClient.ensureQueryData(employeeQueries.current()),
      queryClient.ensureQueryData(shopQueries.list()),
      queryClient.ensureQueryData(
        transactionQueries.listWithDetails({ date: today }),
      ),
    ])
  },
})

function OperationsPage() {
  const today = new Date().toISOString().split('T')[0]

  // Fetch data from Convex
  const { data: employees } = useSuspenseQuery(employeeQueries.list())
  const { data: currentEmployee } = useSuspenseQuery(employeeQueries.current())
  const { data: shops } = useSuspenseQuery(shopQueries.list())
  const { data: transactions } = useSuspenseQuery(
    transactionQueries.listWithDetails({ date: today }),
  )

  // Mutations
  const collectCashMutation = useCollectCashMutation()

  // Handle collect cash
  const handleCollectCash = async (data: {
    shopId: string
    amount: number
    paymentMode: 'cash' | 'upi' | 'cheque'
  }) => {
    if (!currentEmployee) return

    await collectCashMutation.mutateAsync({
      shopId: data.shopId as Id<'shops'>,
      amount: data.amount,
      paymentMode: data.paymentMode,
      employeeId: currentEmployee._id,
    })
  }

  // Field staff get the mobile-optimized view
  if (currentEmployee?.role === 'field_staff') {
    return (
      <FieldStaffCollections
        currentEmployee={currentEmployee}
        shops={shops}
        transactions={transactions}
        today={today}
        onCollectCash={handleCollectCash}
        isCollecting={collectCashMutation.isPending}
      />
    )
  }

  // Admins get the dashboard view
  return (
    <CollectionsView
      employees={employees}
      currentEmployee={currentEmployee}
      shops={shops}
      transactions={transactions}
      today={today}
      onCollectCash={handleCollectCash}
      isCollecting={collectCashMutation.isPending}
    />
  )
}
