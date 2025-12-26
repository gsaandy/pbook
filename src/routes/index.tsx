'use client'

import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
    } else if (isAdmin) {
      navigate({ to: '/dashboard' })
    } else {
      navigate({ to: '/operations' })
    }
  }, [isAuthenticated, isAdmin, navigate])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-slate-600 dark:text-slate-400">Loading...</div>
    </div>
  )
}
