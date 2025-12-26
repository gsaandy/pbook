import { CheckCircle, Clock, User, Wallet } from 'lucide-react'

export interface PendingHandover {
  employeeId: string
  employeeName: string
  totalAmount: number
  cashAmount: number
  transactionCount: number
}

export interface VerifiedTransaction {
  _id: string
  amount: number
  verifiedAt?: number
  employee?: { name: string } | null
  shop?: { name: string } | null
}

export interface HandoversViewProps {
  pendingHandovers: Array<PendingHandover>
  recentVerified: Array<VerifiedTransaction>
  onVerifyHandover: (employeeId: string) => void
  isVerifying: boolean
}

export function HandoversView({
  pendingHandovers,
  recentVerified,
  onVerifyHandover,
  isVerifying,
}: HandoversViewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  }

  const totalPendingCash = pendingHandovers.reduce(
    (sum, h) => sum + h.cashAmount,
    0,
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Cash Handovers
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Verify cash collected by field staff
          </p>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <Wallet className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Total Cash Pending
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(totalPendingCash)}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Employees
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {pendingHandovers.length}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Handovers */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Pending Handovers
            </h2>
          </div>

          {pendingHandovers.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400">
                All cash has been handed over
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {pendingHandovers.map((handover) => (
                <div
                  key={handover.employeeId}
                  className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {handover.employeeName}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {handover.transactionCount} transactions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900 dark:text-white">
                        {formatCurrency(handover.cashAmount)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Cash in bag
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => onVerifyHandover(handover.employeeId)}
                      disabled={isVerifying}
                      className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 dark:bg-emerald-500 rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify Handover'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Verified */}
        {recentVerified.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Recently Verified
              </h2>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentVerified.map((txn) => (
                <div
                  key={txn._id}
                  className="px-6 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {txn.employee?.name ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {txn.shop?.name ?? 'Unknown Shop'} •{' '}
                      {txn.verifiedAt
                        ? `${formatDate(txn.verifiedAt)} ${formatTime(txn.verifiedAt)}`
                        : 'N/A'}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(txn.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
