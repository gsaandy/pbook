import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { DailyOperationsAdmin } from './-components/DailyOperationsAdmin'
import type { Employee, RouteAssignment, Route as RouteType } from '~/lib/types'
import type { Id } from '~/convex/_generated/dataModel'
import {
  employeeQueries,
  routeAssignmentQueries,
  routeQueries,
  useAssignRouteMutation,
  useCancelAssignmentMutation,
} from '~/queries'
import { EmployeeRole, Status } from '~/lib/constants'

export const Route = createFileRoute('/_authed/operations')({
  component: OperationsPage,
  loader: async ({ context: { queryClient } }) => {
    const today = new Date().toISOString().split('T')[0]
    await Promise.all([
      queryClient.ensureQueryData(employeeQueries.list()),
      queryClient.ensureQueryData(routeQueries.listWithShopCounts()),
      queryClient.ensureQueryData(routeAssignmentQueries.byDate(today)),
    ])
  },
})

// Adapter functions
function adaptEmployee(employee: {
  _id: Id<'employees'>
  name: string
  phone?: string
  email: string
  role: 'field_staff' | 'admin' | 'super_admin'
  deletedAt?: number
}): Employee {
  return {
    id: employee._id,
    name: employee.name,
    phone: employee.phone ?? '',
    email: employee.email,
    role:
      employee.role === EmployeeRole.SUPER_ADMIN
        ? EmployeeRole.ADMIN
        : employee.role,
    status: employee.deletedAt ? Status.INACTIVE : Status.ACTIVE,
  }
}

function adaptRoute(route: {
  _id: Id<'routes'>
  name: string
  description?: string
  shopCount: number
}): RouteType {
  // Create a fake shopIds array with the correct length for the UI
  return {
    id: route._id,
    name: route.name,
    description: route.description ?? '',
    shopIds: Array(route.shopCount).fill(''),
  }
}

function adaptAssignment(assignment: {
  _id: Id<'routeAssignments'>
  employeeId: Id<'employees'>
  routeId: Id<'routes'>
  date: string
  status: 'active' | 'completed' | 'cancelled'
}): RouteAssignment {
  return {
    id: assignment._id,
    employeeId: assignment.employeeId,
    routeId: assignment.routeId,
    date: assignment.date,
    status: assignment.status,
  }
}

function OperationsPage() {
  const today = new Date().toISOString().split('T')[0]

  // Fetch data from Convex
  const { data: convexEmployees } = useSuspenseQuery(employeeQueries.list())
  const { data: convexRoutes } = useSuspenseQuery(
    routeQueries.listWithShopCounts(),
  )
  const { data: convexAssignments } = useSuspenseQuery(
    routeAssignmentQueries.byDate(today),
  )

  // Adapt data
  const employees = convexEmployees.map(adaptEmployee)
  const routes = convexRoutes.map(adaptRoute)
  const routeAssignments = convexAssignments.map(adaptAssignment)

  // Mutations
  const assignRouteMutation = useAssignRouteMutation()
  const cancelAssignmentMutation = useCancelAssignmentMutation()

  // Admin view: Route assignment interface
  const handleAssignRoute = (employeeId: string, routeId: string) => {
    assignRouteMutation.mutate({
      employeeId: employeeId as Id<'employees'>,
      routeId: routeId as Id<'routes'>,
      date: today,
    })
  }

  const handleCancelAssignment = (assignmentId: string) => {
    cancelAssignmentMutation.mutate({
      id: assignmentId as Id<'routeAssignments'>,
    })
  }

  return (
    <DailyOperationsAdmin
      employees={employees}
      routes={routes}
      routeAssignments={routeAssignments}
      today={today}
      onAssignRoute={handleAssignRoute}
      onCancelAssignment={handleCancelAssignment}
    />
  )
}
