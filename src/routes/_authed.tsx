import {
  Outlet,
  createFileRoute,
  useLocation,
  useNavigate,
} from '@tanstack/react-router'
import { UserButton } from '@clerk/tanstack-react-start'
import type { NavigationItem } from '~/lib/types'
import { AppShell } from '~/components/shell'
import { SignInPage } from '~/components/auth/SignInPage'

export const Route = createFileRoute('/_authed')({
  beforeLoad: ({ context }) => {
    if (!context.userId) {
      throw new Error('Not authenticated')
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return <SignInPage />
    }
    throw error
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  // Navigation items - all users get admin navigation for now
  // Role-based filtering can be added later using Clerk metadata
  const navigationItems: Array<NavigationItem> = [
    {
      label: 'Home',
      href: '/dashboard',
      isActive: location.pathname === '/dashboard',
    },
    {
      label: 'Collections',
      href: '/operations',
      isActive: location.pathname === '/operations',
    },
    {
      label: 'Deliveries',
      href: '/invoices',
      isActive: location.pathname === '/invoices',
    },
    {
      label: 'Shops & Team',
      href: '/setup',
      isActive: location.pathname === '/setup',
    },
    {
      label: 'Settlements',
      href: '/settlements',
      isActive: location.pathname === '/settlements',
    },
    {
      label: 'History',
      href: '/reports',
      isActive: location.pathname === '/reports',
    },
  ]

  const handleNavigate = (href: string) => {
    navigate({ to: href })
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      onNavigate={handleNavigate}
      userButton={<UserButton />}
    >
      <Outlet />
    </AppShell>
  )
}
