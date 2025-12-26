import { HeadContent, Outlet, Scripts, createRootRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import type { NavigationItem } from '@/lib/types'
import { AuthProvider, useAuth } from '@/lib/auth'
import { DataStoreProvider } from '@/lib/data-store'
import { AppShell } from '@/components/shell'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'PSBook - Cash Collection & Reconciliation',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <AuthProvider>
          <DataStoreProvider>
            <RootLayout />
          </DataStoreProvider>
        </AuthProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  const { isAuthenticated, isAdmin, currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Public routes that don't need auth
  const isPublicRoute = location.pathname === '/login'

  // If not authenticated and not on public route, render just the outlet (which will redirect)
  if (!isAuthenticated || isPublicRoute) {
    return <Outlet />
  }

  // Build navigation items based on user role
  const adminNavItems: Array<NavigationItem> = [
    { label: 'Dashboard', href: '/dashboard', isActive: location.pathname === '/dashboard' },
    { label: 'Operations', href: '/operations', isActive: location.pathname === '/operations' },
    { label: 'Setup', href: '/setup', isActive: location.pathname === '/setup' },
    { label: 'Reconciliation', href: '/reconciliation', isActive: location.pathname === '/reconciliation' },
    { label: 'Reports', href: '/reports', isActive: location.pathname === '/reports' },
  ]

  const fieldStaffNavItems: Array<NavigationItem> = [
    { label: 'Operations', href: '/operations', isActive: location.pathname === '/operations' },
  ]

  const navigationItems = isAdmin ? adminNavItems : fieldStaffNavItems

  const handleNavigate = (href: string) => {
    navigate({ to: href })
  }

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  return (
    <AppShell
      navigationItems={navigationItems}
      user={currentUser ? { name: currentUser.name } : undefined}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      <Outlet />
    </AppShell>
  )
}
