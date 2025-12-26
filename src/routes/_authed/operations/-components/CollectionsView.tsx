import { useState } from 'react'
import { Calendar, Plus, Store, Wallet } from 'lucide-react'
import { Modal } from '~/components/modals/Modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { ShopCombobox } from '~/components/ui/shop-combobox'

export interface CollectionsViewProps {
  employees: Array<{
    _id: string
    name: string
    role: 'field_staff' | 'admin' | 'super_admin'
  }>
  currentEmployee: {
    _id: string
    name: string
    role: 'field_staff' | 'admin' | 'super_admin'
  } | null
  shops: Array<{
    _id: string
    name: string
    zone: string
    currentBalance: number
  }>
  transactions: Array<{
    _id: string
    amount: number
    timestamp: number
    paymentMode: 'cash' | 'upi' | 'cheque'
    isVerified: boolean
    shop?: { name: string } | null
    employee?: { name: string } | null
  }>
  today: string
  onCollectCash: (data: {
    shopId: string
    amount: number
    paymentMode: 'cash' | 'upi' | 'cheque'
  }) => void
  isCollecting: boolean
}

export function CollectionsView({
  shops,
  transactions,
  today,
  onCollectCash,
  isCollecting,
}: CollectionsViewProps) {
  const [collectModalOpen, setCollectModalOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'cheque'>('cash')

  const todayTransactions = transactions.filter((t) => {
    const txnDate = new Date(t.timestamp).toISOString().split('T')[0]
    return txnDate === today
  })

  const totalCollected = todayTransactions.reduce((sum, t) => sum + t.amount, 0)
  const cashCollected = todayTransactions
    .filter((t) => t.paymentMode === 'cash')
    .reduce((sum, t) => sum + t.amount, 0)
  const unverifiedCash = todayTransactions
    .filter((t) => t.paymentMode === 'cash' && !t.isVerified)
    .reduce((sum, t) => sum + t.amount, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCollect = () => {
    if (selectedShop && amount) {
      onCollectCash({
        shopId: selectedShop,
        amount: parseFloat(amount),
        paymentMode,
      })
      setCollectModalOpen(false)
      setSelectedShop('')
      setAmount('')
      setPaymentMode('cash')
    }
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Collections
            </h1>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(today)}
            </p>
          </div>
          <button
            onClick={() => setCollectModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Collect Cash
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Total Collected
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(totalCollected)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cash Collected
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(cashCollected)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cash in Bag
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(unverifiedCash)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Collections */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Today's Collections ({todayTransactions.length})
            </h2>
          </div>

          {todayTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No collections today yet.
              </p>
              <button
                onClick={() => setCollectModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Make First Collection
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {todayTransactions
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((txn) => (
                  <div
                    key={txn._id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                        <Store className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {txn.shop?.name ?? 'Unknown Shop'}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {formatTime(txn.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 text-xs font-medium rounded-full ${getPaymentModeColor(txn.paymentMode)}`}
                      >
                        {txn.paymentMode.toUpperCase()}
                      </span>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(txn.amount)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Collect Cash Modal */}
      <Modal
        isOpen={collectModalOpen}
        onClose={() => {
          setCollectModalOpen(false)
          setSelectedShop('')
          setAmount('')
          setPaymentMode('cash')
        }}
        title="Collect Cash"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Shop
            </label>
            <ShopCombobox
              shops={shops}
              value={selectedShop}
              onChange={setSelectedShop}
              placeholder="Search for a shop..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Payment Mode
            </label>
            <Select
              value={paymentMode}
              onValueChange={(v) => setPaymentMode(v as 'cash' | 'upi' | 'cheque')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setCollectModalOpen(false)
                setSelectedShop('')
                setAmount('')
                setPaymentMode('cash')
              }}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCollect}
              disabled={!selectedShop || !amount || isCollecting}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCollecting ? 'Collecting...' : 'Collect'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
