import { useState } from 'react'
import { Calendar, MapPin, Plus, Users, X } from 'lucide-react'
import type { Employee, Route, RouteAssignment } from '@/lib/types'
import { Modal } from '@/components/modals/Modal'

export interface DailyOperationsAdminProps {
  employees: Array<Employee>
  routes: Array<Route>
  routeAssignments: Array<RouteAssignment>
  today: string
  onAssignRoute?: (employeeId: string, routeId: string) => void
  onCancelAssignment?: (assignmentId: string) => void
}

export function DailyOperationsAdmin({
  employees,
  routes,
  routeAssignments,
  today,
  onAssignRoute,
  onCancelAssignment,
}: DailyOperationsAdminProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [selectedRoute, setSelectedRoute] = useState('')

  const fieldStaff = employees.filter((e) => e.role === 'field_staff' && e.status === 'active')
  const todayAssignments = routeAssignments.filter((a) => a.date === today && a.status === 'active')

  const getEmployeeName = (employeeId: string) => {
    return employees.find((e) => e.id === employeeId)?.name || 'Unknown'
  }

  const getRouteName = (routeId: string) => {
    return routes.find((r) => r.id === routeId)?.name || 'Unknown'
  }

  const isEmployeeAssigned = (employeeId: string) => {
    return todayAssignments.some((a) => a.employeeId === employeeId)
  }

  const handleAssign = () => {
    if (selectedEmployee && selectedRoute) {
      onAssignRoute?.(selectedEmployee, selectedRoute)
      setAssignModalOpen(false)
      setSelectedEmployee('')
      setSelectedRoute('')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Daily Operations
            </h1>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(today)}
            </p>
          </div>
          <button
            onClick={() => setAssignModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Assign Route
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Field Staff</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{fieldStaff.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Today's Assignments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{todayAssignments.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Unassigned</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {fieldStaff.length - todayAssignments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Assignments */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Today's Assignments
            </h2>
          </div>

          {todayAssignments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No routes assigned for today yet.
              </p>
              <button
                onClick={() => setAssignModalOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Assign First Route
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {todayAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {getEmployeeName(assignment.employeeId).charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        {getEmployeeName(assignment.employeeId)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {getRouteName(assignment.routeId)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      assignment.status === 'active'
                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : assignment.status === 'completed'
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                    {assignment.status === 'active' && onCancelAssignment && (
                      <button
                        onClick={() => onCancelAssignment(assignment.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        aria-label="Cancel assignment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Assign Route Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false)
          setSelectedEmployee('')
          setSelectedRoute('')
        }}
        title="Assign Route"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose an employee...</option>
              {fieldStaff.map((emp) => (
                <option key={emp.id} value={emp.id} disabled={isEmployeeAssigned(emp.id)}>
                  {emp.name} {isEmployeeAssigned(emp.id) ? '(Already assigned)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Route
            </label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Choose a route...</option>
              {routes.map((route) => (
                <option key={route.id} value={route.id}>
                  {route.name} ({route.shopIds.length} shops)
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                setAssignModalOpen(false)
                setSelectedEmployee('')
                setSelectedRoute('')
              }}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={!selectedEmployee || !selectedRoute}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Route
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
