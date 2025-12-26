'use client'

import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type {FilterOptions, ReconciliationEvent, ReportTransaction, TransactionFilters, TrendData} from '@/components/sections/ReportsAndHistory';
import { useDataStore } from '@/lib/data-store'
import {
  
  
  
  ReportsAndHistory
  
  
} from '@/components/sections/ReportsAndHistory'

export const Route = createFileRoute('/reports')({
  component: ReportsPage,
})

function ReportsPage() {
  const {
    getAllTransactions,
    reconciliations,
    employees,
    shops,
    getEmployee,
    getShop,
  } = useDataStore()

  const [filters, setFilters] = useState<TransactionFilters>({})

  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const allTransactions = getAllTransactions()

  // Transform transactions to include employee and shop names
  const transactions: Array<ReportTransaction> = useMemo(() => {
    return allTransactions
      .map((txn) => {
        const employee = getEmployee(txn.employeeId)
        const shop = getShop(txn.shopId)

        return {
          id: txn.id,
          timestamp: txn.timestamp,
          employeeName: employee?.name || 'Unknown',
          shopName: shop?.name || 'Unknown',
          amount: txn.amount,
          paymentMode: txn.paymentMode,
          reference: txn.reference || null,
          status: txn.status,
        }
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [allTransactions, getEmployee, getShop])

  // Transform reconciliations to include employee names
  const reconciliationEvents: Array<ReconciliationEvent> = useMemo(() => {
    return reconciliations
      .filter((r) => r.verifiedAt) // Only include verified records
      .map((r) => {
        const employee = getEmployee(r.employeeId)

        return {
          id: r.id,
          date: r.date,
          employeeName: employee?.name || 'Unknown',
          expectedCash: r.expectedCash,
          actualCash: r.actualCash,
          variance: r.variance,
          status: r.status as 'verified' | 'mismatch',
          note: r.note || null,
          verifiedAt: r.verifiedAt as string,
        }
      })
      .sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime())
  }, [reconciliations, getEmployee])

  // Build trend data
  const trendData: TrendData = useMemo(() => {
    // Group transactions by date for daily collections
    const dailyMap = new Map<string, number>()
    allTransactions.forEach((txn) => {
      const date = txn.timestamp.split('T')[0]
      dailyMap.set(date, (dailyMap.get(date) || 0) + txn.amount)
    })
    const dailyCollections = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7) // Last 7 days

    // Employee performance
    const employeeMap = new Map<string, number>()
    allTransactions.forEach((txn) => {
      const employee = getEmployee(txn.employeeId)
      const name = employee?.name || 'Unknown'
      employeeMap.set(name, (employeeMap.get(name) || 0) + txn.amount)
    })
    const employeePerformance = Array.from(employeeMap.entries())
      .map(([employeeName, totalCollected]) => ({ employeeName, totalCollected }))
      .sort((a, b) => b.totalCollected - a.totalCollected)

    // Payment mode distribution
    const modeMap = new Map<string, number>()
    let totalAmount = 0
    allTransactions.forEach((txn) => {
      modeMap.set(txn.paymentMode, (modeMap.get(txn.paymentMode) || 0) + txn.amount)
      totalAmount += txn.amount
    })
    const paymentModeDistribution = Array.from(modeMap.entries()).map(([mode, amount]) => ({
      mode,
      amount,
      percentage: totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
    }))

    // Top shops
    const shopMap = new Map<string, number>()
    allTransactions.forEach((txn) => {
      const shop = getShop(txn.shopId)
      const name = shop?.name || 'Unknown'
      shopMap.set(name, (shopMap.get(name) || 0) + txn.amount)
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
  }, [allTransactions, getEmployee, getShop])

  // Build filter options
  const filterOptions: FilterOptions = useMemo(() => {
    const fieldStaff = employees.filter((e) => e.role === 'field_staff')
    return {
      employees: fieldStaff.map((e) => ({ id: e.id, name: e.name })),
      shops: shops.map((s) => ({ id: s.id, name: s.name })),
      paymentModes: ['cash', 'upi', 'cheque'],
    }
  }, [employees, shops])

  // Export to CSV
  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    if (format !== 'csv') {
      alert('Only CSV export is currently supported')
      return
    }

    // Build CSV content
    const headers = ['Date', 'Time', 'Employee', 'Shop', 'Amount', 'Payment Mode', 'Status', 'Reference']
    const rows = transactions.map((txn) => {
      const date = new Date(txn.timestamp)
      return [
        date.toLocaleDateString('en-IN'),
        date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        txn.employeeName,
        txn.shopName,
        txn.amount.toString(),
        txn.paymentMode.toUpperCase(),
        txn.status,
        txn.reference || '',
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
      reconciliationEvents={reconciliationEvents}
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
