import { describe, test, expect, mock } from 'bun:test'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetupAndConfiguration } from './SetupAndConfiguration'
import type { Shop, Route, Employee } from '~/lib/types'

// Import setup
import '~/test/setup'

// Mock data
const mockShops: Shop[] = [
  {
    id: 'shop_1',
    code: '67063100001',
    name: 'Cochin Bakery',
    addressLine1: '123 Main St',
    city: 'Kannur',
    state: 'Kerala',
    phone: '9876543210',
    zone: 'Kannur',
    currentBalance: 5000,
  },
  {
    id: 'shop_2',
    code: '67063100002',
    name: 'MarginFree Market',
    addressLine1: '456 Oak Ave',
    city: 'Kannur',
    state: 'Kerala',
    phone: '9876543211',
    zone: 'Kannur',
    currentBalance: 10000,
  },
  {
    id: 'shop_3',
    code: '67063100003',
    name: 'Ashrayam Pharmacy',
    addressLine1: '789 Pine Rd',
    city: 'Thalassery',
    state: 'Kerala',
    phone: '9876543212',
    zone: 'Thalassery',
    currentBalance: 0,
  },
]

const mockRoutes: Route[] = [
  {
    id: 'route_1',
    name: 'Kannur Route',
    description: 'Main route for Kannur area',
    shopIds: ['shop_1', 'shop_2'],
  },
  {
    id: 'route_2',
    name: 'Thalassery Route',
    description: 'Route for Thalassery shops',
    shopIds: ['shop_3'],
  },
]

const mockEmployees: Employee[] = [
  {
    id: 'emp_1',
    name: 'John Doe',
    phone: '9876543210',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
  },
  {
    id: 'emp_2',
    name: 'Jane Smith',
    phone: '9876543211',
    email: 'jane@example.com',
    role: 'field_staff',
    status: 'active',
  },
  {
    id: 'emp_3',
    name: 'Bob Wilson',
    phone: '9876543212',
    email: 'bob@example.com',
    role: 'field_staff',
    status: 'inactive',
  },
]

