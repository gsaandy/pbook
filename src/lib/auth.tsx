'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser, Employee } from './types'

const AUTH_STORAGE_KEY = 'psbook_auth_user'

// Mock users for authentication
const MOCK_USERS: Array<AuthUser> = [
  {
    id: 'emp-004',
    name: 'Sunita Reddy',
    phone: '+91 98765 44444',
    email: 'admin@psbook.com',
    role: 'admin',
    status: 'active',
    password: 'admin123',
  },
  {
    id: 'emp-001',
    name: 'Rajesh Kumar',
    phone: '+91 98765 11111',
    email: 'field1@psbook.com',
    role: 'field_staff',
    status: 'active',
    password: 'field123',
  },
  {
    id: 'emp-002',
    name: 'Priya Sharma',
    phone: '+91 98765 22222',
    email: 'field2@psbook.com',
    role: 'field_staff',
    status: 'active',
    password: 'field123',
  },
]

// Helper to safely get from localStorage (SSR-safe)
function getStoredUser(): Employee | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Helper to safely set to localStorage
function setStoredUser(user: Employee | null) {
  if (typeof window === 'undefined') return
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch {
    // Ignore storage errors
  }
}

interface AuthContextType {
  currentUser: Employee | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<Employee | null>(null)

  // Restore user from localStorage on mount
  useEffect(() => {
    const storedUser = getStoredUser()
    if (storedUser) {
      setCurrentUser(storedUser)
    }
  }, [])

  const login = useCallback((email: string, password: string): boolean => {
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (user) {
      // Remove password before storing
      const { password: _, ...userWithoutPassword } = user
      setCurrentUser(userWithoutPassword)
      setStoredUser(userWithoutPassword)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setCurrentUser(null)
    setStoredUser(null)
  }, [])

  const isAuthenticated = currentUser !== null
  const isAdmin = currentUser?.role === 'admin'

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
