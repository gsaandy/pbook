'use client'

import { SignIn } from '@clerk/tanstack-react-start'
import { useEffect, useState } from 'react'

export function SignInPage() {
  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Only access window on client side
    setRedirectUrl(window.location.href)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <SignIn routing="hash" forceRedirectUrl={redirectUrl} />
    </div>
  )
}
