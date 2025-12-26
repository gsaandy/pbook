'use client'

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import type { Employee, Route as RouteType, Shop } from '@/lib/types'
import { SetupAndConfiguration } from '@/components/sections/SetupAndConfiguration'
import { ConfirmModal, EmployeeFormModal, RouteFormModal, ShopFormModal } from '@/components/modals'
import { useDataStore } from '@/lib/data-store'

export const Route = createFileRoute('/setup')({
  component: SetupPage,
})

function SetupPage() {
  const {
    shops,
    routes,
    employees,
    addShop,
    updateShop,
    deleteShop,
    addRoute,
    updateRoute,
    deleteRoute,
    addEmployee,
    updateEmployee,
    toggleEmployeeStatus,
    getShop,
    getRoute,
    getEmployee,
  } = useDataStore()

  // Modal states
  const [shopModalOpen, setShopModalOpen] = useState(false)
  const [routeModalOpen, setRouteModalOpen] = useState(false)
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  // Edit states
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [editingRoute, setEditingRoute] = useState<RouteType | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'shop' | 'route'
    id: string
    name: string
  } | null>(null)

  // Shop handlers
  const handleAddShop = () => {
    setEditingShop(null)
    setShopModalOpen(true)
  }

  const handleEditShop = (id: string) => {
    const shop = getShop(id)
    if (shop) {
      setEditingShop(shop)
      setShopModalOpen(true)
    }
  }

  const handleDeleteShop = (id: string) => {
    const shop = getShop(id)
    if (shop) {
      setDeleteTarget({ type: 'shop', id, name: shop.name })
      setConfirmModalOpen(true)
    }
  }

  const handleSaveShop = (shopData: Omit<Shop, 'id'> | Shop) => {
    if ('id' in shopData) {
      updateShop(shopData.id, shopData)
    } else {
      addShop(shopData)
    }
  }

  // Route handlers
  const handleCreateRoute = () => {
    setEditingRoute(null)
    setRouteModalOpen(true)
  }

  const handleEditRoute = (id: string) => {
    const route = getRoute(id)
    if (route) {
      setEditingRoute(route)
      setRouteModalOpen(true)
    }
  }

  const handleDeleteRoute = (id: string) => {
    const route = getRoute(id)
    if (route) {
      setDeleteTarget({ type: 'route', id, name: route.name })
      setConfirmModalOpen(true)
    }
  }

  const handleSaveRoute = (routeData: Omit<RouteType, 'id'> | RouteType) => {
    if ('id' in routeData) {
      updateRoute(routeData.id, routeData)
    } else {
      addRoute(routeData)
    }
  }

  // Employee handlers
  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setEmployeeModalOpen(true)
  }

  const handleEditEmployee = (id: string) => {
    const employee = getEmployee(id)
    if (employee) {
      setEditingEmployee(employee)
      setEmployeeModalOpen(true)
    }
  }

  const handleSaveEmployee = (employeeData: Omit<Employee, 'id'> | Employee) => {
    if ('id' in employeeData) {
      updateEmployee(employeeData.id, employeeData)
    } else {
      addEmployee(employeeData)
    }
  }

  const handleToggleEmployeeStatus = (id: string) => {
    toggleEmployeeStatus(id)
  }

  // Delete confirmation handler
  const handleConfirmDelete = () => {
    if (deleteTarget) {
      if (deleteTarget.type === 'shop') {
        deleteShop(deleteTarget.id)
      } else {
        deleteRoute(deleteTarget.id)
      }
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <SetupAndConfiguration
        shops={shops}
        routes={routes}
        employees={employees}
        onAddShop={handleAddShop}
        onEditShop={handleEditShop}
        onDeleteShop={handleDeleteShop}
        onCreateRoute={handleCreateRoute}
        onEditRoute={handleEditRoute}
        onDeleteRoute={handleDeleteRoute}
        onAddEmployee={handleAddEmployee}
        onEditEmployee={handleEditEmployee}
        onToggleEmployeeStatus={handleToggleEmployeeStatus}
      />

      {/* Shop Form Modal */}
      <ShopFormModal
        key={editingShop?.id ?? 'new-shop'}
        isOpen={shopModalOpen}
        onClose={() => {
          setShopModalOpen(false)
          setEditingShop(null)
        }}
        onSave={handleSaveShop}
        shop={editingShop}
      />

      {/* Route Form Modal */}
      <RouteFormModal
        key={editingRoute?.id ?? 'new-route'}
        isOpen={routeModalOpen}
        onClose={() => {
          setRouteModalOpen(false)
          setEditingRoute(null)
        }}
        onSave={handleSaveRoute}
        route={editingRoute}
        availableShops={shops}
      />

      {/* Employee Form Modal */}
      <EmployeeFormModal
        key={editingEmployee?.id ?? 'new-employee'}
        isOpen={employeeModalOpen}
        onClose={() => {
          setEmployeeModalOpen(false)
          setEditingEmployee(null)
        }}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => {
          setConfirmModalOpen(false)
          setDeleteTarget(null)
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteTarget?.type === 'shop' ? 'Shop' : 'Route'}`}
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  )
}
