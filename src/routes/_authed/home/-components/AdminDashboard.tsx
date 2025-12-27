import { useState } from 'react'
import { CreditCard, IndianRupee, RefreshCw, Wallet } from 'lucide-react'

export interface Summary {
  totalCollected: number
  cashInHand: number
  digitalPayments: number
  lastUpdated: string
}

export interface EmployeeStatus {
  id: string
  name: string
  route: string | null
  collectionsCount: number
  cashInHand: number
  lastActivity: string | null
  status: 'active' | 'delayed' | 'idle'
}

export interface DashboardTransaction {
  id: string
  timestamp: string
  shopName: string
  amount: number
  paymentMode: 'cash' | 'upi' | 'cheque'
  isVerified: boolean
}

export interface EmployeeTransactions {
  [employeeId: string]: Array<DashboardTransaction>
}

export interface AdminDashboardProps {
  summary: Summary
  employeeStatus: Array<EmployeeStatus>
  employeeTransactions: EmployeeTransactions
  currentDate: string
  isRefreshing?: boolean
  onRefresh?: () => void
}

export function AdminDashboard({
  summary,
  employeeStatus,
  employeeTransactions,
  isRefreshing,
  onRefresh,
}: AdminDashboardProps) {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getRelativeTime = (timestamp: string | null) => {
    if (!timestamp) return 'No activity'
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now.getTime() - then.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    return `${Math.floor(diffHours / 24)}d ago`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
      case 'delayed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 'idle':
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
      default:
        return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
    }
  }

  const employee = selectedEmployee
    ? employeeStatus.find((e) => e.id === selectedEmployee)
    : null

  const transactions = selectedEmployee
    ? (employeeTransactions[selectedEmployee] ?? [])
    : []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Employee Detail Modal */}
      {selectedEmployee && employee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {employee.name}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {employee.route || 'No route assigned'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Collections Today
                  </p>
                  <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
                    {employee.collectionsCount}
                  </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Cash in Hand
                  </p>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                    {formatCurrency(employee.cashInHand)}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                Transaction Log
              </h3>
              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                    No transactions yet
                  </p>
                ) : (
                  transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center">
                        {txn.paymentMode === 'cash' ? (
                          <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">
                              {txn.shopName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {new Date(txn.timestamp).toLocaleTimeString(
                                'en-IN',
                                {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                },
                              )}
                            </p>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(txn.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              txn.paymentMode === 'cash'
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            }`}
                          >
                            {txn.paymentMode.toUpperCase()}
                          </span>
                          {txn.reference && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {txn.reference}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Real-time collection monitoring
            </p>
          </div>
          <div className="flex gap-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                />
                Refresh
              </button>
            )}
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Collected
                </p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                  {formatCurrency(summary.totalCollected)}
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
                  Cash in Hand
                </p>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                  {formatCurrency(summary.cashInHand)}
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
                  {formatCurrency(summary.digitalPayments)}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Employee Status Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Employee Status
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Live collection activity across all field staff
            </p>
          </div>

          {employeeStatus.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                No collections logged today yet
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
                        Collections
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Cash in Hand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Last Activity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {employeeStatus.map((emp) => (
                      <tr
                        key={emp.id}
                        onClick={() => setSelectedEmployee(emp.id)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {emp.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {emp.route || '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {emp.collectionsCount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(emp.cashInHand)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {getRelativeTime(emp.lastActivity)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              emp.status,
                            )}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                emp.status === 'active'
                                  ? 'bg-emerald-600 dark:bg-emerald-400'
                                  : emp.status === 'delayed'
                                    ? 'bg-red-600 dark:bg-red-400'
                                    : 'bg-slate-400'
                              }`}
                            />
                            {emp.status === 'active'
                              ? 'Active'
                              : emp.status === 'delayed'
                                ? 'Delayed'
                                : 'Idle'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                {employeeStatus.map((emp) => (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp.id)}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {emp.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                          {emp.route || 'No route'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          emp.status,
                        )}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            emp.status === 'active'
                              ? 'bg-emerald-600'
                              : emp.status === 'delayed'
                                ? 'bg-red-600'
                                : 'bg-slate-400'
                          }`}
                        />
                        {emp.status === 'active'
                          ? 'Active'
                          : emp.status === 'delayed'
                            ? 'Delayed'
                            : 'Idle'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          Collections
                        </p>
                        <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                          {emp.collectionsCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          Cash in Hand
                        </p>
                        <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {formatCurrency(emp.cashInHand)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs">
                          Last Activity
                        </p>
                        <p className="font-medium text-slate-600 dark:text-slate-400 mt-0.5 text-xs">
                          {getRelativeTime(emp.lastActivity)}
                        </p>
                      </div>
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
