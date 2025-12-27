import {
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { UserButton } from '@clerk/tanstack-react-start'
import type { NavigationItem } from '~/lib/types'
import { AppShell } from '~/components/shell'
import { SignInPage } from '~/components/auth/SignInPage'
import { employeeQueries } from '~/queries'
import { EmployeeRole } from '~/lib/constants'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw new Error('Not authenticated')
    }
  },
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(employeeQueries.current())
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return <SignInPage />
    }
    throw error
  },
  component: AuthedLayout,
})

// Navigation items for admins
const adminNavItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Collections', href: '/operations' },
  { label: 'Deliveries', href: '/invoices' },
  { label: 'Shops & Team', href: '/setup' },
  { label: 'Handovers', href: '/settlements' },
  { label: 'History', href: '/reports' },
]

// Navigation items for field staff (limited access)
const fieldStaffNavItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Collections', href: '/operations' },
]

function AuthedLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: currentEmployee } = useSuspenseQuery(employeeQueries.current())

  const isFieldStaff = currentEmployee?.role === EmployeeRole.FIELD_STAFF

  // Get appropriate nav items based on role
  const baseNavItems = isFieldStaff ? fieldStaffNavItems : adminNavItems
  const navigationItems: Array<NavigationItem> = baseNavItems.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  const handleNavigate = (href: string) => {
    navigate({ to: href })
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      onNavigate={handleNavigate}
      userButton={
        <UserButton
          appearance={{
            elements: {
              // Hide the "Manage account" button in the dropdown
              userButtonPopoverActionButton__manageAccount: {
                display: 'none',
              },
            },
          }}
        />
      }
      variant={isFieldStaff ? 'field_staff' : 'admin'}
    >
      <Outlet />
    </AppShell>
  )
}
