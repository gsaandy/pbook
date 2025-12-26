import { useState } from 'react'
import type { Invoice, Shop } from '~/lib/types'
import { Modal } from '~/components/modals/Modal'

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    invoice: Omit<Invoice, 'id' | 'createdAt' | 'status'> | Invoice,
  ) => void
  invoice?: Invoice | null
  shops: Array<Shop>
  currentUserId: string
}

export function InvoiceFormModal({
  isOpen,
  onClose,
  onSave,
  invoice,
  shops,
  currentUserId,
}: InvoiceFormModalProps) {
  // Lazy initialization - parent uses key prop to reset when invoice changes
  const [formData, setFormData] = useState(() => ({
    shopId: invoice?.shopId ?? '',
    amount: invoice?.amount ?? '',
    invoiceNumber: invoice?.invoiceNumber ?? '',
    invoiceDate: invoice?.invoiceDate ?? new Date().toISOString().split('T')[0],
    reference: invoice?.reference ?? '',
    createdBy: invoice?.createdBy ?? currentUserId,
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.shopId || !formData.invoiceNumber || !formData.amount) {
      return
    }

    const amount =
      typeof formData.amount === 'string'
        ? parseFloat(formData.amount)
        : formData.amount
    if (amount <= 0) {
      alert('Amount must be greater than 0')
      return
    }

    if (invoice) {
      onSave({
        ...invoice,
        amount,
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        reference: formData.reference,
      })
    } else {
      onSave({
        shopId: formData.shopId,
        amount,
        invoiceNumber: formData.invoiceNumber,
        invoiceDate: formData.invoiceDate,
        reference: formData.reference,
        createdBy: formData.createdBy,
      })
    }
    onClose()
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={invoice ? 'Edit Invoice' : 'Add Invoice'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Shop *
          </label>
          <select
            required
            disabled={!!invoice} // Cannot change shop when editing
            value={formData.shopId}
            onChange={(e) =>
              setFormData({ ...formData, shopId: e.target.value })
            }
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select a shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name} - {shop.zone} (Balance:{' '}
                {formatCurrency(shop.currentBalance)})
              </option>
            ))}
          </select>
          {invoice && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Shop cannot be changed when editing
            </p>
          )}
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
              Invoice Date *
            </label>
            <input
              type="date"
              required
              value={formData.invoiceDate}
              onChange={(e) =>
                setFormData({ ...formData, invoiceDate: e.target.value })
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
          {formData.amount && parseFloat(formData.amount as string) > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatCurrency(parseFloat(formData.amount as string))}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Reference / Notes
          </label>
          <textarea
            value={formData.reference}
            onChange={(e) =>
              setFormData({ ...formData, reference: e.target.value })
            }
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="Add any notes or reference information..."
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
            {invoice ? 'Save Changes' : 'Add Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
