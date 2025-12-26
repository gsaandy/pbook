import { useEffect, useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type {DashboardTransaction, EmployeeStatus, EmployeeTransactions, Summary} from '~/components/sections/AdminDashboard';
import { useDataStore } from '~/lib/data-store'
import { AdminDashboard     } from '~/components/sections/AdminDashboard'

export const Route = createFileRoute('/_authed/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [, setRefreshKey] = useState(0)

  const {
    employees,
    getTodayTransactions,
    getTodayAssignments,
    getEmployeeCashInHand,
    getRoute,
    getShop,
  } = useDataStore()

  const today = new Date().toISOString().split('T')[0]
  const todayTransactions = getTodayTransactions()
  const todayAssignments = getTodayAssignments()

  // Calculate summary
  const summary: Summary = useMemo(() => {
    const totalCollected = todayTransactions.reduce((sum, t) => sum + t.amount, 0)
    const cashInHand = todayTransactions
      .filter((t) => t.paymentMode === 'cash')
      .reduce((sum, t) => sum + t.amount, 0)
    const digitalPayments = todayTransactions
      .filter((t) => t.paymentMode !== 'cash')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      totalCollected,
      cashInHand,
      digitalPayments,
      lastUpdated: new Date().toISOString(),
    }
  }, [todayTransactions])

  // Build employee status
  const employeeStatus: Array<EmployeeStatus> = useMemo(() => {
    const fieldStaff = employees.filter((e) => e.role === 'field_staff' && e.status === 'active')

    return fieldStaff.map((emp) => {
      const assignment = todayAssignments.find((a) => a.employeeId === emp.id && a.status === 'active')
      const route = assignment ? getRoute(assignment.routeId) : null
      const empTransactions = todayTransactions.filter((t) => t.employeeId === emp.id)
      const sortedTransactions = [...empTransactions].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      const lastTransaction = sortedTransactions.length > 0 ? sortedTransactions[0] : undefined

      const cashInHand = getEmployeeCashInHand(emp.id)

      // Determine status
      let status: 'active' | 'delayed' | 'idle' = 'idle'
      if (lastTransaction !== undefined) {
        const lastActivityTime = new Date(lastTransaction.timestamp).getTime()
        const now = Date.now()
        const hoursSinceLast = (now - lastActivityTime) / (1000 * 60 * 60)

        if (hoursSinceLast < 1) {
          status = 'active'
        } else if (hoursSinceLast < 3) {
          status = 'delayed'
        }
      }

      return {
        id: emp.id,
        name: emp.name,
        route: route?.name ?? null,
        collectionsCount: empTransactions.length,
        cashInHand,
        lastActivity: lastTransaction !== undefined ? lastTransaction.timestamp : null,
        status,
      }
    })
  }, [employees, todayAssignments, todayTransactions, getRoute, getEmployeeCashInHand])

  // Build employee transactions map
  const employeeTransactions: EmployeeTransactions = useMemo(() => {
    const result: EmployeeTransactions = {}

    todayTransactions.forEach((txn) => {
      if (!(txn.employeeId in result)) {
        result[txn.employeeId] = []
      }

      const shop = getShop(txn.shopId)

      const dashboardTxn: DashboardTransaction = {
        id: txn.id,
        timestamp: txn.timestamp,
        shopName: shop?.name ?? 'Unknown Shop',
        amount: txn.amount,
        paymentMode: txn.paymentMode,
        reference: txn.reference ?? null,
      }

      result[txn.employeeId].push(dashboardTxn)
    })

    // Sort each employee's transactions by timestamp (newest first)
    Object.keys(result).forEach((empId) => {
      result[empId].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    })

    return result
  }, [todayTransactions, getShop])

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
