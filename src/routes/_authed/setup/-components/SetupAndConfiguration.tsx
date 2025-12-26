import { useState } from 'react'
import {
  Edit2,
  Plus,
  Power,
  PowerOff,
  Search,
  Trash2,
  Upload,
} from 'lucide-react'
import type { Employee, Route, Shop } from '~/lib/types'

export interface SetupAndConfigurationProps {
  shops: Array<Shop>
  routes: Array<Route>
  employees: Array<Employee>
  onAddShop?: () => void
  onEditShop?: (id: string) => void
  onDeleteShop?: (id: string) => void
  onImportShops?: () => void
  onCreateRoute?: () => void
  onEditRoute?: (id: string) => void
  onDeleteRoute?: (id: string) => void
  onAddEmployee?: () => void
  onEditEmployee?: (id: string) => void
  onToggleEmployeeStatus?: (id: string) => void
}

type Tab = 'shops' | 'routes' | 'employees'

export function SetupAndConfiguration({
  shops,
  routes,
  employees,
  onAddShop,
  onEditShop,
  onDeleteShop,
  onImportShops,
  onCreateRoute,
  onEditRoute,
  onDeleteRoute,
  onAddEmployee,
  onEditEmployee,
  onToggleEmployeeStatus,
}: SetupAndConfigurationProps) {
  const [activeTab, setActiveTab] = useState<Tab>('shops')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter data based on search
  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.zone.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredRoutes = routes.filter((route) =>
    route.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Setup & Configuration
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your shops, routes, and team members
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                setActiveTab('shops')
                setSearchQuery('')
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'shops'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Shops ({shops.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('routes')
                setSearchQuery('')
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'routes'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Routes ({routes.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('employees')
                setSearchQuery('')
              }}
              className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'employees'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Employees ({employees.length})
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {activeTab === 'shops' && onImportShops && (
              <button
                onClick={onImportShops}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
            )}
            {activeTab === 'shops' && onAddShop && (
              <button
                onClick={onAddShop}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Shop
              </button>
            )}
            {activeTab === 'routes' && onCreateRoute && (
              <button
                onClick={onCreateRoute}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Route
              </button>
            )}
            {activeTab === 'employees' && onAddEmployee && (
              <button
                onClick={onAddEmployee}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Employee
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent"
          />
        </div>

        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {filteredShops.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No shops yet. Add your first shop or import from CSV.
                </p>
                <div className="flex gap-3 justify-center">
                  {onAddShop && (
                    <button
                      onClick={onAddShop}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
                    >
                      Add Shop
                    </button>
                  )}
                  {onImportShops && (
                    <button
                      onClick={onImportShops}
                      className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                      Import CSV
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Shop Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Zone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Balance
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Last Collection
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {filteredShops.map((shop) => (
                        <tr
                          key={shop.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {shop.name}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {shop.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                              {shop.address}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {shop.zone}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${
                                shop.currentBalance > 10000
                                  ? 'text-red-600 dark:text-red-400'
                                  : shop.currentBalance > 0
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              {formatCurrency(shop.currentBalance)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                            {formatDate(shop.lastCollectionDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              {onEditShop && (
                                <button
                                  onClick={() => onEditShop(shop.id)}
                                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                                  aria-label="Edit shop"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              {onDeleteShop && (
                                <button
                                  onClick={() => onDeleteShop(shop.id)}
                                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                  aria-label="Delete shop"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredShops.map((shop) => (
                    <div key={shop.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {shop.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {shop.address}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {onEditShop && (
                            <button
                              onClick={() => onEditShop(shop.id)}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDeleteShop && (
                            <button
                              onClick={() => onDeleteShop(shop.id)}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-slate-600 dark:text-slate-400">
                          {shop.phone}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs">
                          {shop.zone}
                        </span>
                        <span
                          className={`font-medium ${
                            shop.currentBalance > 10000
                              ? 'text-red-600 dark:text-red-400'
                              : shop.currentBalance > 0
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {formatCurrency(shop.currentBalance)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Routes Tab */}
        {activeTab === 'routes' && (
          <div>
            {filteredRoutes.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center py-12">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No routes yet. Create your first route.
                </p>
                {onCreateRoute && (
                  <button
                    onClick={onCreateRoute}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
                  >
                    Create Route
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {route.name}
                      </h3>
                      <div className="flex gap-1">
                        {onEditRoute && (
                          <button
                            onClick={() => onEditRoute(route.id)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                            aria-label="Edit route"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDeleteRoute && (
                          <button
                            onClick={() => onDeleteRoute(route.id)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Delete route"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      {route.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {route.shopIds.length} shops
                      </span>
                      {route.shopIds.length === 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          No shops assigned
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  No employees yet. Add your first employee.
                </p>
                {onAddEmployee && (
                  <button
                    onClick={onAddEmployee}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
                  >
                    Add Employee
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {filteredEmployees.map((employee) => (
                        <tr
                          key={employee.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {employee.name}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {employee.email}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-500">
                              {employee.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                employee.role === 'admin'
                                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {employee.role === 'admin'
                                ? 'Admin'
                                : 'Field Staff'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${
                                employee.status === 'active'
                                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {employee.status === 'active' ? (
                                <Power className="w-3 h-3" />
                              ) : (
                                <PowerOff className="w-3 h-3" />
                              )}
                              {employee.status === 'active'
                                ? 'Active'
                                : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              {onEditEmployee && (
                                <button
                                  onClick={() => onEditEmployee(employee.id)}
                                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
                                  aria-label="Edit employee"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                              {onToggleEmployeeStatus && (
                                <button
                                  onClick={() =>
                                    onToggleEmployeeStatus(employee.id)
                                  }
                                  className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded transition-colors"
                                  aria-label="Toggle employee status"
                                >
                                  {employee.status === 'active' ? (
                                    <PowerOff className="w-4 h-4" />
                                  ) : (
                                    <Power className="w-4 h-4" />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredEmployees.map((employee) => (
                    <div key={employee.id} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 dark:text-white">
                            {employee.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {employee.email}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-500">
                            {employee.phone}
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {onEditEmployee && (
                            <button
                              onClick={() => onEditEmployee(employee.id)}
                              className="p-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onToggleEmployeeStatus && (
                            <button
                              onClick={() =>
                                onToggleEmployeeStatus(employee.id)
                              }
                              className="p-2 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded"
                            >
                              {employee.status === 'active' ? (
                                <PowerOff className="w-4 h-4" />
                              ) : (
                                <Power className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            employee.role === 'admin'
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {employee.role === 'admin' ? 'Admin' : 'Field Staff'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${
                            employee.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {employee.status === 'active' ? (
                            <Power className="w-3 h-3" />
                          ) : (
                            <PowerOff className="w-3 h-3" />
                          )}
                          {employee.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
