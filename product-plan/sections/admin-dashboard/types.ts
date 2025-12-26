// =============================================================================
// Data Types
// =============================================================================

export interface Summary {
  totalCollected: number
  cashInHand: number
  digitalPayments: number
  lastUpdated: string
}

export interface EmployeeStatus {
  id: string
  name: string
  route: string | null
  collectionsCount: number
  cashInHand: number
  lastActivity: string | null
  status: 'active' | 'delayed' | 'idle'
}

export interface Transaction {
  id: string
  timestamp: string
  shopName: string
  amount: number
  paymentMode: 'cash' | 'upi' | 'cheque'
  reference: string | null
  gpsLocation: {
    lat: number
    lng: number
  }
}

export interface EmployeeTransactions {
  [employeeId: string]: Transaction[]
}

// =============================================================================
// Component Props
// =============================================================================

export interface AdminDashboardProps {
  /** Summary metrics for today */
  summary: Summary
  /** Status of all employees */
  employeeStatus: EmployeeStatus[]
  /** Transactions grouped by employee ID */
  employeeTransactions: EmployeeTransactions
  /** Current date being viewed */
  currentDate: string
  /** Whether the dashboard is auto-refreshing */
  isRefreshing?: boolean

  /** Called when user manually refreshes the dashboard */
  onRefresh?: () => void
  /** Called when user changes the date */
  onDateChange?: (date: string) => void
  /** Called when user clicks an employee to view details */
  onViewEmployeeDetails?: (employeeId: string) => void
  /** Called when user wants to export the dashboard data */
  onExport?: (format: 'pdf' | 'csv') => void
  /** Called when user clicks on a transaction */
  onViewTransaction?: (transactionId: string) => void
}
