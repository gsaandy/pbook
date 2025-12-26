import {  createContext, useCallback, useContext, useState } from 'react'
import type {ReactNode} from 'react';
import type { DailyReconciliation, Employee, Route, RouteAssignment, Shop, Transaction } from './types'

// Initial sample data
const initialShops: Array<Shop> = [
  { id: 'shop-001', name: 'Royal Supermarket', address: '123 MG Road, Bangalore', phone: '+91 98765 43210', currentBalance: 5000, zone: 'North', lastCollectionDate: '2025-12-24' },
  { id: 'shop-002', name: 'Sai Kirana Store', address: '45 Jayanagar 4th Block, Bangalore', phone: '+91 98765 43211', currentBalance: 1200, zone: 'South', lastCollectionDate: '2025-12-23' },
  { id: 'shop-003', name: 'Lakshmi Bakery', address: '78 Indiranagar, Bangalore', phone: '+91 98765 43212', currentBalance: 10000, zone: 'East', lastCollectionDate: '2025-12-20' },
  { id: 'shop-004', name: 'Ramesh Tea Stall', address: '12 Market Road, Bangalore', phone: '+91 98765 43213', currentBalance: 500, zone: 'Central', lastCollectionDate: '2025-12-24' },
  { id: 'shop-005', name: 'Annapurna Restaurant', address: '56 Brigade Road, Bangalore', phone: '+91 98765 43214', currentBalance: 8500, zone: 'Central', lastCollectionDate: '2025-12-22' },
  { id: 'shop-006', name: 'Green Valley Provisions', address: '89 Koramangala, Bangalore', phone: '+91 98765 43215', currentBalance: 3200, zone: 'South', lastCollectionDate: '2025-12-24' },
  { id: 'shop-007', name: 'City Mart', address: '34 Whitefield Main Road, Bangalore', phone: '+91 98765 43216', currentBalance: 0, zone: 'East', lastCollectionDate: '2025-12-24' },
  { id: 'shop-008', name: 'Spice Garden', address: '67 Malleswaram, Bangalore', phone: '+91 98765 43217', currentBalance: 15000, zone: 'North', lastCollectionDate: '2025-12-18' },
]

const initialRoutes: Array<Route> = [
  { id: 'route-001', name: 'North Zone', description: 'Covers all shops in North Bangalore', shopIds: ['shop-001', 'shop-008'] },
  { id: 'route-002', name: 'South Zone', description: 'Jayanagar and Koramangala area', shopIds: ['shop-002', 'shop-006'] },
  { id: 'route-003', name: 'East Zone', description: 'Indiranagar and Whitefield coverage', shopIds: ['shop-003', 'shop-007'] },
  { id: 'route-004', name: 'Central Zone', description: 'Downtown commercial district', shopIds: ['shop-004', 'shop-005'] },
  { id: 'route-005', name: 'Special Delivery', description: 'Ad-hoc route for emergency collections', shopIds: [] },
]

const initialEmployees: Array<Employee> = [
  { id: 'emp-001', name: 'Rajesh Kumar', phone: '+91 98765 11111', email: 'rajesh@psbook.com', role: 'field_staff', status: 'active' },
  { id: 'emp-002', name: 'Priya Sharma', phone: '+91 98765 22222', email: 'priya@psbook.com', role: 'field_staff', status: 'active' },
  { id: 'emp-003', name: 'Amit Patel', phone: '+91 98765 33333', email: 'amit@psbook.com', role: 'field_staff', status: 'active' },
  { id: 'emp-004', name: 'Sunita Reddy', phone: '+91 98765 44444', email: 'sunita@psbook.com', role: 'admin', status: 'active' },
  { id: 'emp-005', name: 'Vikram Singh', phone: '+91 98765 55555', email: 'vikram@psbook.com', role: 'field_staff', status: 'inactive' },
]

// Helper to generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Helper to get today's date in ISO format
function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

interface DataStoreContextType {
  // Data
  shops: Array<Shop>
  routes: Array<Route>
  employees: Array<Employee>
  routeAssignments: Array<RouteAssignment>
  transactions: Array<Transaction>
  reconciliations: Array<DailyReconciliation>

  // Shop CRUD
  addShop: (shop: Omit<Shop, 'id'>) => Shop
  updateShop: (id: string, data: Partial<Shop>) => void
  deleteShop: (id: string) => void
  getShop: (id: string) => Shop | undefined

  // Route CRUD
  addRoute: (route: Omit<Route, 'id'>) => Route
  updateRoute: (id: string, data: Partial<Route>) => void
  deleteRoute: (id: string) => void
  getRoute: (id: string) => Route | undefined

  // Employee CRUD
  addEmployee: (employee: Omit<Employee, 'id'>) => Employee
  updateEmployee: (id: string, data: Partial<Employee>) => void
  toggleEmployeeStatus: (id: string) => void
  getEmployee: (id: string) => Employee | undefined

