'use client'

import { useState } from 'react'
import { Search, Filter, Download, Calendar, TrendingUp, Users, Store, CreditCard } from 'lucide-react'
import type { ReportsAndHistoryProps } from '@/../product/sections/reports-and-history/types'

export function ReportsAndHistory({
  transactions,
  reconciliationEvents,
  trendData,
  filterOptions,
  currentFilters,
  dateRange,
  onFilterChange,
  onDateRangeChange,
  onViewTransaction,
  onGenerateReport,
  onPreviewReport,
  onExportTransactions,
  onClearFilters,
  onViewReconciliation,
}: ReportsAndHistoryProps) {
  const [activeView, setActiveView] = useState<'transactions' | 'reconciliation' | 'analytics'>('transactions')
  const [searchQuery, setSearchQuery] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPaymentModeColor = (mode: string) => {
    switch (mode) {
      case 'cash':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
      case 'upi':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
      case 'cheque':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
      case 'adjusted':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
      case 'reversed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    }
  }

  const filteredTransactions = transactions.filter(
    (txn) =>
      txn.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Reports & History
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Transaction history and analytics
            </p>
          </div>
          {onExportTransactions && (
            <button
              onClick={() => onExportTransactions('csv')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-6">
          <button
            onClick={() => setActiveView('transactions')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeView === 'transactions'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setActiveView('reconciliation')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeView === 'reconciliation'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Audit Trail ({reconciliationEvents.length})
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
              activeView === 'analytics'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Analytics
          </button>
        </div>

        {/* Transactions View */}
        {activeView === 'transactions' && (
          <>
            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search transactions by shop, employee, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
              />
            </div>

            {/* Transaction Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600 dark:text-slate-400">
                    No transactions found for selected filters
                  </p>
                  {onClearFilters && (
                    <button
                      onClick={onClearFilters}
                      className="mt-4 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Date & Time
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Shop
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Payment Mode
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredTransactions.map((txn) => (
                          <tr
                            key={txn.id}
                            onClick={() => onViewTransaction?.(txn.id)}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-900 dark:text-white">
                                {formatDate(txn.timestamp)}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                {formatTime(txn.timestamp)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {txn.employeeName}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-900 dark:text-white">
                                {txn.shopName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(txn.amount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentModeColor(
                                  txn.paymentMode
                                )}`}
                              >
                                {txn.paymentMode.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  txn.status
                                )}`}
                              >
                                {txn.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredTransactions.map((txn) => (
                      <div
                        key={txn.id}
                        onClick={() => onViewTransaction?.(txn.id)}
                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {txn.shopName}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                              {txn.employeeName}
                            </p>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(txn.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {formatDate(txn.timestamp)} • {formatTime(txn.timestamp)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentModeColor(
                              txn.paymentMode
                            )}`}
                          >
                            {txn.paymentMode.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              txn.status
                            )}`}
                          >
                            {txn.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Reconciliation View */}
        {activeView === 'reconciliation' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                EOD Reconciliation History
              </h2>
            </div>

            {reconciliationEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400">
                  No reconciliation events yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {reconciliationEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => onViewReconciliation?.(event.id)}
                    className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {event.employeeName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                          {formatDate(event.date)} • Verified at{' '}
                          {formatTime(event.verifiedAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          event.status === 'verified'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}
                      >
                        {event.status === 'verified' ? 'Verified' : 'Mismatch'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Expected Cash
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                          {formatCurrency(event.expectedCash)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Actual Cash
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                          {formatCurrency(event.actualCash)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Variance
                        </p>
                        <p
                          className={`text-sm font-semibold mt-0.5 ${
                            event.variance === 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : event.variance > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {event.variance > 0 ? '+' : ''}
                          {formatCurrency(Math.abs(event.variance))}
                        </p>
                      </div>
                    </div>

                    {event.note && (
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                          Note:
                        </p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                          {event.note}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    7-Day Trend
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(
                    trendData.dailyCollections[trendData.dailyCollections.length - 1]
                      ?.amount || 0
                  )}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  +15% from last week
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Top Collector
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">
                  {trendData.employeePerformance[0]?.employeeName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatCurrency(trendData.employeePerformance[0]?.totalCollected || 0)}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Top Shop
                  </p>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                  {trendData.topShops[0]?.shopName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {formatCurrency(trendData.topShops[0]?.totalCollected || 0)}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Cash %
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {trendData.paymentModeDistribution[0]?.percentage || 0}%
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  of total collections
                </p>
              </div>
            </div>

            {/* Employee Performance */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Employee Performance
              </h3>
              <div className="space-y-3">
                {trendData.employeePerformance.map((emp, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {emp.employeeName}
                      </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(emp.totalCollected)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (emp.totalCollected /
                              Math.max(
                                ...trendData.employeePerformance.map((e) => e.totalCollected)
                              )) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Shops */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Top Collecting Shops
              </h3>
              <div className="space-y-3">
                {trendData.topShops.map((shop, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {shop.shopName}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(shop.totalCollected)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
