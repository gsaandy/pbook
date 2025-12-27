import {
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { UserButton } from '@clerk/tanstack-react-start'
import type { NavigationGroup, NavigationItem } from '~/lib/types'
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

// Navigation groups for admins
const adminNavGroups: Array<NavigationGroup> = [
  {
    title: 'Daily Operations',
    items: [
      { label: 'Home', href: '/home' },
      { label: 'Collections', href: '/collections' },
      { label: 'Bills', href: '/bills' },
    ],
  },
  {
    title: 'End of Day',
    items: [{ label: 'Handovers', href: '/handovers' }],
  },
  {
    title: 'Administration',
    items: [
      { label: 'Shops & Team', href: '/manage' },
      { label: 'History', href: '/history' },
    ],
  },
]

// Navigation items for field staff (limited access) - no grouping needed
const fieldStaffNavItems: Array<NavigationItem> = [
  { label: 'Home', href: '/home' },
  { label: 'Collections', href: '/collections' },
]

function AuthedLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: currentEmployee } = useSuspenseQuery(employeeQueries.current())

  const isFieldStaff = currentEmployee?.role === EmployeeRole.FIELD_STAFF

  // Build navigation based on role
  // Admin gets grouped navigation, field staff gets flat list
  const navigationGroups: Array<NavigationGroup> | undefined = isFieldStaff
    ? undefined
    : adminNavGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          isActive: location.pathname === item.href,
        })),
      }))

  // Flat navigation items for field staff and mobile bottom nav
  const navigationItems: Array<NavigationItem> = isFieldStaff
    ? fieldStaffNavItems.map((item) => ({
        ...item,
        isActive: location.pathname === item.href,
      }))
    : adminNavGroups.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          isActive: location.pathname === item.href,
        })),
      )

  const handleNavigate = (href: string) => {
    navigate({ to: href })
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      navigationGroups={navigationGroups}
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
