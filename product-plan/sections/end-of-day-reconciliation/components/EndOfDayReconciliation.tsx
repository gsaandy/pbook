'use client'

import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  IndianRupee,
  Wallet,
} from 'lucide-react'
import type {
  EndOfDayReconciliationProps,
  VerificationFormData,
} from '@/../product/sections/end-of-day-reconciliation/types'

export function EndOfDayReconciliation({
  eodSummary,
  employeeSettlements,
  cashTransactionsByEmployee,
  currentDate,
  onDateChange,
  onOpenVerification,
  onVerifyMatch,
  onVerifyMismatch,
  onGenerateReport,
}: EndOfDayReconciliationProps) {
  const [verifyingEmployee, setVerifyingEmployee] = useState<string | null>(
    null,
  )
  const [showMismatchForm, setShowMismatchForm] = useState(false)
  const [actualCash, setActualCash] = useState('')
  const [note, setNote] = useState('')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const settlement = verifyingEmployee
    ? employeeSettlements.find((s) => s.employeeId === verifyingEmployee)
    : null

  const transactions = verifyingEmployee
    ? cashTransactionsByEmployee[verifyingEmployee] || []
    : []

  const handleMatchConfirm = () => {
    if (settlement) {
      onVerifyMatch?.(settlement.id)
      setVerifyingEmployee(null)
    }
  }

  const handleMismatchSubmit = () => {
    if (!settlement || !actualCash || !note) return

    const formData: VerificationFormData = {
      actualCash: parseFloat(actualCash),
      note,
    }

    onVerifyMismatch?.(settlement.id, formData)
    setVerifyingEmployee(null)
    setShowMismatchForm(false)
    setActualCash('')
    setNote('')
  }

  const variance =
    actualCash && settlement
      ? parseFloat(actualCash) - settlement.expectedCash
      : 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        )
      case 'mismatch':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            <AlertCircle className="w-3.5 h-3.5" />
            Mismatch
          </span>
        )
      case 'closed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
            Closed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
            Pending
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Verification Modal */}
      {verifyingEmployee && settlement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Verify Cash Handover
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {settlement.employeeName} • {settlement.route}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setVerifyingEmployee(null)
                    setShowMismatchForm(false)
                    setActualCash('')
                    setNote('')
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              </div>
            </div>

            {!showMismatchForm ? (
              <>
                <div className="p-6 space-y-6">
                  {/* Expected Cash */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 text-center">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                      Expected Cash in Bag
                    </p>
                    <p className="text-4xl font-bold text-indigo-700 dark:text-indigo-300">
                      {formatCurrency(settlement.expectedCash)}
                    </p>
                  </div>

                  {/* Transaction Log */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                      Cash Transaction Log ({transactions.length} transactions)
                    </h3>
                    <div className="max-h-64 overflow-y-auto space-y-2 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                      {transactions.map((txn) => (
                        <div
                          key={txn.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {txn.shopName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(txn.timestamp).toLocaleTimeString(
                                'en-IN',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </p>
                          </div>
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(txn.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-slate-100 dark:bg-slate-700/50 rounded-lg p-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      <strong>Step 1:</strong> Count the physical cash given by{' '}
                      {settlement.employeeName}.
                    </p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                      <strong>Step 2:</strong> Does it match the expected
                      amount?
                    </p>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3">
                  <button
                    onClick={() => setShowMismatchForm(true)}
                    className="flex-1 px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    No, Mismatch
                  </button>
                  <button
                    onClick={handleMatchConfirm}
                    className="flex-1 px-6 py-4 text-sm font-semibold text-white bg-emerald-600 dark:bg-emerald-500 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors"
                  >
                    Yes, Matches
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Cash Mismatch Detected</strong>
                      <br />
                      Please enter the actual cash amount received and provide
                      an explanation.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Actual Cash Received
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-lg">
                        ₹
                      </span>
                      <input
                        type="number"
                        value={actualCash}
                        onChange={(e) => setActualCash(e.target.value)}
                        placeholder="0"
                        className="w-full pl-10 pr-4 py-4 text-2xl font-semibold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {actualCash && (
                    <div
                      className={`rounded-lg p-4 ${
                        variance === 0
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                          : variance > 0
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">Variance</p>
                      <p
                        className={`text-2xl font-bold ${
                          variance === 0
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : variance > 0
                              ? 'text-emerald-700 dark:text-emerald-300'
                              : 'text-red-700 dark:text-red-300'
                        }`}
                      >
                        {variance > 0 ? '+' : ''}
                        {formatCurrency(Math.abs(variance))}
                      </p>
                      <p className="text-xs mt-1">
                        {variance === 0
                          ? 'Perfect match'
                          : variance > 0
                            ? 'Overage (extra cash received)'
                            : 'Shortage (less cash received)'}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Explanation <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Explain the reason for the mismatch..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex gap-3">
                  <button
                    onClick={() => {
                      setShowMismatchForm(false)
                      setActualCash('')
                      setNote('')
                    }}
                    className="flex-1 px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleMismatchSubmit}
                    disabled={!actualCash || !note}
                    className="flex-1 px-6 py-4 text-sm font-semibold text-white bg-indigo-600 dark:bg-indigo-500 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Save & Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              End-of-Day Reconciliation
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              {new Date(eodSummary.date).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          {onGenerateReport && (
            <button
              onClick={() => onGenerateReport('pdf')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
            >
              <Download className="w-4 h-4" />
              Generate Report
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {eodSummary.employeesTotal > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Reconciliation Progress
              </p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {eodSummary.employeesVerified} of {eodSummary.employeesTotal}{' '}
                verified
              </p>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all"
                style={{
                  width: `${
                    (eodSummary.employeesVerified / eodSummary.employeesTotal) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Collected
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(eodSummary.totalCollected)}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Cash Expected
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {formatCurrency(eodSummary.cashExpected)}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Digital Payments
                </p>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
                  {formatCurrency(eodSummary.digitalPayments)}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Settlements */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Employee Settlements
            </h2>
          </div>

          {employeeSettlements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 dark:text-slate-400">
                No field staff worked today
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Route
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Expected Cash
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {employeeSettlements.map((settlementItem) => (
                      <tr
                        key={settlementItem.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {settlementItem.employeeName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {settlementItem.route}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(settlementItem.expectedCash)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(settlementItem.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {settlementItem.status === 'pending' ? (
                            <button
                              onClick={() =>
                                setVerifyingEmployee(settlementItem.employeeId)
                              }
                              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                            >
                              Verify
                            </button>
                          ) : (
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {settlementItem.verifiedAt &&
                                new Date(
                                  settlementItem.verifiedAt,
                                ).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                {employeeSettlements.map((settlementItem) => (
                  <div key={settlementItem.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {settlementItem.employeeName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                          {settlementItem.route}
                        </p>
                      </div>
                      {getStatusBadge(settlementItem.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Expected Cash
                        </p>
                        <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(settlementItem.expectedCash)}
                        </p>
                      </div>
                      {settlementItem.status === 'pending' && (
                        <button
                          onClick={() =>
                            setVerifyingEmployee(settlementItem.employeeId)
                          }
                          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                        >
                          Verify
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
