import { useEffect, useMemo, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboard } from './-components/AdminDashboard'
import type {
  DashboardTransaction,
  EmployeeStatus,
  EmployeeTransactions,
  Summary,
} from './-components/AdminDashboard'
import { employeeQueries, transactionQueries } from '~/queries'
import { EmployeeRole, PaymentMode } from '~/lib/constants'

export const Route = createFileRoute('/_authed/home')({
  component: DashboardPage,
  loader: async ({ context: { queryClient } }) => {
    const today = new Date().toISOString().split('T')[0]
    await Promise.all([
      queryClient.ensureQueryData(employeeQueries.list()),
      queryClient.ensureQueryData(
        transactionQueries.listWithDetails({ date: today }),
      ),
    ])
  },
})

function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [, setRefreshKey] = useState(0)

  const today = new Date().toISOString().split('T')[0]

  // Fetch data from Convex
  const { data: convexEmployees } = useSuspenseQuery(employeeQueries.list())
  const { data: convexTransactions } = useSuspenseQuery(
    transactionQueries.listWithDetails({ date: today }),
  )

  // Calculate summary from transactions
  const summary: Summary = useMemo(() => {
    const totalCollected = convexTransactions.reduce(
      (sum, t) => sum + t.amount,
      0,
    )
    const cashInHand = convexTransactions
      .filter((t) => t.paymentMode === PaymentMode.CASH)
      .reduce((sum, t) => sum + t.amount, 0)
    const digitalPayments = convexTransactions
      .filter((t) => t.paymentMode !== PaymentMode.CASH)
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalCollected,
      cashInHand,
      digitalPayments,
      lastUpdated: new Date().toISOString(),
    }
  }, [convexTransactions])

  // Build employee status
  const employeeStatus: Array<EmployeeStatus> = useMemo(() => {
    // Filter field staff
    const fieldStaff = convexEmployees.filter(
      (e) => e.role === EmployeeRole.FIELD_STAFF,
    )

    return fieldStaff.map((emp) => {
      // Filter transactions for this employee
      const empTransactions = convexTransactions.filter(
        (t) => t.employeeId === emp._id,
      )
      const sortedTransactions = [...empTransactions].sort(
        (a, b) => b.timestamp - a.timestamp,
      )
      const lastTransaction =
        sortedTransactions.length > 0 ? sortedTransactions[0] : undefined

      // Calculate cash in bag (unverified cash transactions)
      const cashInHand = empTransactions
        .filter((t) => t.paymentMode === PaymentMode.CASH && !t.isVerified)
        .reduce((sum, t) => sum + t.amount, 0)

      // Determine status based on last transaction time
      let status: 'active' | 'delayed' | 'idle' = 'idle'
      if (lastTransaction !== undefined) {
        const lastActivityTime = lastTransaction.timestamp
        const now = Date.now()
        const hoursSinceLast = (now - lastActivityTime) / (1000 * 60 * 60)

        if (hoursSinceLast < 1) {
          status = 'active'
        } else if (hoursSinceLast < 3) {
          status = 'delayed'
        }
      }

      return {
        id: emp._id,
        name: emp.name,
        route: null,
        collectionsCount: empTransactions.length,
        cashInHand,
        lastActivity:
          lastTransaction !== undefined
            ? new Date(lastTransaction.timestamp).toISOString()
            : null,
        status,
      }
    })
  }, [convexEmployees, convexTransactions])

  // Build employee transactions map
  const employeeTransactions: EmployeeTransactions = useMemo(() => {
    const result: EmployeeTransactions = {}

    convexTransactions.forEach((txn) => {
      const empId = txn.employeeId as string
      if (!(empId in result)) {
        result[empId] = []
      }

      // Shop is already included in listWithDetails response
      const dashboardTxn: DashboardTransaction = {
        id: txn._id,
        timestamp: new Date(txn.timestamp).toISOString(),
        shopName: txn.shop?.name ?? 'Unknown Shop',
        amount: txn.amount,
        paymentMode: txn.paymentMode,
        isVerified: txn.isVerified,
      }

      result[empId].push(dashboardTxn)
    })

    // Sort each employee's transactions by timestamp (newest first)
    Object.keys(result).forEach((empId) => {
      result[empId].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
    })

    return result
  }, [convexTransactions])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((k) => k + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshKey((k) => k + 1)
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <AdminDashboard
      summary={summary}
      employeeStatus={employeeStatus}
      employeeTransactions={employeeTransactions}
      currentDate={today}
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
    />
  )
}
