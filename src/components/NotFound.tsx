import { Link } from '@tanstack/react-router'

export function NotFound({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center space-y-4 p-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          404
        </h1>
        <div className="text-slate-600 dark:text-slate-400">
          {children || <p>The page you are looking for does not exist.</p>}
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Go back
          </button>
          <Link
            to="/"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  )
}
