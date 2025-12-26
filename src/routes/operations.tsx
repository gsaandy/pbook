'use client'

import { createFileRoute } from '@tanstack/react-router'
import type { PaymentMode } from '@/lib/types'
import type {CollectionFormData} from '@/components/sections/DailyOperationsFieldStaff';
import { useAuth } from '@/lib/auth'
import { useDataStore } from '@/lib/data-store'
import { DailyOperationsAdmin } from '@/components/sections/DailyOperationsAdmin'
import {  DailyOperationsFieldStaff } from '@/components/sections/DailyOperationsFieldStaff'

export const Route = createFileRoute('/operations')({
  component: OperationsPage,
})

const PAYMENT_MODES: Array<PaymentMode> = [
  { id: 'cash', label: 'Cash', icon: 'banknote' },
  { id: 'upi', label: 'UPI', icon: 'smartphone' },
  { id: 'cheque', label: 'Cheque', icon: 'file-text' },
]

function OperationsPage() {
  const { isAdmin, currentUser } = useAuth()
  const {
    employees,
    routes,
    getTodayAssignment,
    getTodayAssignments,
    getShopsForRoute,
    getRoute,
    assignRoute,
    cancelAssignment,
    logCollection,
    getEmployeeCashInHand,
  } = useDataStore()

  const today = new Date().toISOString().split('T')[0]

  if (isAdmin) {
    // Admin view: Route assignment interface
    const handleAssignRoute = (employeeId: string, routeId: string) => {
      assignRoute(employeeId, routeId, today)
    }

    const handleCancelAssignment = (assignmentId: string) => {
      cancelAssignment(assignmentId)
    }

    return (
      <DailyOperationsAdmin
        employees={employees}
        routes={routes}
        routeAssignments={getTodayAssignments()}
        today={today}
        onAssignRoute={handleAssignRoute}
        onCancelAssignment={handleCancelAssignment}
      />
    )
  }

  // Field staff view: Collection logging interface
  if (!currentUser) {
    return null
  }

  const todayAssignment = getTodayAssignment(currentUser.id)
  const assignedRoute = todayAssignment ? getRoute(todayAssignment.routeId) : null
  const routeShops = assignedRoute ? getShopsForRoute(assignedRoute.id) : []
  const cashInBag = getEmployeeCashInHand(currentUser.id)

  const handleLogCollection = (data: CollectionFormData) => {
    // Get GPS location (optional, won't validate)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          logCollection({
            employeeId: currentUser.id,
            shopId: data.shopId,
            amount: data.amount,
            paymentMode: data.paymentMode,
            reference: data.reference,
            gpsLocation: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          })
        },
        () => {
          // GPS failed, log without location
          logCollection({
            employeeId: currentUser.id,
            shopId: data.shopId,
            amount: data.amount,
            paymentMode: data.paymentMode,
            reference: data.reference,
          })
        }
      )
    } else {
      // No geolocation support
      logCollection({
        employeeId: currentUser.id,
        shopId: data.shopId,
        amount: data.amount,
        paymentMode: data.paymentMode,
        reference: data.reference,
      })
    }
  }

  return (
    <DailyOperationsFieldStaff
      currentEmployee={{
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
        cashInBag,
      }}
      assignedRoute={
        assignedRoute
          ? {
              id: assignedRoute.id,
              name: assignedRoute.name,
              description: assignedRoute.description,
              shops: routeShops,
            }
          : null
      }
      paymentModes={PAYMENT_MODES}
      onLogCollection={handleLogCollection}
    />
  )
}
