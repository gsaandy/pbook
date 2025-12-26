import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { HandoversView } from './-components/HandoversView'
import type { Id } from '~/convex/_generated/dataModel'
import {
  adminQueries,
  transactionQueries,
  useVerifyHandoverMutation,
} from '~/queries'

export const Route = createFileRoute('/_authed/settlements')({
  component: HandoversPage,
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
