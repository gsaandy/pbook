// =============================================================================
// Data Types
// =============================================================================

export interface Shop {
  id: string
  name: string
  address: string
  phone: string
  currentBalance: number
  zone: string
  lastCollectionDate: string
}

export interface Route {
  id: string
  name: string
  description: string
  shopIds: Array<string>
}

export interface Employee {
  id: string
  name: string
  phone: string
  email: string
  role: 'field_staff' | 'admin'
  status: 'active' | 'inactive'
}

// =============================================================================
// Component Props
// =============================================================================

export interface SetupAndConfigurationProps {
  /** The list of shops to display */
  shops: Array<Shop>
  /** The list of routes to display */
  routes: Array<Route>
  /** The list of employees to display */
  employees: Array<Employee>

  // Shop actions
  /** Called when user wants to add a new shop */
  onAddShop?: () => void
  /** Called when user wants to edit a shop */
  onEditShop?: (id: string) => void
  /** Called when user wants to delete a shop */
  onDeleteShop?: (id: string) => void
  /** Called when user wants to bulk import shops via CSV */
  onImportShops?: () => void

  // Route actions
  /** Called when user wants to create a new route */
  onCreateRoute?: () => void
  /** Called when user wants to edit a route */
  onEditRoute?: (id: string) => void
  /** Called when user wants to delete a route */
  onDeleteRoute?: (id: string) => void

  // Employee actions
  /** Called when user wants to add a new employee */
  onAddEmployee?: () => void
  /** Called when user wants to edit an employee */
  onEditEmployee?: (id: string) => void
  /** Called when user wants to activate/deactivate an employee */
  onToggleEmployeeStatus?: (id: string) => void
}
