import { createFileRoute } from '@tanstack/react-router'
import { useDataStore } from '@/lib/data-store'
import { DailyOperationsAdmin } from '@/components/sections/DailyOperationsAdmin'

export const Route = createFileRoute('/_authed/operations')({
  component: OperationsPage,
})

function OperationsPage() {
  const {
    employees,
    routes,
    getTodayAssignments,
    assignRoute,
    cancelAssignment,
  } = useDataStore()

  const today = new Date().toISOString().split('T')[0]

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
