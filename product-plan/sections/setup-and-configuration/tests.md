# Test Instructions: Setup & Configuration

These test-writing instructions are **framework-agnostic**. Adapt them to your testing setup.

## User Flow Tests

### Flow 1: Add a New Shop

**Success Path:**

1. User clicks "Add Shop" button
2. User fills in shop name, address, phone, zone
3. User clicks "Save"
4. Expected: Shop appears in the list, success message shown

**Failure Path - Validation:**

1. User leaves required field empty
2. User clicks "Save"
3. Expected: Validation error shown, form not submitted

### Flow 2: Create a Route

**Success Path:**

1. User clicks "Add Route" button
2. User enters route name and description
3. User selects shops from checklist
4. User clicks "Create"
5. Expected: Route appears in list with correct shop count

### Flow 3: Manage Employees

**Success Path:**

1. User clicks "Add Employee"
2. User fills in name, phone, email, role
3. User clicks "Save"
4. Expected: Employee appears in active employees list

**Deactivate Employee:**

1. User clicks deactivate icon on employee
2. User confirms action
3. Expected: Employee status changes to inactive, preserved in system

## Empty State Tests

- **No shops yet:** Shows "No shops yet. Add your first shop or import from CSV" with visible CTA button
- **No routes yet:** Shows helpful empty state with "Create Route" button
- **No employees yet:** Shows empty state with "Add Employee" button

## Component Interaction Tests

- Search filters shops/routes/employees correctly
- CSV import validates data and shows errors for invalid rows
- Delete confirmation dialog appears and cancels/proceeds correctly
- Tabs switch between Shops, Routes, Employees views
- Tables are sortable by all columns
- Mobile: tables convert to stacked cards

## Edge Cases

- Very long shop names truncate with ellipsis
- Handles 1 shop and 100+ shops without performance issues
- Route with no shops shows "0 shops" correctly
- Inactive employees don't show in assignment dropdowns
