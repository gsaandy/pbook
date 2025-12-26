// =============================================================================
// Data Types
// =============================================================================

export interface RouteAssignment {
  id: string
  employeeId: string
  employeeName: string
  routeId: string
  routeName: string
  date: string
  status: 'active' | 'completed' | 'cancelled'
}

export interface Employee {
  id: string
  name: string
  role: 'field_staff' | 'admin'
}

export interface Route {
  id: string
  name: string
  description: string
  shopCount: number
}

export interface Shop {
  id: string
  name: string
  address: string
  currentBalance: number
  lastCollectionDate: string
}

export interface CurrentEmployee {
  id: string
  name: string
  role: 'field_staff' | 'admin'
  cashInBag: number
}

export interface AssignedRoute {
  id: string
  name: string
  description: string
  shops: Shop[]
}

export interface PaymentMode {
  id: 'cash' | 'upi' | 'cheque'
  label: string
  icon: string
}

export interface CollectionFormData {
  shopId: string
  amount: number
  paymentMode: 'cash' | 'upi' | 'cheque'
  reference?: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface DailyOperationsAdminProps {
  /** List of all employees */
  employees: Employee[]
  /** List of available routes */
  routes: Route[]
  /** Current route assignments for today */
  routeAssignments: RouteAssignment[]
  /** Today's date */
  today: string

  /** Called when admin assigns a route to an employee */
  onAssignRoute?: (employeeId: string, routeId: string, date: string) => void
  /** Called when admin wants to view assignment details */
  onViewAssignment?: (assignmentId: string) => void
  /** Called when admin wants to cancel an assignment */
  onCancelAssignment?: (assignmentId: string) => void
}

export interface DailyOperationsFieldStaffProps {
  /** Current logged-in employee */
  currentEmployee: CurrentEmployee
  /** The route assigned to this employee for today */
  assignedRoute: AssignedRoute | null
  /** Available payment modes */
  paymentModes: PaymentMode[]

  /** Called when field staff logs a collection */
  onLogCollection?: (data: CollectionFormData) => void
  /** Called when field staff searches for a shop */
  onSearchShop?: (query: string) => void
  /** Called when field staff views shop details */
  onViewShop?: (shopId: string) => void
}
