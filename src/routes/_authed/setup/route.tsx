import { useState } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { SetupAndConfiguration } from './-components/SetupAndConfiguration'
import { EmployeeFormModal } from './-components/EmployeeFormModal'
import { RouteFormModal } from './-components/RouteFormModal'
import { ShopFormModal } from './-components/ShopFormModal'
import type { Employee, Route as RouteType, Shop } from '~/lib/types'
import type { Id } from '~/convex/_generated/dataModel'
import {
  employeeQueries,
  routeQueries,
  shopQueries,
  useCreateEmployeeMutation,
  useCreateRouteMutation,
  useCreateShopMutation,
  useUpdateEmployeeMutation,
  useUpdateRouteMutation,
  useUpdateShopMutation,
} from '~/queries'

export const Route = createFileRoute('/_authed/setup')({
  component: SetupPage,
  loader: async ({ context: { queryClient } }) => {
    // Prefetch all data needed for setup page
    await Promise.all([
      queryClient.ensureQueryData(shopQueries.list()),
      queryClient.ensureQueryData(routeQueries.list()),
      queryClient.ensureQueryData(employeeQueries.list()),
    ])
  },
})

// Adapter functions to convert Convex types to local types
function adaptShop(shop: {
  _id: Id<'shops'>
  name: string
  zone: string
  currentBalance: number
  routeId?: Id<'routes'>
}): Shop {
  return {
    id: shop._id,
    name: shop.name,
    address: '',
    phone: '',
    zone: shop.zone,
    currentBalance: shop.currentBalance,
    lastCollectionDate: new Date().toISOString().split('T')[0],
  }
}

function adaptRoute(
  route: {
    _id: Id<'routes'>
    name: string
  },
  shopsByRoute: Map<string, Array<string>>,
): RouteType {
  return {
    id: route._id,
    name: route.name,
    description: '',
    shopIds: shopsByRoute.get(route._id) ?? [],
  }
}

function adaptEmployee(employee: {
  _id: Id<'employees'>
  name: string
  email: string
  role: 'field_staff' | 'admin' | 'super_admin'
  status: 'active'
}): Employee {
  return {
    id: employee._id,
    name: employee.name,
    email: employee.email,
    phone: '',
    role: employee.role,
    status: employee.status,
  }
}

function SetupPage() {
  // Fetch data from Convex
  const { data: convexShops } = useSuspenseQuery(shopQueries.list())
  const { data: convexRoutes } = useSuspenseQuery(routeQueries.list())
  const { data: convexEmployees } = useSuspenseQuery(employeeQueries.list())

  // Build shopsByRoute map for route adaptation
  const shopsByRoute = new Map<string, Array<string>>()
  for (const shop of convexShops) {
    if (shop.routeId) {
      const existing = shopsByRoute.get(shop.routeId) ?? []
      existing.push(shop._id)
      shopsByRoute.set(shop.routeId, existing)
    }
  }

  // Adapt Convex data to local types
  const shops = convexShops.map(adaptShop)
  const routes = convexRoutes.map((r) => adaptRoute(r, shopsByRoute))
  const employees = convexEmployees.map(adaptEmployee)

  // Mutations
  const createShop = useCreateShopMutation()
  const updateShop = useUpdateShopMutation()
  const createRoute = useCreateRouteMutation()
  const updateRoute = useUpdateRouteMutation()
  const createEmployee = useCreateEmployeeMutation()
  const updateEmployee = useUpdateEmployeeMutation()

  // Modal states
  const [shopModalOpen, setShopModalOpen] = useState(false)
  const [routeModalOpen, setRouteModalOpen] = useState(false)
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false)

  // Edit states
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [editingRoute, setEditingRoute] = useState<RouteType | null>(null)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  // Shop handlers
  const handleAddShop = () => {
    setEditingShop(null)
    setShopModalOpen(true)
  }

  const handleEditShop = (id: string) => {
    const shop = shops.find((s) => s.id === id)
    if (shop) {
      setEditingShop(shop)
      setShopModalOpen(true)
    }
  }

  const handleSaveShop = (shopData: Omit<Shop, 'id'> | Shop) => {
    if ('id' in shopData) {
      updateShop.mutate({
        id: shopData.id as Id<'shops'>,
        name: shopData.name,
        zone: shopData.zone,
      })
    } else {
      createShop.mutate({
        name: shopData.name,
        zone: shopData.zone,
        currentBalance: shopData.currentBalance,
      })
    }
    setShopModalOpen(false)
    setEditingShop(null)
  }

  // Route handlers
  const handleCreateRoute = () => {
    setEditingRoute(null)
    setRouteModalOpen(true)
  }

  const handleEditRoute = (id: string) => {
    const route = routes.find((r) => r.id === id)
    if (route) {
      setEditingRoute(route)
      setRouteModalOpen(true)
    }
  }

  const handleSaveRoute = (routeData: Omit<RouteType, 'id'> | RouteType) => {
    if ('id' in routeData) {
      updateRoute.mutate({
        id: routeData.id as Id<'routes'>,
        name: routeData.name,
      })
    } else {
      createRoute.mutate({
        name: routeData.name,
      })
    }
    setRouteModalOpen(false)
    setEditingRoute(null)
  }

  // Employee handlers
  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setEmployeeModalOpen(true)
  }

  const handleEditEmployee = (id: string) => {
    const employee = employees.find((e) => e.id === id)
    if (employee) {
      setEditingEmployee(employee)
      setEmployeeModalOpen(true)
    }
  }

  const handleSaveEmployee = (
    employeeData: Omit<Employee, 'id'> | Employee,
  ) => {
    if ('id' in employeeData) {
      updateEmployee.mutate({
        id: employeeData.id as Id<'employees'>,
        name: employeeData.name,
        role: employeeData.role,
      })
    } else {
      createEmployee.mutate({
        name: employeeData.name,
        email: employeeData.email,
        role: employeeData.role,
      })
    }
    setEmployeeModalOpen(false)
    setEditingEmployee(null)
  }

  return (
    <>
      <SetupAndConfiguration
        shops={shops}
        routes={routes}
        employees={employees}
        onAddShop={handleAddShop}
        onEditShop={handleEditShop}
        onCreateRoute={handleCreateRoute}
        onEditRoute={handleEditRoute}
        onAddEmployee={handleAddEmployee}
        onEditEmployee={handleEditEmployee}
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
    </>
  )
}
