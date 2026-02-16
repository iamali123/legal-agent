import { useState } from 'react'
import { Mail, Key, Eye, EyeOff, User, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import loginVideo from '@/assets/login-video.mp4'
import logoImage from '@/assets/mbrhe-logo.png'
import { useLogin, useUAEPassLogin } from '@/hooks/api'

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useLogin()
  const uaePassMutation = useUAEPassLogin()

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setError(null)
    try {
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      })
      // Navigation happens automatically in useLogin hook's onSuccess
    } catch (err) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        'Login failed. Please check your credentials and try again.'
      setError(errorMessage)
    }
  }

  const handleUAEPassLogin = async () => {
    setError(null)
    // Note: UAE Pass integration requires OAuth redirect flow
    // For now, this is a placeholder - you'll need to:
    // 1. Redirect to UAE Pass authorization URL
    // 2. Handle callback with authorization code
    // 3. Exchange code for token
    // 4. Call uaePassMutation with the token
    
    // Example placeholder implementation:
    alert('UAE Pass integration requires OAuth redirect flow. Please implement the UAE Pass OAuth flow first.')
    
    // Uncomment and implement when UAE Pass OAuth is ready:
    // try {
    //   const uaePassToken = await getUAEPassToken()
    //   await uaePassMutation.mutateAsync({
    //     uaePassToken,
    //     redirectUri: window.location.origin + '/auth/callback',
    //   })
    // } catch (err) {
    //   const errorMessage =
    //     (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
    //     (err as { message?: string })?.message ||
    //     'UAE Pass authentication failed. Please try again.'
    //   setError(errorMessage)
    // }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Page background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.22 }}
        aria-hidden
      >
        <source src={loginVideo} type="video/mp4" />
      </video>
      {/* Login card */}
      <div
        className="relative z-10 w-full max-w-4xl bg-[#0A1628CC] border border-brand-accent-dark/30 rounded-3xl overflow-hidden flex flex-col md:flex-row min-h-[480px]"
        style={{
          boxShadow: '0px 0px 20px 0px #00D9FF0D inset, 0px 0px 19.3px 17px #00D9FF1A',
        }}
      >
        {/* Left: Form */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-white mb-1">
            Sign In To Your Account
          </h1>
          <p className="text-sm text-brand-muted-text-dark mb-8">
            Please enter your details
          </p>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-accent-dark pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError(null)
                  }}
                  disabled={loginMutation.isPending}
                  className="pl-10 h-11 rounded-lg border-brand-accent-dark/30 bg-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-accent-dark pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(null)
                  }}
                  disabled={loginMutation.isPending}
                  className="pl-10 pr-10 h-11 rounded-lg border-brand-accent-dark/30 bg-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-accent-dark"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-white"
              disabled={loginMutation.isPending || !email || !password}
            >
              <User className="w-5 h-5 mr-2" />
              {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <p className="text-center text-brand-secondary-text my-4">OR</p>
          {/* UAE Pass Button */}
          <button
            type="button"
            onClick={handleUAEPassLogin}
            disabled={uaePassMutation.isPending}
            className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="w-6 h-6 flex items-center justify-center">
              <img src="/src/assets/uae-pass.webp" alt="UAE Pass" className="w-full" />
            </span>
            <span className="text-base font-semibold">
              {uaePassMutation.isPending ? 'Connecting...' : 'Continue with UAE PASS'}
            </span>
          </button>
        </div>

        {/* Right: Branding with wallpaper - 40% opacity, rotated 90deg */}
        <div className="flex-1 relative min-h-[240px] md:min-h-0 flex flex-col items-center justify-center p-8 overflow-hidden">
          <div className="relative z-10 text-center">
            <img
              src={logoImage}
              alt="MBRHE Logo"
              className="w-full h-14 mx-auto mb-4 object-contain"
            />
            <h2 className="text-4xl md:text-2xl font-semibold text-brand-accent-dark">
              Legal Portal Solution
            </h2>
          </div>
        </div>
      </div>
    </div>
  )
}
