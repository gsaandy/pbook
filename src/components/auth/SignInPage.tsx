import { SignIn } from '@clerk/tanstack-react-start'
import { ClientOnly } from '@tanstack/react-router'

export function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <ClientOnly fallback={<div>Loading...</div>}>
        <SignIn routing="hash" forceRedirectUrl={window.location.href} />
      </ClientOnly>
    </div>
  )
}