describe('SetupAndConfiguration', () => {
  describe('rendering', () => {
    test('renders page header', () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      expect(screen.getByText('Setup & Configuration')).toBeDefined()
      expect(
        screen.getByText('Manage your shops, routes, and team members'),
      ).toBeDefined()
    })

    test('renders tab buttons with counts', () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      expect(screen.getByText(`Shops (${mockShops.length})`)).toBeDefined()
      expect(screen.getByText(`Routes (${mockRoutes.length})`)).toBeDefined()
      expect(
        screen.getByText(`Employees (${mockEmployees.length})`),
      ).toBeDefined()
    })

    test('renders shops tab by default', () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      // Should show shop data (getAllBy because of desktop + mobile views)
      expect(screen.getAllByText('Cochin Bakery').length).toBeGreaterThan(0)
      expect(screen.getAllByText('MarginFree Market').length).toBeGreaterThan(0)
    })
  })

  describe('tabs navigation', () => {
    test('switches to routes tab when clicked', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const routesTab = screen.getByText(`Routes (${mockRoutes.length})`)
      await userEvent.click(routesTab)

      expect(screen.getAllByText('Kannur Route').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Thalassery Route').length).toBeGreaterThan(0)
    })

    test('switches to employees tab when clicked', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const employeesTab = screen.getByText(
        `Employees (${mockEmployees.length})`,
      )
      await userEvent.click(employeesTab)

      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0)
    })

    test('clears search when switching tabs', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      // Type in search
      const searchInput = screen.getByPlaceholderText('Search shops...')
      await userEvent.type(searchInput, 'Cochin')

      // Switch to routes tab
      const routesTab = screen.getByText(`Routes (${mockRoutes.length})`)
      await userEvent.click(routesTab)

      // Search should be cleared and placeholder changed
      const newSearchInput = screen.getByPlaceholderText('Search routes...')
      expect((newSearchInput as HTMLInputElement).value).toBe('')
    })
  })

  describe('shops tab', () => {
    test('displays shop code in table', () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      expect(screen.getAllByText('67063100001').length).toBeGreaterThan(0)
      expect(screen.getAllByText('67063100002').length).toBeGreaterThan(0)
    })

    test('displays shop zone', () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      // Zone badges
      const kannurBadges = screen.getAllByText('Kannur')
      expect(kannurBadges.length).toBeGreaterThan(0)
    })

    test('filters shops by name', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const searchInput = screen.getByPlaceholderText('Search shops...')
      await userEvent.type(searchInput, 'Cochin')

      await waitFor(() => {
        expect(screen.getAllByText('Cochin Bakery').length).toBeGreaterThan(0)
        expect(screen.queryByText('MarginFree Market')).toBeNull()
      })
    })

    test('filters shops by code', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const searchInput = screen.getByPlaceholderText('Search shops...')
      await userEvent.type(searchInput, '67063100002')

      await waitFor(() => {
        expect(screen.getAllByText('MarginFree Market').length).toBeGreaterThan(0)
        expect(screen.queryByText('Cochin Bakery')).toBeNull()
      })
    })

    test('filters shops by zone', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const searchInput = screen.getByPlaceholderText('Search shops...')
      await userEvent.type(searchInput, 'Thalassery')

      await waitFor(() => {
        expect(screen.getAllByText('Ashrayam Pharmacy').length).toBeGreaterThan(0)
        expect(screen.queryByText('Cochin Bakery')).toBeNull()
      })
    })

    test('shows empty state when no shops match search', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const searchInput = screen.getByPlaceholderText('Search shops...')
      await userEvent.type(searchInput, 'NonexistentShop')

      await waitFor(() => {
        expect(screen.getByText('No shops match your search.')).toBeDefined()
      })
    })

    test('calls onAddShop when Add Shop button is clicked', async () => {
      const onAddShop = mock(() => {})

      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
          onAddShop={onAddShop}
        />,
      )

      const addButton = screen.getByText('Add Shop')
      await userEvent.click(addButton)

      expect(onAddShop).toHaveBeenCalled()
    })

    test('calls onEditShop when edit button is clicked', async () => {
      const onEditShop = mock(() => {})

      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
          onEditShop={onEditShop}
        />,
      )

      const editButtons = screen.getAllByLabelText('Edit shop')
      await userEvent.click(editButtons[0])

      expect(onEditShop).toHaveBeenCalledWith('shop_1')
    })

    test('calls onDeleteShop when delete button is clicked', async () => {
      const onDeleteShop = mock(() => {})

      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
          onDeleteShop={onDeleteShop}
        />,
      )

      const deleteButtons = screen.getAllByLabelText('Delete shop')
      await userEvent.click(deleteButtons[0])

      expect(onDeleteShop).toHaveBeenCalledWith('shop_1')
    })
  })

  describe('routes tab', () => {
    test('displays route name and description', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const routesTab = screen.getByText(`Routes (${mockRoutes.length})`)
      await userEvent.click(routesTab)

      expect(screen.getAllByText('Kannur Route').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Main route for Kannur area').length).toBeGreaterThan(0)
    })

    test('displays shop count for each route', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const routesTab = screen.getByText(`Routes (${mockRoutes.length})`)
      await userEvent.click(routesTab)

      expect(screen.getByText('2 shops')).toBeDefined()
      expect(screen.getByText('1 shops')).toBeDefined()
    })

    test('calls onCreateRoute when Create Route button is clicked', async () => {
      const onCreateRoute = mock(() => {})

      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
          onCreateRoute={onCreateRoute}
        />,
      )

      const routesTab = screen.getByText(`Routes (${mockRoutes.length})`)
      await userEvent.click(routesTab)

      const createButton = screen.getByText('Create Route')
      await userEvent.click(createButton)

      expect(onCreateRoute).toHaveBeenCalled()
    })
  })

  describe('employees tab', () => {
    test('displays employee name and contact', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const employeesTab = screen.getByText(
        `Employees (${mockEmployees.length})`,
      )
      await userEvent.click(employeesTab)

      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
      expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0)
    })

    test('displays employee role badge', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const employeesTab = screen.getByText(
        `Employees (${mockEmployees.length})`,
      )
      await userEvent.click(employeesTab)

      // Admin badge appears twice (desktop + mobile)
      const adminBadges = screen.getAllByText('Admin')
      expect(adminBadges.length).toBeGreaterThan(0)
      // Multiple field staff (2 employees * 2 views = 4)
      const fieldStaffBadges = screen.getAllByText('Field Staff')
      expect(fieldStaffBadges.length).toBeGreaterThanOrEqual(2)
    })

    test('displays employee status', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const employeesTab = screen.getByText(
        `Employees (${mockEmployees.length})`,
      )
      await userEvent.click(employeesTab)

      // Active status badges (2 active employees * 2 views = 4)
      const activeBadges = screen.getAllByText('Active')
      expect(activeBadges.length).toBeGreaterThanOrEqual(2)

      // Inactive status badge (1 inactive employee * 2 views = 2)
      const inactiveBadges = screen.getAllByText('Inactive')
      expect(inactiveBadges.length).toBeGreaterThan(0)
    })

    test('filters employees by name', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const employeesTab = screen.getByText(
        `Employees (${mockEmployees.length})`,
      )
      await userEvent.click(employeesTab)

      const searchInput = screen.getByPlaceholderText('Search employees...')
      await userEvent.type(searchInput, 'John')

      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
        expect(screen.queryByText('Jane Smith')).toBeNull()
      })
    })

    test('filters employees by email', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const employeesTab = screen.getByText(
        `Employees (${mockEmployees.length})`,
      )
      await userEvent.click(employeesTab)

      const searchInput = screen.getByPlaceholderText('Search employees...')
      await userEvent.type(searchInput, 'jane@')

      await waitFor(() => {
        expect(screen.getAllByText('Jane Smith').length).toBeGreaterThan(0)
        expect(screen.queryByText('John Doe')).toBeNull()
      })
    })

    test('calls onAddEmployee when Add Employee button is clicked', async () => {
      const onAddEmployee = mock(() => {})

      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={mockEmployees}
          onAddEmployee={onAddEmployee}
        />,
      )

      const employeesTab = screen.getByText(
        `Employees (${mockEmployees.length})`,
      )
      await userEvent.click(employeesTab)

      const addButton = screen.getByText('Add Employee')
      await userEvent.click(addButton)

      expect(onAddEmployee).toHaveBeenCalled()
    })
  })

  describe('pagination', () => {
    test('paginates shops when more than 20', async () => {
      // Create 25 shops
      const manyShops: Shop[] = Array.from({ length: 25 }, (_, i) => ({
        id: `shop_${i}`,
        code: `CODE${String(i).padStart(5, '0')}`,
        name: `Shop ${i}`,
        addressLine1: 'Test Address',
        city: 'Test City',
        state: 'Kerala',
        phone: '1234567890',
        zone: 'Zone A',
        currentBalance: 1000,
      }))

      render(
        <SetupAndConfiguration
          shops={manyShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      // Should show pagination info
      expect(screen.getByText(/Showing 1-20 of 25 shops/)).toBeDefined()

      // Should show page info
      expect(screen.getByText('Page 1 of 2')).toBeDefined()
    })

    test('navigates to next page', async () => {
      const manyShops: Shop[] = Array.from({ length: 25 }, (_, i) => ({
        id: `shop_${i}`,
        code: `CODE${String(i).padStart(5, '0')}`,
        name: `Shop ${i}`,
        addressLine1: 'Test Address',
        city: 'Test City',
        state: 'Kerala',
        phone: '1234567890',
        zone: 'Zone A',
        currentBalance: 1000,
      }))

      render(
        <SetupAndConfiguration
          shops={manyShops}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      const nextButton = screen.getByLabelText('Next page')
      await userEvent.click(nextButton)

      expect(screen.getByText('Page 2 of 2')).toBeDefined()
      expect(screen.getByText(/Showing 21-25 of 25 shops/)).toBeDefined()
    })
  })

  describe('empty states', () => {
    test('shows empty state when no shops', () => {
      render(
        <SetupAndConfiguration
          shops={[]}
          routes={mockRoutes}
          employees={mockEmployees}
        />,
      )

      expect(
        screen.getByText('No shops yet. Add your first shop or import from CSV.'),
      ).toBeDefined()
    })

    test('shows empty state when no routes', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={[]}
          employees={mockEmployees}
        />,
      )

      const routesTab = screen.getByText('Routes (0)')
      await userEvent.click(routesTab)

      expect(
        screen.getByText('No routes yet. Create your first route.'),
      ).toBeDefined()
    })

    test('shows empty state when no employees', async () => {
      render(
        <SetupAndConfiguration
          shops={mockShops}
          routes={mockRoutes}
          employees={[]}
        />,
      )

      const employeesTab = screen.getByText('Employees (0)')
      await userEvent.click(employeesTab)

      expect(
        screen.getByText('No employees yet. Add your first employee.'),
      ).toBeDefined()
    })
  })
})
