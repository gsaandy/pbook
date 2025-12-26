// =============================================================================
// Data Types
// =============================================================================

export interface Transaction {
  id: string
  timestamp: string
  employeeName: string
  shopName: string
  amount: number
  paymentMode: 'cash' | 'upi' | 'cheque'
  reference: string | null
  status: 'completed' | 'adjusted' | 'reversed'
  gpsLocation: {
    lat: number
    lng: number
  }
}

export interface ReconciliationEvent {
  id: string
  date: string
  employeeName: string
  expectedCash: number
  actualCash: number
  variance: number
  status: 'verified' | 'mismatch'
  note: string | null
  verifiedAt: string
}

export interface DailyCollection {
  date: string
  amount: number
}

export interface EmployeePerformance {
  employeeName: string
  totalCollected: number
}

export interface PaymentModeDistribution {
  mode: string
  amount: number
  percentage: number
}

export interface TopShop {
  shopName: string
  totalCollected: number
}

export interface TrendData {
  dailyCollections: DailyCollection[]
  employeePerformance: EmployeePerformance[]
  paymentModeDistribution: PaymentModeDistribution[]
  topShops: TopShop[]
}

export interface FilterOption {
  id: string
  name: string
}

export interface FilterOptions {
  employees: FilterOption[]
  shops: FilterOption[]
  paymentModes: string[]
}

export interface TransactionFilters {
  dateRange?: { start: string; end: string }
  employeeId?: string
  shopId?: string
  paymentMode?: 'cash' | 'upi' | 'cheque'
  amountRange?: { min: number; max: number }
  searchQuery?: string
}

export interface ReportConfig {
  type: 'daily_summary' | 'employee_performance' | 'shop_collections' | 'payment_mode_breakdown'
  dateRange: { start: string; end: string }
}

// =============================================================================
// Component Props
// =============================================================================

export interface ReportsAndHistoryProps {
  /** All transactions matching current filters */
  transactions: Transaction[]
  /** Reconciliation events for audit trail */
  reconciliationEvents: ReconciliationEvent[]
  /** Trend data for charts and analytics */
  trendData: TrendData
  /** Available filter options */
  filterOptions: FilterOptions
  /** Current active filters */
  currentFilters: TransactionFilters
  /** Current date range */
  dateRange: { start: string; end: string }

  /** Called when user changes filters */
  onFilterChange?: (filters: TransactionFilters) => void
  /** Called when user changes date range */
  onDateRangeChange?: (range: { start: string; end: string }) => void
  /** Called when user clicks a transaction to view details */
  onViewTransaction?: (transactionId: string) => void
  /** Called when user wants to generate a report */
  onGenerateReport?: (config: ReportConfig, format: 'pdf' | 'csv') => void
  /** Called when user wants to preview a report */
  onPreviewReport?: (config: ReportConfig) => void
  /** Called when user wants to export transaction data */
  onExportTransactions?: (format: 'pdf' | 'csv' | 'excel') => void
  /** Called when user clears all filters */
  onClearFilters?: () => void
  /** Called when user views reconciliation event details */
  onViewReconciliation?: (eventId: string) => void
}
