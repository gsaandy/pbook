'use client'

import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  // Redirect to dashboard - the _authed layout will handle auth check
  return <Navigate to="/dashboard" />
}
