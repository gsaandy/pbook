import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { HandoversView } from './-components/HandoversView'
import type { Id } from '~/convex/_generated/dataModel'
import { EmployeeRole } from '~/lib/constants'
import {
  adminQueries,
  employeeQueries,
  transactionQueries,
  useVerifyHandoverMutation,
} from '~/queries'

export const Route = createFileRoute('/_authed/handovers')({
  component: HandoversPage,
  beforeLoad: async ({ context: { queryClient } }) => {
    // Check if user is authorized (admins only)
    const employee = await queryClient.ensureQueryData(
      employeeQueries.current(),
    )
    if (employee?.role === EmployeeRole.FIELD_STAFF) {
      throw redirect({ to: '/collections' })
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(adminQueries.pendingHandovers()),
      queryClient.ensureQueryData(transactionQueries.listWithDetails({})),
    ])
  },
})

function HandoversPage() {
  // Fetch data from Convex
  const { data: pendingHandovers } = useSuspenseQuery(
    adminQueries.pendingHandovers(),
  )
  const { data: transactions } = useSuspenseQuery(
    transactionQueries.listWithDetails({}),
  )

  // Mutations
  const verifyHandoverMutation = useVerifyHandoverMutation()

  // Get recent verified handovers from transactions
  const recentVerified = transactions
    .filter((t) => t.isVerified && t.verifiedAt && t.paymentMode === 'cash')
    .slice(0, 10)

  // Handle verify handover
  const handleVerifyHandover = async (employeeId: string) => {
    await verifyHandoverMutation.mutateAsync({
      employeeId: employeeId as Id<'employees'>,
    })
  }

  return (
    <HandoversView
      pendingHandovers={pendingHandovers}
      recentVerified={recentVerified}
      onVerifyHandover={handleVerifyHandover}
      isVerifying={verifyHandoverMutation.isPending}
    />
  )
}
