import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { InvoicesSection } from './-components/InvoicesSection'
import { InvoiceFormModal } from './-components/InvoiceFormModal'
import type { Invoice, Shop } from '~/lib/types'
import type { Id } from '~/convex/_generated/dataModel'
import {
  employeeQueries,
  invoiceQueries,
  shopQueries,
  useCancelInvoiceMutation,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
} from '~/queries'

export const Route = createFileRoute('/_authed/invoices')({
  component: InvoicesPage,
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(
        invoiceQueries.list({ includeShopDetails: true }),
      ),
      queryClient.ensureQueryData(shopQueries.list()),
      queryClient.ensureQueryData(employeeQueries.current()),
    ])
  },
})

// Adapter functions
function adaptInvoice(invoice: {
  _id: Id<'invoices'>
  shopId: Id<'shops'>
  amount: number
  invoiceNumber: string
  invoiceDate: string
  reference?: string
  createdAt: number
  createdBy: Id<'employees'>
  status: 'active' | 'cancelled'
}): Invoice {
  return {
    id: invoice._id,
    shopId: invoice.shopId,
    amount: invoice.amount,
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: invoice.invoiceDate,
    reference: invoice.reference ?? '',
    createdAt: new Date(invoice.createdAt).toISOString(),
    createdBy: invoice.createdBy,
    status: invoice.status,
  }
}

function adaptShop(shop: {
  _id: Id<'shops'>
  name: string
  address: string
  phone?: string
  zone: string
  currentBalance: number
  lastCollectionDate?: string
}): Shop {
  return {
    id: shop._id,
    name: shop.name,
    address: shop.address,
    phone: shop.phone ?? '',
    zone: shop.zone,
    currentBalance: shop.currentBalance,
    lastCollectionDate:
      shop.lastCollectionDate ?? new Date().toISOString().split('T')[0],
  }
}

function InvoicesPage() {
  // Fetch data from Convex
  const { data: convexInvoices } = useSuspenseQuery(
    invoiceQueries.list({ includeShopDetails: true }),
  )
  const { data: convexShops } = useSuspenseQuery(shopQueries.list())
  const { data: currentEmployee } = useSuspenseQuery(employeeQueries.current())

  // Adapt data
  const invoices = convexInvoices.map(adaptInvoice)
  const shops = convexShops.map(adaptShop)

  // Build shop lookup map
  const shopMap = new Map(convexShops.map((s) => [s._id, s]))

  // Mutations
  const createInvoice = useCreateInvoiceMutation()
  const updateInvoice = useUpdateInvoiceMutation()
  const cancelInvoice = useCancelInvoiceMutation()

  // Modal states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  // Edit state
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  // Get current user ID from auth
  const currentUserId = currentEmployee?._id ?? ('' as Id<'employees'>)

  // Invoice handlers
  const handleAddInvoice = () => {
    setEditingInvoice(null)
    setInvoiceModalOpen(true)
  }

  const handleEditInvoice = (id: string) => {
    const invoice = invoices.find((inv) => inv.id === id)
    if (invoice) {
      setEditingInvoice(invoice)
      setInvoiceModalOpen(true)
    }
  }

  const handleCancelInvoice = (id: string) => {
    if (currentUserId) {
      cancelInvoice.mutate({
        id: id as Id<'invoices'>,
        cancelledBy: currentUserId,
      })
    }
  }

  const handleSaveInvoice = (
    invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'status'> | Invoice,
  ) => {
    if ('id' in invoiceData) {
      // Editing existing invoice
      if (currentUserId) {
        updateInvoice.mutate({
          id: invoiceData.id as Id<'invoices'>,
          amount: invoiceData.amount,
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          reference: invoiceData.reference,
          updatedBy: currentUserId,
        })
      }
    } else {
      // Adding new invoice
      if (currentUserId) {
        createInvoice.mutate({
          shopId: invoiceData.shopId as Id<'shops'>,
          amount: invoiceData.amount,
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          reference: invoiceData.reference,
          createdBy: currentUserId,
        })
      }
    }
    setInvoiceModalOpen(false)
    setEditingInvoice(null)
  }

  const getShopName = (shopId: string): string => {
    const shop = shopMap.get(shopId as Id<'shops'>)
    return shop?.name ?? 'Unknown Shop'
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
