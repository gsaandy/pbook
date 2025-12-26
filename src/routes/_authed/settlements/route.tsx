import { useMemo } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { SettlementsView } from './-components/SettlementsView'
import type {
  CashTransactionsByEmployee,
  EODSummary,
  EmployeeSettlement,
  VerificationFormData,
} from './-components/SettlementsView'
import type { Id } from '~/convex/_generated/dataModel'
import {
  employeeQueries,
  routeAssignmentQueries,
  settlementQueries,
  transactionQueries,
  useVerifySettlementMutation,
} from '~/queries'
import { PaymentMode, SettlementStatus, Status } from '~/lib/constants'

export const Route = createFileRoute('/_authed/settlements')({
  component: SettlementsPage,
  loader: async ({ context: { queryClient } }) => {
    const today = new Date().toISOString().split('T')[0]
    await Promise.all([
      queryClient.ensureQueryData(employeeQueries.list()),
      queryClient.ensureQueryData(employeeQueries.current()),
      queryClient.ensureQueryData(
        transactionQueries.listWithDetails({ date: today }),
      ),
      queryClient.ensureQueryData(
        routeAssignmentQueries.byDateWithDetails(today),
      ),
      queryClient.ensureQueryData(
        settlementQueries.list({ status: SettlementStatus.PENDING }),
      ),
    ])
  },
})

function SettlementsPage() {
  const today = new Date().toISOString().split('T')[0]

  // Fetch data from Convex
  const { data: convexEmployees } = useSuspenseQuery(employeeQueries.list())
  const { data: currentEmployee } = useSuspenseQuery(employeeQueries.current())
  const { data: convexTransactions } = useSuspenseQuery(
    transactionQueries.listWithDetails({ date: today }),
  )
  const { data: convexAssignments } = useSuspenseQuery(
    routeAssignmentQueries.byDateWithDetails(today),
  )
  const { data: convexSettlements } = useSuspenseQuery(
    settlementQueries.list({}),
  )

  // Mutations
  const verifySettlementMutation = useVerifySettlementMutation()

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
    const employeesVerified = convexSettlements.filter(
      (s) =>
        s.status === SettlementStatus.RECEIVED ||
        s.status === SettlementStatus.DISCREPANCY,
    ).length

    return {
      date: today,
      totalCollected,
      cashExpected,
      digitalPayments,
      employeesVerified,
      employeesTotal,
    }
  }, [convexTransactions, convexAssignments, convexSettlements, today])

  // Build employee settlements list
  const employeeSettlements: Array<EmployeeSettlement> = useMemo(() => {
    // Get all field staff with active assignments today
    const activeAssignments = convexAssignments.filter(
      (a) => a.status === Status.ACTIVE,
    )

    // Build settlement lookup map by employee
    const settlementMap = new Map(
      convexSettlements.map((s) => [s.employeeId as string, s]),
    )

    return activeAssignments.map((assignment) => {
      const employee = convexEmployees.find(
        (e) => e._id === assignment.employeeId,
      )
      // Route is already included in assignment from byDateWithDetails
      const routeName = assignment.route?.name ?? 'Unknown Route'
      const settlement = settlementMap.get(assignment.employeeId as string)

      // Calculate expected cash from today's cash transactions for this employee
      const expectedCash = convexTransactions
        .filter(
          (t) =>
            t.employeeId === assignment.employeeId &&
            t.paymentMode === PaymentMode.CASH,
        )
        .reduce((sum, t) => sum + t.amount, 0)

      let status: 'pending' | 'received' | 'discrepancy' =
        SettlementStatus.PENDING
      if (settlement) {
        status =
          settlement.status === SettlementStatus.RECEIVED
            ? SettlementStatus.RECEIVED
            : settlement.status === SettlementStatus.DISCREPANCY
              ? SettlementStatus.DISCREPANCY
              : SettlementStatus.PENDING
      }

      return {
        id: assignment._id,
        employeeId: assignment.employeeId,
        employeeName: employee?.name ?? 'Unknown',
        route: routeName,
        expectedCash,
        actualCash: settlement?.receivedAmount ?? null,
        variance: settlement?.variance ?? null,
        status,
        receivedAt: settlement?.receivedAt
          ? new Date(settlement.receivedAt).toISOString()
          : null,
        note: settlement?.note ?? null,
      }
    })
  }, [convexAssignments, convexEmployees, convexTransactions, convexSettlements])

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

  // Get transaction IDs for an employee's cash transactions today
  const getEmployeeCashTransactionIds = (
    employeeId: string,
  ): Array<Id<'transactions'>> => {
    return convexTransactions
      .filter(
        (t) => t.employeeId === employeeId && t.paymentMode === PaymentMode.CASH,
      )
      .map((t) => t._id as Id<'transactions'>)
  }

  // Handle match verification (cash matches expected)
  const handleVerifyMatch = (settlementId: string) => {
    const settlement = employeeSettlements.find((s) => s.id === settlementId)
    if (settlement && currentEmployee) {
      const transactionIds = getEmployeeCashTransactionIds(settlement.employeeId)
      verifySettlementMutation.mutate({
        employeeId: settlement.employeeId as Id<'employees'>,
        transactionIds,
        receivedBy: currentEmployee._id as Id<'employees'>,
      })
    }
  }

  // Handle mismatch verification (cash doesn't match)
  const handleVerifyMismatch = (
    settlementId: string,
    data: VerificationFormData,
  ) => {
    const settlement = employeeSettlements.find((s) => s.id === settlementId)
    if (settlement && currentEmployee) {
      const transactionIds = getEmployeeCashTransactionIds(settlement.employeeId)
      verifySettlementMutation.mutate({
        employeeId: settlement.employeeId as Id<'employees'>,
        transactionIds,
        receivedAmount: data.actualCash,
        receivedBy: currentEmployee._id as Id<'employees'>,
        note: data.note,
      })
    }
  }

  return (
    <SettlementsView
      eodSummary={eodSummary}
      employeeSettlements={employeeSettlements}
      cashTransactionsByEmployee={cashTransactionsByEmployee}
      currentDate={today}
      onVerifyMatch={handleVerifyMatch}
      onVerifyMismatch={handleVerifyMismatch}
    />
  )
}
