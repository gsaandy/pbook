import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { Invoice } from '~/lib/types'
import { InvoicesSection } from './-components/InvoicesSection'
import { InvoiceFormModal } from './-components/InvoiceFormModal'
import { useDataStore } from '~/lib/data-store'

export const Route = createFileRoute('/_authed/invoices')({
  component: InvoicesPage,
})

function InvoicesPage() {
  const {
    invoices,
    shops,
    addInvoice,
    updateInvoice,
    cancelInvoice,
    getInvoice,
    getShop,
  } = useDataStore()

  // Modal states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  // Edit state
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  // Get current user ID (using first admin employee as placeholder)
  // TODO: Replace with actual current user ID from auth context
  const currentUserId = 'emp-004' // Sunita Reddy (admin) from initial data

  // Invoice handlers
  const handleAddInvoice = () => {
    setEditingInvoice(null)
    setInvoiceModalOpen(true)
  }

  const handleEditInvoice = (id: string) => {
    const invoice = getInvoice(id)
    if (invoice) {
      setEditingInvoice(invoice)
      setInvoiceModalOpen(true)
    }
  }

  const handleCancelInvoice = (id: string) => {
    cancelInvoice(id)
  }

  const handleSaveInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'status'> | Invoice) => {
    if ('id' in invoiceData) {
      // Editing existing invoice
      updateInvoice(invoiceData.id, {
        amount: invoiceData.amount,
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        reference: invoiceData.reference,
      })
    } else {
      // Adding new invoice
      addInvoice(invoiceData)
    }
  }

  const getShopName = (shopId: string): string => {
    const shop = getShop(shopId)
    return shop?.name || 'Unknown Shop'
  }

  return (
    <>
      <InvoicesSection
        invoices={invoices}
        shops={shops}
        onAddInvoice={handleAddInvoice}
        onEditInvoice={handleEditInvoice}
        onCancelInvoice={handleCancelInvoice}
        getShopName={getShopName}
      />

      {/* Invoice Form Modal */}
      <InvoiceFormModal
        key={editingInvoice?.id ?? 'new-invoice'}
        isOpen={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false)
          setEditingInvoice(null)
        }}
        onSave={handleSaveInvoice}
        invoice={editingInvoice}
        shops={shops}
        currentUserId={currentUserId}
      />
    </>
  )
}
