import type { NavigationItem } from '~/lib/types'

interface MobileBottomNavProps {
  items: Array<NavigationItem>
  onNavigate?: (href: string) => void
}

export function MobileBottomNav({ items, onNavigate }: MobileBottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => (
          <button
            key={item.href}
            onClick={() => onNavigate?.(item.href)}
            className={`flex flex-col items-center justify-center flex-1 h-full px-2 py-1 rounded-lg transition-colors ${
              item.isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span
              className={`text-xs font-medium ${
                item.isActive ? 'font-semibold' : ''
              }`}
            >
              {item.label}
            </span>
            {item.isActive && (
              <div className="w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full mt-1" />
            )}
          </button>
        ))}
      </div>
    </nav>
  )
}
