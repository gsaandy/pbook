import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { InvoicesSection } from './-components/InvoicesSection'
import { InvoiceFormModal } from './-components/InvoiceFormModal'
import type { Id } from '~/convex/_generated/dataModel'
import { EmployeeRole } from '~/lib/constants'
import {
  employeeQueries,
  invoiceQueries,
  shopQueries,
  useCreateInvoiceMutation,
} from '~/queries'

export const Route = createFileRoute('/_authed/invoices')({
  component: InvoicesPage,
  beforeLoad: async ({ context: { queryClient } }) => {
    // Check if user is authorized (admins only)
    const employee = await queryClient.ensureQueryData(
      employeeQueries.current(),
    )
    if (employee?.role === EmployeeRole.FIELD_STAFF) {
      throw redirect({ to: '/operations' })
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await Promise.all([
      queryClient.ensureQueryData(invoiceQueries.listWithDetails()),
      queryClient.ensureQueryData(shopQueries.list()),
      queryClient.ensureQueryData(employeeQueries.current()),
    ])
  },
})

function InvoicesPage() {
  // Fetch data from Convex
  const { data: invoices } = useSuspenseQuery(invoiceQueries.listWithDetails())
  const { data: shops } = useSuspenseQuery(shopQueries.list())
  const { data: currentEmployee } = useSuspenseQuery(employeeQueries.current())

  // Mutations
  const createInvoice = useCreateInvoiceMutation()

  // Modal states
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)

  // Get current user ID from auth
  const currentUserId = currentEmployee?._id ?? ('' as Id<'employees'>)

  // Invoice handlers
  const handleAddInvoice = () => {
    setInvoiceModalOpen(true)
  }

  const handleSaveInvoice = (data: {
    shopId: string
    amount: number
    invoiceNumber: string
    issueDate: string
    note?: string
  }) => {
    if (currentUserId) {
      createInvoice.mutate({
        shopId: data.shopId as Id<'shops'>,
        amount: data.amount,
        invoiceNumber: data.invoiceNumber,
        issueDate: data.issueDate,
        createdBy: currentUserId,
        note: data.note,
      })
    }
    setInvoiceModalOpen(false)
  }

  return (
    <>
      <InvoicesSection
        invoices={invoices}
        shops={shops}
        onAddInvoice={handleAddInvoice}
      />

      {/* Invoice Form Modal */}
      <InvoiceFormModal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
        shops={shops}
      />
    </>
  )
}
