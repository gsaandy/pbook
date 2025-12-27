import { useState } from 'react'
import {
  Banknote,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  Smartphone,
  Wallet,
} from 'lucide-react'

interface Shop {
  _id: string
  name: string
  retailerUniqueCode: string
  zone: string
  currentBalance: number
}

interface Transaction {
  _id: string
  amount: number
  timestamp: number
  paymentMode: 'cash' | 'upi' | 'cheque'
  isVerified: boolean
  shop?: { name: string } | null
}

const ITEMS_PER_PAGE = 20

export interface FieldStaffCollectionsProps {
  currentEmployee: {
    _id: string
    name: string
  }
  shops: Array<Shop>
  transactions: Array<Transaction>
  today: string
  onCollectCash: (data: {
    shopId: string
    amount: number
    paymentMode: 'cash' | 'upi' | 'cheque'
  }) => void
  isCollecting: boolean
}

export function FieldStaffCollections({
  currentEmployee,
  shops,
  transactions,
  today,
  onCollectCash,
  isCollecting,
}: FieldStaffCollectionsProps) {
  const [selectedShop, setSelectedShop] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'cheque'>(
    'cash',
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Calculate cash in bag (unverified cash collections today)
  const todayTransactions = transactions.filter((t) => {
    const txnDate = new Date(t.timestamp).toISOString().split('T')[0]
    return txnDate === today
  })

  const cashInBag = todayTransactions
    .filter((t) => t.paymentMode === 'cash' && !t.isVerified)
    .reduce((sum, t) => sum + t.amount, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case 'cash':
        return Banknote
      case 'upi':
        return Smartphone
      case 'cheque':
        return FileText
      default:
        return Banknote
    }
  }

  const handleSubmitCollection = () => {
    if (!selectedShop || !amount || parseFloat(amount) <= 0 || isCollecting)
      return

    onCollectCash({
      shopId: selectedShop,
      amount: parseFloat(amount),
      paymentMode,
    })

    // Reset form
    setSelectedShop(null)
    setAmount('')
    setPaymentMode('cash')
  }

  const shop = selectedShop ? shops.find((s) => s._id === selectedShop) : null

  // Filter shops by search query
  const filteredShops = shops.filter((s) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      s.name.toLowerCase().includes(query) ||
      s.retailerUniqueCode.toLowerCase().includes(query) ||
      s.zone.toLowerCase().includes(query)
    )
  })

  // Sort shops by balance (highest first)
  const sortedShops = [...filteredShops].sort(
    (a, b) => b.currentBalance - a.currentBalance,
  )

  // Pagination
  const totalPages = Math.ceil(sortedShops.length / ITEMS_PER_PAGE)
  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const paymentModes = [
    { id: 'cash' as const, label: 'Cash' },
    { id: 'upi' as const, label: 'UPI' },
    { id: 'cheque' as const, label: 'Cheque' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Collection Form - Bottom Sheet Style */}
      {selectedShop && shop && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {shop.retailerUniqueCode}
                  </p>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {shop.name}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {shop.zone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedShop(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Current Balance:{' '}
                <span
                  className={`font-semibold ${
                    shop.currentBalance > 10000
                      ? 'text-red-600 dark:text-red-400'
                      : shop.currentBalance > 0
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatCurrency(shop.currentBalance)}
                </span>
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Amount Collected
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-lg">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-4 text-2xl font-semibold bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Payment Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {paymentModes.map((mode) => {
                    const Icon = getPaymentModeIcon(mode.id)
                    const isSelected = paymentMode === mode.id
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setPaymentMode(mode.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <Icon
                          className={`w-6 h-6 ${
                            isSelected
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isSelected
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {mode.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6 flex gap-3">
              <button
                onClick={() => setSelectedShop(null)}
                className="flex-1 px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCollection}
                disabled={!amount || parseFloat(amount) <= 0 || isCollecting}
                className="flex-1 px-6 py-4 text-sm font-semibold text-white bg-emerald-600 dark:bg-emerald-500 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCollecting ? 'Saving...' : 'Confirm Collection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto pb-6">
        {/* Cash in Bag Banner */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 dark:from-indigo-500 dark:to-indigo-600 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium mb-1">
                Cash in Bag
              </p>
              <p className="text-4xl sm:text-5xl font-bold tracking-tight">
                {formatCurrency(cashInBag)}
              </p>
              <p className="text-indigo-200 text-sm mt-2">
                {todayTransactions.length} collections today
              </p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Logged in as
          </p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            {currentEmployee.name}
          </h1>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, code, or zone..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {sortedShops.length} shops • Showing {paginatedShops.length} •
            Sorted by balance
          </p>
        </div>

        {/* Shop List */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
          {paginatedShops.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                {searchQuery
                  ? 'No shops match your search.'
                  : 'No shops available.'}
              </p>
            </div>
          ) : (
            paginatedShops.map((shopItem) => (
              <button
                key={shopItem._id}
                onClick={() => setSelectedShop(shopItem._id)}
                className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                    {shopItem.retailerUniqueCode}
                  </p>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg mb-1">
                    {shopItem.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {shopItem.zone}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`text-sm font-semibold ${
                        shopItem.currentBalance > 10000
                          ? 'text-red-600 dark:text-red-400'
                          : shopItem.currentBalance > 0
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {formatCurrency(shopItem.currentBalance)}
                    </span>
                    {shopItem.currentBalance > 10000 && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                        High Due!
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, sortedShops.length)} of{' '}
              {sortedShops.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[60px] text-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
