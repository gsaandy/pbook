'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import type { Route, Shop } from '@/lib/types'

interface RouteFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (route: Omit<Route, 'id'> | Route) => void
  route?: Route | null
  availableShops: Array<Shop>
}

export function RouteFormModal({ isOpen, onClose, onSave, route, availableShops }: RouteFormModalProps) {
  // Lazy initialization - parent uses key prop to reset when route changes
  const [formData, setFormData] = useState(() => ({
    name: route?.name ?? '',
    description: route?.description ?? '',
    shopIds: route?.shopIds ?? ([] as Array<string>),
  }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (route) {
      onSave({ ...formData, id: route.id })
    } else {
      onSave(formData)
    }
    onClose()
  }

  const toggleShop = (shopId: string) => {
    setFormData((prev) => ({
      ...prev,
      shopIds: prev.shopIds.includes(shopId)
        ? prev.shopIds.filter((id) => id !== shopId)
        : [...prev.shopIds, shopId],
    }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={route ? 'Edit Route' : 'Create Route'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Route Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter route name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
            placeholder="Describe this route"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Assign Shops
          </label>
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto">
            {availableShops.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 dark:text-slate-400 text-center">
                No shops available. Add shops first.
              </p>
            ) : (
              availableShops.map((shop) => (
                <label
                  key={shop.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={formData.shopIds.includes(shop.id)}
                    onChange={() => toggleShop(shop.id)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {shop.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {shop.zone} - {shop.address}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {formData.shopIds.length} shop(s) selected
          </p>
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
            {route ? 'Save Changes' : 'Create Route'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
