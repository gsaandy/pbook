import type { NavigationGroup, NavigationItem } from '~/lib/types'

interface MainNavProps {
  items: Array<NavigationItem>
  /** Grouped navigation - if provided, renders groups with separators */
  groups?: Array<NavigationGroup>
  onNavigate?: (href: string) => void
}

export function MainNav({ items, groups, onNavigate }: MainNavProps) {
  // If groups are provided, render grouped navigation
  if (groups && groups.length > 0) {
    return (
      <nav className="flex-1 overflow-y-auto py-4">
        {groups.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? 'mt-4' : ''}>
            {/* Group Header */}
            <div className="px-4 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.title}
              </span>
            </div>
            {/* Group Items */}
            <ul className="space-y-1 px-3">
              {group.items.map((item) => (
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
          </div>
        ))}
      </nav>
    )
  }

  // Fallback to flat navigation (for field staff or when no groups)
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
