// =============================================================================
// Data Types
// =============================================================================

export interface EODSummary {
  date: string
  totalCollected: number
  cashExpected: number
  digitalPayments: number
  employeesVerified: number
  employeesTotal: number
}

export interface EmployeeSettlement {
  id: string
  employeeId: string
  employeeName: string
  route: string
  expectedCash: number
  actualCash: number | null
  variance: number | null
  status: 'pending' | 'verified' | 'mismatch' | 'closed'
  verifiedAt: string | null
  note: string | null
}

export interface CashTransaction {
  id: string
  timestamp: string
  shopName: string
  amount: number
  paymentMode: 'cash'
}

export interface CashTransactionsByEmployee {
  [employeeId: string]: Array<CashTransaction>
}

export interface VerificationFormData {
  actualCash: number
  note?: string
}

// =============================================================================
// Component Props
// =============================================================================

export interface EndOfDayReconciliationProps {
  /** EOD summary for the selected date */
  eodSummary: EODSummary
  /** Settlement records for all employees */
  employeeSettlements: Array<EmployeeSettlement>
  /** Cash transactions grouped by employee ID */
  cashTransactionsByEmployee: CashTransactionsByEmployee
  /** Currently selected date */
  currentDate: string

  /** Called when user changes the date */
  onDateChange?: (date: string) => void
  /** Called when user opens verification modal for an employee */
  onOpenVerification?: (employeeId: string) => void
  /** Called when user confirms cash matches expected amount */
  onVerifyMatch?: (settlementId: string) => void
  /** Called when user reports a mismatch and submits adjustment */
  onVerifyMismatch?: (settlementId: string, data: VerificationFormData) => void
  /** Called when user wants to generate EOD report */
  onGenerateReport?: (format: 'pdf' | 'csv') => void
}
