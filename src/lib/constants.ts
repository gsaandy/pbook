/**
 * Application-wide constants
 */

// Locale and currency settings
export const LOCALE = 'en-IN' as const
export const CURRENCY = 'INR' as const

// Balance thresholds for UI coloring
export const BalanceThreshold = {
  HIGH: 10000, // Red - high balance needs attention
  LOW: 0, // Green - no balance (fully collected)
} as const

// Payment modes
export const PaymentMode = {
  CASH: 'cash',
  UPI: 'upi',
  CHEQUE: 'cheque',
} as const

export const PaymentModeLabel: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  cheque: 'Cheque',
} as const

// Employee roles
export const EmployeeRole = {
  FIELD_STAFF: 'field_staff',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const

export const EmployeeRoleLabel: Record<string, string> = {
  field_staff: 'Field Staff',
  admin: 'Admin',
  super_admin: 'Super Admin',
} as const

// Employee/entity statuses
export const Status = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  VERIFIED: 'verified',
  MISMATCH: 'mismatch',
  REVERSED: 'reversed',
} as const

// Transaction statuses
export const TransactionStatus = {
  COMPLETED: 'completed',
  ADJUSTED: 'adjusted',
  REVERSED: 'reversed',
} as const

// Invoice statuses
export const InvoiceStatus = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled',
} as const

// Route assignment statuses
export const AssignmentStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Reconciliation statuses
export const ReconciliationStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  MISMATCH: 'mismatch',
} as const

// Time intervals (in milliseconds)
export const TimeInterval = {
  AUTO_REFRESH: 30000, // 30 seconds
  ACTIVITY_THRESHOLD_ACTIVE: 1, // hours - considered "active"
  ACTIVITY_THRESHOLD_DELAYED: 3, // hours - considered "delayed"
} as const

// UI Configuration
export const UiConfig = {
  DATE_FORMAT_OPTIONS: {
    day: 'numeric',
    month: 'short',
  } as Intl.DateTimeFormatOptions,
  DATE_FORMAT_LONG: {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  } as Intl.DateTimeFormatOptions,
  CURRENCY_FORMAT_OPTIONS: {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 0,
  } as Intl.NumberFormatOptions,
} as const

/**
 * Format currency using application locale and currency settings
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(LOCALE, UiConfig.CURRENCY_FORMAT_OPTIONS).format(
    amount,
  )
}

/**
 * Format date using application locale
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = UiConfig.DATE_FORMAT_OPTIONS,
): string {
  return new Date(dateString).toLocaleDateString(LOCALE, options)
}

/**
 * Format date in long format
 */
export function formatDateLong(dateString: string): string {
  return new Date(dateString).toLocaleDateString(
    LOCALE,
    UiConfig.DATE_FORMAT_LONG,
  )
}

/**
 * Get balance color class based on amount
 */
export function getBalanceColorClass(balance: number): string {
  if (balance > BalanceThreshold.HIGH) {
    return 'text-red-600 dark:text-red-400'
  }
  if (balance > BalanceThreshold.LOW) {
    return 'text-amber-600 dark:text-amber-400'
  }
  return 'text-emerald-600 dark:text-emerald-400'
}
