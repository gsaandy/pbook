'use client'

import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { isAuthenticated, isAdmin } = useAuth()

  // Declarative redirect based on auth state - no useEffect needed
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  } else if (isAdmin) {
    return <Navigate to="/dashboard" />
  } else {
    return <Navigate to="/operations" />
  }
}
