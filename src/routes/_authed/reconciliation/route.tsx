import { useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { EndOfDayReconciliation } from './-components/EndOfDayReconciliation'
import type {
  CashTransactionsByEmployee,
  EODSummary,
  EmployeeSettlement,
  VerificationFormData,
} from './-components/EndOfDayReconciliation'
import type { Id } from '~/convex/_generated/dataModel'
import {
  employeeQueries,
  reconciliationQueries,
  routeAssignmentQueries,
  transactionQueries,
  useVerifyReconciliationMutation,
} from '~/queries'
import { PaymentMode, ReconciliationStatus, Status } from '~/lib/constants'

export const Route = createFileRoute('/_authed/reconciliation')({
  component: ReconciliationPage,
  loader: async ({ context: { queryClient } }) => {
    const today = new Date().toISOString().split('T')[0]
    await Promise.all([
      queryClient.ensureQueryData(employeeQueries.list()),
      queryClient.ensureQueryData(
        transactionQueries.listWithDetails({ date: today }),
      ),
      queryClient.ensureQueryData(
        routeAssignmentQueries.byDateWithDetails(today),
      ),
      queryClient.ensureQueryData(reconciliationQueries.list({ date: today })),
    ])
  },
})

function ReconciliationPage() {
  const today = new Date().toISOString().split('T')[0]

  // Fetch data from Convex
  const { data: convexEmployees } = useSuspenseQuery(employeeQueries.list())
  const { data: convexTransactions } = useSuspenseQuery(
    transactionQueries.listWithDetails({ date: today }),
  )
  const { data: convexAssignments } = useSuspenseQuery(
    routeAssignmentQueries.byDateWithDetails(today),
  )
  const { data: convexReconciliations } = useSuspenseQuery(
    reconciliationQueries.list({ date: today }),
  )

  // Mutations
  const verifyReconciliationMutation = useVerifyReconciliationMutation()

  // Build EOD summary
  const eodSummary: EODSummary = useMemo(() => {
    const totalCollected = convexTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    )
    const cashExpected = convexTransactions
      .filter((t) => t.paymentMode === PaymentMode.CASH)
      .reduce((sum, t) => sum + t.amount, 0)
    const digitalPayments = convexTransactions
      .filter((t) => t.paymentMode !== PaymentMode.CASH)
      .reduce((sum, t) => sum + t.amount, 0)

    // Count employees who need verification (those with active assignments today)
    const employeesWithAssignments = new Set(
      convexAssignments
        .filter((a) => a.status === Status.ACTIVE)
        .map((a) => a.employeeId),
    )
    const employeesTotal = employeesWithAssignments.size
    const employeesVerified = convexReconciliations.filter(
      (r) =>
        r.status === ReconciliationStatus.VERIFIED ||
        r.status === ReconciliationStatus.MISMATCH,
    ).length

    return {
      date: today,
      totalCollected,
      cashExpected,
      digitalPayments,
      employeesVerified,
      employeesTotal,
    }
  }, [convexTransactions, convexAssignments, convexReconciliations, today])

  // Build employee settlements list
  const employeeSettlements: Array<EmployeeSettlement> = useMemo(() => {
    // Get all field staff with active assignments today
    const activeAssignments = convexAssignments.filter(
      (a) => a.status === Status.ACTIVE,
    )

    // Build reconciliation lookup map
    const reconciliationMap = new Map(
      convexReconciliations.map((r) => [r.employeeId as string, r]),
    )

    return activeAssignments.map((assignment) => {
      const employee = convexEmployees.find(
        (e) => e._id === assignment.employeeId,
      )
      // Route is already included in assignment from byDateWithDetails
      const routeName = assignment.route?.name ?? 'Unknown Route'
      const reconciliation = reconciliationMap.get(
        assignment.employeeId as string,
      )

      // Calculate expected cash from today's cash transactions for this employee
      const expectedCash = convexTransactions
        .filter(
          (t) =>
            t.employeeId === assignment.employeeId &&
            t.paymentMode === PaymentMode.CASH,
        )
        .reduce((sum, t) => sum + t.amount, 0)

      let status: 'pending' | 'verified' | 'mismatch' | 'closed' =
        ReconciliationStatus.PENDING
      if (reconciliation) {
        status =
          reconciliation.status === ReconciliationStatus.VERIFIED
            ? ReconciliationStatus.VERIFIED
            : ReconciliationStatus.MISMATCH
      }

      return {
        id: assignment._id,
        employeeId: assignment.employeeId,
        employeeName: employee?.name ?? 'Unknown',
        route: routeName,
        expectedCash,
        actualCash: reconciliation?.actualCash ?? null,
        variance: reconciliation?.variance ?? null,
        status,
        verifiedAt: reconciliation?.verifiedAt
          ? new Date(reconciliation.verifiedAt).toISOString()
          : null,
        note: reconciliation?.note ?? null,
      }
    })
  }, [
    convexAssignments,
    convexEmployees,
    convexTransactions,
    convexReconciliations,
  ])

  // Build cash transactions by employee
  const cashTransactionsByEmployee: CashTransactionsByEmployee = useMemo(() => {
    const result: CashTransactionsByEmployee = {}

    const cashTransactions = convexTransactions.filter(
      (t) => t.paymentMode === PaymentMode.CASH,
    )

    cashTransactions.forEach((txn) => {
      const empId = txn.employeeId as string
      if (!(empId in result)) {
        result[empId] = []
      }

      // Shop is already included in listWithDetails response
      result[empId].push({
        id: txn._id,
        timestamp: new Date(txn.timestamp).toISOString(),
        shopName: txn.shop?.name ?? 'Unknown Shop',
        amount: txn.amount,
      })
    })

    // Sort each employee's transactions by timestamp
    Object.keys(result).forEach((empId) => {
      result[empId].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )
    })

    return result
  }, [convexTransactions])

  // Handle match verification
  const handleVerifyMatch = (settlementId: string) => {
    const settlement = employeeSettlements.find((s) => s.id === settlementId)
    if (settlement) {
      verifyReconciliationMutation.mutate({
        employeeId: settlement.employeeId as Id<'employees'>,
        date: today,
        actualCash: settlement.expectedCash,
      })
    }
  }

  // Handle mismatch verification
  const handleVerifyMismatch = (
    settlementId: string,
    data: VerificationFormData,
  ) => {
    const settlement = employeeSettlements.find((s) => s.id === settlementId)
    if (settlement) {
      verifyReconciliationMutation.mutate({
        employeeId: settlement.employeeId as Id<'employees'>,
        date: today,
        actualCash: data.actualCash,
        note: data.note,
      })
    }
  }

  return (
    <EndOfDayReconciliation
      eodSummary={eodSummary}
      employeeSettlements={employeeSettlements}
      cashTransactionsByEmployee={cashTransactionsByEmployee}
      currentDate={today}
      onVerifyMatch={handleVerifyMatch}
      onVerifyMismatch={handleVerifyMismatch}
    />
  )
}
