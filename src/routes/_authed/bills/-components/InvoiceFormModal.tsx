import { useState } from 'react'
import { Modal } from '~/components/modals/Modal'
import { ShopCombobox } from '~/components/ui/shop-combobox'
import { formatCurrency } from '~/lib/constants'

interface ShopData {
  _id: string
  name: string
  zone: string
  currentBalance: number
}

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (invoice: {
    shopId: string
    amount: number
    invoiceNumber: string
    issueDate: string
    note?: string
  }) => void
  shops: Array<ShopData>
}

export function InvoiceFormModal({
  isOpen,
  onClose,
  onSave,
  shops,
}: InvoiceFormModalProps) {
  const [formData, setFormData] = useState({
    shopId: '',
    amount: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    note: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.shopId || !formData.invoiceNumber || !formData.amount) {
      return
    }

    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      alert('Amount must be greater than 0')
      return
    }

    onSave({
      shopId: formData.shopId,
      amount,
      invoiceNumber: formData.invoiceNumber,
      issueDate: formData.issueDate,
      note: formData.note || undefined,
    })

    // Reset form
    setFormData({
      shopId: '',
      amount: '',
      invoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      note: '',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Invoice">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Shop *
          </label>
          <ShopCombobox
            shops={shops}
            value={formData.shopId}
            onChange={(shopId) => setFormData({ ...formData, shopId })}
            placeholder="Search for a shop..."
            showBalance={true}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Invoice Number *
            </label>
            <input
              type="text"
              required
              value={formData.invoiceNumber}
              onChange={(e) =>
                setFormData({ ...formData, invoiceNumber: e.target.value })
              }
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="INV-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Issue Date *
            </label>
            <input
              type="date"
              required
              value={formData.issueDate}
              onChange={(e) =>
                setFormData({ ...formData, issueDate: e.target.value })
              }
              className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Amount (INR) *
          </label>
          <input
            type="number"
            required
            step="0.01"
            min="0.01"
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
          />
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatCurrency(parseFloat(formData.amount))}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Note
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="Add any notes..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Invoice
          </button>
        </div>
      </form>
    </Modal>
  )
}
