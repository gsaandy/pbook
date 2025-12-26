import { useState } from 'react'
import { FileText, Plus, Search } from 'lucide-react'
import { formatCurrency } from '~/lib/constants'
import { ShopCombobox } from '~/components/ui/shop-combobox'

export interface InvoiceData {
  _id: string
  invoiceNumber: string
  shopId: string
  amount: number
  issueDate: string
  note?: string
  shop?: { name: string; zone: string } | null
}

export interface ShopData {
  _id: string
  name: string
  zone: string
  currentBalance: number
}

export interface InvoicesSectionProps {
  invoices: Array<InvoiceData>
  shops: Array<ShopData>
  onAddInvoice: () => void
}

export function InvoicesSection({
  invoices,
  shops,
  onAddInvoice,
}: InvoicesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [shopFilter, setShopFilter] = useState('')

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const shopName = (invoice.shop?.name ?? '').toLowerCase()
    const query = searchQuery.toLowerCase()

    const matchesSearch =
      !searchQuery ||
      invoice.invoiceNumber.toLowerCase().includes(query) ||
      shopName.includes(query)

    const matchesShop = !shopFilter || invoice.shopId === shopFilter

    return matchesSearch && matchesShop
  })

  // Sort by date (newest first)
  const sortedInvoices = [...filteredInvoices].sort(
    (a, b) =>
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
  )

  const handleClearFilters = () => {
    setSearchQuery('')
    setShopFilter('')
  }

  const hasActiveFilters = searchQuery || shopFilter

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                Deliveries
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Track product deliveries to shops
              </p>
            </div>
            <button
              onClick={onAddInvoice}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Invoice</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by invoice number or shop..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Shop Filter */}
            <div>
              <ShopCombobox
                shops={shops}
                value={shopFilter}
                onChange={setShopFilter}
                placeholder="All Shops"
                showBalance={false}
                allowClear={true}
              />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Invoice List */}
        {sortedInvoices.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {hasActiveFilters
                ? 'No invoices match your search'
                : 'No invoices yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters or search term'
                : 'Start by creating your first invoice for a shop'}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={onAddInvoice}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Invoice
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Invoice #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Shop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Zone
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {sortedInvoices.map((invoice) => (
                    <tr
                      key={invoice._id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-750"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {invoice.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {formatDate(invoice.issueDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                        {invoice.shop?.name ?? 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {invoice.shop?.zone ?? '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {invoice.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {sortedInvoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {invoice.invoiceNumber}
                      </span>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatDate(invoice.issueDate)}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Shop:
                      </span>
                      <span className="text-slate-900 dark:text-white font-medium">
                        {invoice.shop?.name ?? 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Zone:
                      </span>
                      <span className="text-slate-900 dark:text-white">
                        {invoice.shop?.zone ?? '-'}
                      </span>
                    </div>
                    {invoice.note && (
                      <div className="text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          Note:{' '}
                        </span>
                        <span className="text-slate-900 dark:text-white">
                          {invoice.note}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
