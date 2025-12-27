import { useMemo, useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { ReportsAndHistory } from './-components/ReportsAndHistory'
import type {
  FilterOptions,
  HandoverEvent,
  ReportTransaction,
  TransactionFilters,
  TrendData,
} from './-components/ReportsAndHistory'
import { EmployeeRole } from '~/lib/constants'
import { employeeQueries, shopQueries, transactionQueries } from '~/queries'

export const Route = createFileRoute('/_authed/history')({
  component: ReportsPage,
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
      queryClient.ensureQueryData(transactionQueries.listWithDetails({})),
      queryClient.ensureQueryData(employeeQueries.list()),
      queryClient.ensureQueryData(shopQueries.list()),
    ])
  },
})

function ReportsPage() {
  // Fetch data from Convex
  const { data: convexTransactions } = useSuspenseQuery(
    transactionQueries.listWithDetails({}),
  )
  const { data: convexEmployees } = useSuspenseQuery(employeeQueries.list())
  const { data: convexShops } = useSuspenseQuery(shopQueries.list())

  const [filters, setFilters] = useState<TransactionFilters>({})

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  // Transform transactions to include employee and shop names
  const transactions: Array<ReportTransaction> = useMemo(() => {
    return convexTransactions
      .map((txn) => {
        // Employee and shop are already included in listWithDetails
        return {
          id: txn._id,
          timestamp: new Date(txn.timestamp).toISOString(),
          employeeName: txn.employee?.name ?? 'Unknown',
          shopName: txn.shop?.name ?? 'Unknown',
          amount: txn.amount,
          paymentMode: txn.paymentMode,
          isVerified: txn.isVerified,
        }
      })
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
  }, [convexTransactions])

  // Build handover events from verified transactions grouped by verifiedAt
  const handoverEvents: Array<HandoverEvent> = useMemo(() => {
    // Group verified cash transactions by employee and verifiedAt timestamp (rounded to minute)
    const verifiedCashTxns = convexTransactions.filter(
      (t) => t.isVerified && t.verifiedAt && t.paymentMode === 'cash',
    )

    // Group by employee + verifiedAt (rounded to minute for grouping)
    const groupMap = new Map<
      string,
      {
        employeeName: string
        amount: number
        count: number
        verifiedAt: number
      }
    >()

    for (const txn of verifiedCashTxns) {
      // Round to minute for grouping
      const roundedTime = Math.floor((txn.verifiedAt ?? 0) / 60000) * 60000
      const key = `${txn.employeeId}-${roundedTime}`
      const existing = groupMap.get(key)
      if (existing) {
        existing.amount += txn.amount
        existing.count += 1
      } else {
        groupMap.set(key, {
          employeeName: txn.employee?.name ?? 'Unknown',
          amount: txn.amount,
          count: 1,
          verifiedAt: txn.verifiedAt ?? 0,
        })
      }
    }

    return Array.from(groupMap.entries())
      .map(([key, data]) => ({
        id: key,
        employeeName: data.employeeName,
        cashAmount: data.amount,
        transactionCount: data.count,
        verifiedAt: new Date(data.verifiedAt).toISOString(),
      }))
      .sort(
        (a, b) =>
          new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime(),
      )
  }, [convexTransactions])

  // Build trend data
  const trendData: TrendData = useMemo(() => {
    // Group transactions by date for daily collections
    const dailyMap = new Map<string, number>()
    convexTransactions.forEach((txn) => {
      const date = new Date(txn.timestamp).toISOString().split('T')[0]
      dailyMap.set(date, (dailyMap.get(date) ?? 0) + txn.amount)
    })
    const dailyCollections = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7) // Last 7 days

    // Employee performance - employee is already included in listWithDetails
    const employeeMap = new Map<string, number>()
    convexTransactions.forEach((txn) => {
      const name = txn.employee?.name ?? 'Unknown'
      employeeMap.set(name, (employeeMap.get(name) ?? 0) + txn.amount)
    })
    const employeePerformance = Array.from(employeeMap.entries())
      .map(([employeeName, totalCollected]) => ({
        employeeName,
        totalCollected,
      }))
      .sort((a, b) => b.totalCollected - a.totalCollected)

    // Payment mode distribution
    const modeMap = new Map<string, number>()
    let totalAmount = 0
    convexTransactions.forEach((txn) => {
      modeMap.set(
        txn.paymentMode,
        (modeMap.get(txn.paymentMode) ?? 0) + txn.amount,
      )
      totalAmount += txn.amount
    })
    const paymentModeDistribution = Array.from(modeMap.entries()).map(
      ([mode, amount]) => ({
        mode,
        amount,
        percentage:
          totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
      }),
    )

    // Top shops - shop is already included in listWithDetails
    const shopMap = new Map<string, number>()
    convexTransactions.forEach((txn) => {
      const name = txn.shop?.name ?? 'Unknown'
      shopMap.set(name, (shopMap.get(name) ?? 0) + txn.amount)
    })
    const topShops = Array.from(shopMap.entries())
      .map(([shopName, totalCollected]) => ({ shopName, totalCollected }))
      .sort((a, b) => b.totalCollected - a.totalCollected)
      .slice(0, 5) // Top 5

    return {
      dailyCollections,
      employeePerformance,
      paymentModeDistribution,
      topShops,
    }
  }, [convexTransactions])

  // Build filter options
  const filterOptions: FilterOptions = useMemo(() => {
    // Filter field staff
    const fieldStaff = convexEmployees.filter((e) => e.role === 'field_staff')

    return {
      employees: fieldStaff.map((e) => ({ id: e._id, name: e.name })),
      shops: convexShops.map((s) => ({ id: s._id, name: s.name })),
      paymentModes: ['cash', 'upi', 'cheque'],
    }
  }, [convexEmployees, convexShops])

  // Export to CSV
  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    if (format !== 'csv') {
      alert('Only CSV export is currently supported')
      return
    }

    // Build CSV content
    const headers = [
      'Date',
      'Time',
      'Employee',
      'Shop',
      'Amount',
      'Payment Mode',
      'Status',
    ]
    const rows = transactions.map((txn) => {
      const date = new Date(txn.timestamp)
      return [
        date.toLocaleDateString('en-IN'),
        date.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        txn.employeeName,
        txn.shopName,
        txn.amount.toString(),
        txn.paymentMode.toUpperCase(),
        txn.isVerified ? 'In Office' : 'In Bag',
      ]
    })

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `psbook-transactions-${today}.csv`
    link.click()
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  return (
    <ReportsAndHistory
      transactions={transactions}
      handoverEvents={handoverEvents}
      trendData={trendData}
      filterOptions={filterOptions}
      currentFilters={filters}
      dateRange={{ start: sevenDaysAgo, end: today }}
      onFilterChange={setFilters}
      onExportTransactions={handleExport}
      onClearFilters={handleClearFilters}
    />
  )
}
