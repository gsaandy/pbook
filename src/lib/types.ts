// PSBook Data Model Types

export interface Organization {
  id: string
  name: string
  createdAt: string
}

export interface Shop {
  id: string
  name: string
  address: string
  phone: string
  currentBalance: number
  zone: string
  lastCollectionDate: string
}

export interface Employee {
  id: string
  name: string
  phone: string
  email: string
  role: 'field_staff' | 'admin'
  status: 'active' | 'inactive'
}

export interface Route {
  id: string
  name: string
  description: string
  shopIds: Array<string>
}

export interface RouteAssignment {
  id: string
  employeeId: string
  routeId: string
  date: string // ISO 8601 date
  status: 'active' | 'completed' | 'cancelled'
}

export interface Transaction {
  id: string
  employeeId: string
  shopId: string
  amount: number
  paymentMode: 'cash' | 'upi' | 'cheque'
  reference?: string // For UPI/Cheque
  timestamp: string // ISO 8601 datetime
  gpsLocation: {
    lat: number
    lng: number
  }
  status: 'completed' | 'adjusted' | 'reversed'
}

export interface PaymentMode {
  id: 'cash' | 'upi' | 'cheque'
  label: string
  icon: string
}

export interface DailyReconciliation {
  id: string
  employeeId: string
  date: string // ISO 8601 date
  expectedCash: number
  actualCash: number
  variance: number
  status: 'pending' | 'verified' | 'mismatch'
  note?: string
  verifiedAt?: string // ISO 8601 datetime
}

export interface Invoice {
  id: string
  shopId: string
  amount: number
  invoiceNumber: string
  invoiceDate: string // ISO 8601 date
  reference: string
  createdAt: string // ISO 8601 datetime
  createdBy: string // Employee ID
  status: 'active' | 'cancelled'
}

// Extended types for UI components

export interface NavigationItem {
  label: string
  href: string
  isActive?: boolean
}

export interface User {
  name: string
  avatarUrl?: string
}

// Auth user type (extends Employee with password for mock auth)
export interface AuthUser extends Employee {
  password: string
}
