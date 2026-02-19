/**
 * UAE Pass OAuth callback page.
 * UAE Pass redirects here with ?uaePassId=... (or similar). We call POST /auth/uae-pass and redirect to dashboard.
 */

import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useUAEPassLogin } from '@/hooks/api'
import { AlertCircle } from 'lucide-react'

export function AuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const uaePassMutation = useUAEPassLogin()
  const [error, setError] = useState<string | null>(null)

  const uaePassId =
    searchParams.get('uaePassId') ??
    searchParams.get('id') ??
    searchParams.get('code') ??
    null

  useEffect(() => {
    if (!uaePassId) {
      setError('Missing UAE Pass ID. Please try signing in again.')
      return
    }

    let cancelled = false
    uaePassMutation
      .mutateAsync({ uaePassId })
      .then(() => {
        if (!cancelled) navigate('/', { replace: true })
      })
      .catch((err) => {
        if (cancelled) return
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response
            ?.data?.message ??
          (err as { message?: string })?.message ??
          'UAE Pass sign-in failed. Please try again.'
        setError(message)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when uaePassId is present
  }, [uaePassId])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A1628]">
        <div className="max-w-md w-full rounded-2xl bg-[#0A1628CC] border border-brand-accent-dark/30 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Sign-in failed</h1>
          <p className="text-brand-muted-text-dark mb-6">{error}</p>
          <Link
            to="/login"
            className="inline-block px-6 py-2 rounded-lg bg-brand-accent-dark text-[#0A1628] font-medium hover:opacity-90"
          >
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  if (uaePassMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A1628]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-accent-dark border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Completing UAE Pass sign-in...</p>
        </div>
      </div>
    )
  }

  return null
}