  // Route Assignments
  assignRoute: (employeeId: string, routeId: string, date?: string) => RouteAssignment
  getTodayAssignment: (employeeId: string) => RouteAssignment | undefined
  getTodayAssignments: () => Array<RouteAssignment>
  cancelAssignment: (id: string) => void
  completeAssignment: (id: string) => void

  // Transactions
  logCollection: (data: {
    employeeId: string
    shopId: string
    amount: number
    paymentMode: 'cash' | 'upi' | 'cheque'
    reference?: string
    gpsLocation?: { lat: number; lng: number }
  }) => Transaction
  getTodayTransactions: (employeeId?: string) => Array<Transaction>
  getEmployeeCashInHand: (employeeId: string, date?: string) => number
  getAllTransactions: () => Array<Transaction>

  // Reconciliation
  verifyReconciliation: (employeeId: string, actualCash: number, note?: string) => DailyReconciliation
  getTodayReconciliation: (employeeId: string) => DailyReconciliation | undefined
  getTodayReconciliations: () => Array<DailyReconciliation>

  // Utility
  getShopsForRoute: (routeId: string) => Array<Shop>
  searchShops: (query: string) => Array<Shop>
}

const DataStoreContext = createContext<DataStoreContextType | null>(null)

export function DataStoreProvider({ children }: { children: ReactNode }) {
  const [shops, setShops] = useState<Array<Shop>>(initialShops)
  const [routes, setRoutes] = useState<Array<Route>>(initialRoutes)
  const [employees, setEmployees] = useState<Array<Employee>>(initialEmployees)
  const [routeAssignments, setRouteAssignments] = useState<Array<RouteAssignment>>([])
  const [transactions, setTransactions] = useState<Array<Transaction>>([])
  const [reconciliations, setReconciliations] = useState<Array<DailyReconciliation>>([])

  // Shop CRUD
  const addShop = useCallback((shop: Omit<Shop, 'id'>): Shop => {
    const newShop: Shop = { ...shop, id: generateId('shop') }
    setShops((prev) => [...prev, newShop])
    return newShop
  }, [])

  const updateShop = useCallback((id: string, data: Partial<Shop>) => {
    setShops((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
  }, [])

  const deleteShop = useCallback((id: string) => {
    setShops((prev) => prev.filter((s) => s.id !== id))
    // Also remove from routes
    setRoutes((prev) =>
      prev.map((r) => ({
        ...r,
        shopIds: r.shopIds.filter((sid) => sid !== id),
      }))
    )
  }, [])

  const getShop = useCallback((id: string) => shops.find((s) => s.id === id), [shops])

  // Route CRUD
  const addRoute = useCallback((route: Omit<Route, 'id'>): Route => {
    const newRoute: Route = { ...route, id: generateId('route') }
    setRoutes((prev) => [...prev, newRoute])
    return newRoute
  }, [])

  const updateRoute = useCallback((id: string, data: Partial<Route>) => {
    setRoutes((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }, [])

  const deleteRoute = useCallback((id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const getRoute = useCallback((id: string) => routes.find((r) => r.id === id), [routes])

  // Employee CRUD
  const addEmployee = useCallback((employee: Omit<Employee, 'id'>): Employee => {
    const newEmployee: Employee = { ...employee, id: generateId('emp') }
    setEmployees((prev) => [...prev, newEmployee])
    return newEmployee
  }, [])

  const updateEmployee = useCallback((id: string, data: Partial<Employee>) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)))
  }, [])

  const toggleEmployeeStatus = useCallback((id: string) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: e.status === 'active' ? 'inactive' : 'active' } : e
      )
    )
  }, [])

  const getEmployee = useCallback((id: string) => employees.find((e) => e.id === id), [employees])

  // Route Assignments
  const assignRoute = useCallback(
    (employeeId: string, routeId: string, date?: string): RouteAssignment => {
      const assignmentDate = date || getTodayISO()
      const newAssignment: RouteAssignment = {
        id: generateId('assignment'),
        employeeId,
        routeId,
        date: assignmentDate,
        status: 'active',
      }
      setRouteAssignments((prev) => [...prev, newAssignment])
      return newAssignment
    },
    []
  )

  const getTodayAssignment = useCallback(
    (employeeId: string) => {
      const today = getTodayISO()
      return routeAssignments.find(
        (a) => a.employeeId === employeeId && a.date === today && a.status === 'active'
      )
    },
    [routeAssignments]
  )

  const getTodayAssignments = useCallback(() => {
    const today = getTodayISO()
    return routeAssignments.filter((a) => a.date === today)
  }, [routeAssignments])

  const cancelAssignment = useCallback((id: string) => {
    setRouteAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a))
    )
  }, [])

  const completeAssignment = useCallback((id: string) => {
    setRouteAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'completed' } : a))
    )
  }, [])

  // Transactions
  const logCollection = useCallback(
    (data: {
      employeeId: string
      shopId: string
      amount: number
      paymentMode: 'cash' | 'upi' | 'cheque'
      reference?: string
      gpsLocation?: { lat: number; lng: number }
    }): Transaction => {
      const newTransaction: Transaction = {
        id: generateId('txn'),
        employeeId: data.employeeId,
        shopId: data.shopId,
        amount: data.amount,
        paymentMode: data.paymentMode,
        reference: data.reference,
        timestamp: new Date().toISOString(),
        gpsLocation: data.gpsLocation || { lat: 0, lng: 0 },
        status: 'completed',
      }
      setTransactions((prev) => [...prev, newTransaction])

      // Update shop's last collection date
      setShops((prev) =>
        prev.map((s) =>
          s.id === data.shopId
            ? { ...s, lastCollectionDate: getTodayISO(), currentBalance: Math.max(0, s.currentBalance - data.amount) }
            : s
        )
      )

      return newTransaction
    },
    []
  )

  const getTodayTransactions = useCallback(
    (employeeId?: string) => {
      const today = getTodayISO()
      return transactions.filter((t) => {
        const txnDate = t.timestamp.split('T')[0]
        const matchesDate = txnDate === today
        const matchesEmployee = employeeId ? t.employeeId === employeeId : true
        return matchesDate && matchesEmployee
      })
    },
    [transactions]
  )

  const getEmployeeCashInHand = useCallback(
    (employeeId: string, date?: string) => {
      const targetDate = date || getTodayISO()
      return transactions
        .filter((t) => {
          const txnDate = t.timestamp.split('T')[0]
          return t.employeeId === employeeId && txnDate === targetDate && t.paymentMode === 'cash'
        })
        .reduce((sum, t) => sum + t.amount, 0)
    },
    [transactions]
  )

  const getAllTransactions = useCallback(() => transactions, [transactions])

  // Reconciliation
  const verifyReconciliation = useCallback(
    (employeeId: string, actualCash: number, note?: string): DailyReconciliation => {
      const today = getTodayISO()
      const expectedCash = getEmployeeCashInHand(employeeId, today)
      const variance = actualCash - expectedCash

      const newReconciliation: DailyReconciliation = {
        id: generateId('recon'),
        employeeId,
        date: today,
        expectedCash,
        actualCash,
        variance,
        status: variance === 0 ? 'verified' : 'mismatch',
        note,
        verifiedAt: new Date().toISOString(),
      }

      setReconciliations((prev) => {
        // Remove any existing reconciliation for this employee today
        const filtered = prev.filter(
          (r) => !(r.employeeId === employeeId && r.date === today)
        )
        return [...filtered, newReconciliation]
      })

      return newReconciliation
    },
    [getEmployeeCashInHand]
  )

  const getTodayReconciliation = useCallback(
    (employeeId: string) => {
      const today = getTodayISO()
      return reconciliations.find((r) => r.employeeId === employeeId && r.date === today)
    },
    [reconciliations]
  )

  const getTodayReconciliations = useCallback(() => {
    const today = getTodayISO()
    return reconciliations.filter((r) => r.date === today)
  }, [reconciliations])

  // Utility
  const getShopsForRoute = useCallback(
    (routeId: string) => {
      const route = routes.find((r) => r.id === routeId)
      if (!route) return []
      return shops.filter((s) => route.shopIds.includes(s.id))
    },
    [routes, shops]
  )

  const searchShops = useCallback(
    (query: string) => {
      const lowerQuery = query.toLowerCase()
      return shops.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerQuery) ||
          s.address.toLowerCase().includes(lowerQuery) ||
          s.zone.toLowerCase().includes(lowerQuery)
      )
    },
    [shops]
  )

  return (
    <DataStoreContext.Provider
      value={{
        shops,
        routes,
        employees,
        routeAssignments,
        transactions,
        reconciliations,
        addShop,
        updateShop,
        deleteShop,
        getShop,
        addRoute,
        updateRoute,
        deleteRoute,
        getRoute,
        addEmployee,
        updateEmployee,
        toggleEmployeeStatus,
        getEmployee,
        assignRoute,
        getTodayAssignment,
        getTodayAssignments,
        cancelAssignment,
        completeAssignment,
        logCollection,
        getTodayTransactions,
        getEmployeeCashInHand,
        getAllTransactions,
        verifyReconciliation,
        getTodayReconciliation,
        getTodayReconciliations,
        getShopsForRoute,
        searchShops,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  )
}

export function useDataStore(): DataStoreContextType {
  const context = useContext(DataStoreContext)
  if (!context) {
    throw new Error('useDataStore must be used within a DataStoreProvider')
  }
  return context
}
