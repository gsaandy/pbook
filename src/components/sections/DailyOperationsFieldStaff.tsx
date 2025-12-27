import { useState } from 'react'
import {
  Banknote,
  ChevronRight,
  FileText,
  Search,
  Smartphone,
  Wallet,
} from 'lucide-react'
import type { PaymentMode, Shop } from '~/lib/types'

export interface CurrentEmployee {
  id: string
  name: string
  role: 'field_staff' | 'admin' | 'super_admin'
  cashInBag: number
}

export interface AssignedRoute {
  id: string
  name: string
  description: string
  shops: Array<Shop>
}

export interface CollectionFormData {
  shopId: string
  amount: number
  paymentMode: 'cash' | 'upi' | 'cheque'
  reference?: string
}

export interface DailyOperationsFieldStaffProps {
  currentEmployee: CurrentEmployee
  assignedRoute: AssignedRoute | null
  paymentModes: Array<PaymentMode>
  onLogCollection?: (data: CollectionFormData) => void
  onSearchShop?: (query: string) => void
}

export function DailyOperationsFieldStaff({
  currentEmployee,
  assignedRoute,
  paymentModes,
  onLogCollection,
}: DailyOperationsFieldStaffProps) {
  const [selectedShop, setSelectedShop] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'cheque'>(
    'cash',
  )
  const [reference, setReference] = useState('')

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
    if (!selectedShop || !amount || parseFloat(amount) <= 0) return

    const formData: CollectionFormData = {
      shopId: selectedShop,
      amount: parseFloat(amount),
      paymentMode,
      reference: reference || undefined,
    }

    onLogCollection?.(formData)

    // Reset form
    setSelectedShop(null)
    setAmount('')
    setPaymentMode('cash')
    setReference('')
  }

  const shop = selectedShop
    ? assignedRoute?.shops.find((s) => s.id === selectedShop)
    : null

  if (!assignedRoute) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No Route Assigned Today
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Contact your admin to get assigned to a route.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Collection Form Modal */}
      {selectedShop && shop && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {shop.name}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Current Balance:{' '}
                <span className="font-semibold text-amber-600 dark:text-amber-400">
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

              {/* Reference (Optional) */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Reference / Remarks (Optional)
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="UTR number, cheque number, or notes..."
                  className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
                />
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
                disabled={!amount || parseFloat(amount) <= 0}
                className="flex-1 px-6 py-4 text-sm font-semibold text-white bg-emerald-600 dark:bg-emerald-500 rounded-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Collection
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
                {formatCurrency(currentEmployee.cashInBag)}
              </p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Your Route
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {assignedRoute.name}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {assignedRoute.description}
              </p>
            </div>
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-full">
              {assignedRoute.shops.length} shops
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search for any shop..."
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Not on your route? Use search to find any shop
          </p>
        </div>

        {/* Shop List */}
        <div className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
          {assignedRoute.shops.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                No shops in this route yet.
              </p>
            </div>
          ) : (
            assignedRoute.shops.map((shopItem) => (
              <button
                key={shopItem.id}
                onClick={() => setSelectedShop(shopItem.id)}
                className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg mb-1">
                    {shopItem.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                    {[shopItem.addressLine1, shopItem.city, shopItem.zone].filter(Boolean).join(', ') || shopItem.zone}
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
      </div>
    </div>
  )
}
