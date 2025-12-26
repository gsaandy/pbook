'use client'

import type { NavigationItem } from './AppShell'

interface MainNavProps {
  items: Array<NavigationItem>
  onNavigate?: (href: string) => void
}

export function MainNav({ items, onNavigate }: MainNavProps) {
  return (
    <nav className="flex-1 overflow-y-auto py-4">
      <ul className="space-y-1 px-3">
        {items.map((item) => (
          <li key={item.href}>
            <button
              onClick={() => onNavigate?.(item.href)}
              className={`
                w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  item.isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }
              `}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
