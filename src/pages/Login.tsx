import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useSupabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [googleLoading, setGoogleLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/home'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
        setError(null)
        setIsSignUp(false)
      } else {
        await signInWithEmail(email, password)
        setError(null)
        navigate(from, { replace: true })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle id="login-title">
            {isSignUp ? 'Create account' : 'Sign in'}
          </CardTitle>
          <CardDescription id="login-desc">
            {isSignUp
              ? 'Enter your email and choose a password to register.'
              : 'Enter your email and password to sign in.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="login-email" className="text-sm font-medium block mb-1.5">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                aria-describedby="login-desc"
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="text-sm font-medium block mb-1.5">
                Password
              </label>
              <Input
                id="login-password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? 'At least 6 characters' : '••••••••'}
                required
                minLength={6}
                disabled={loading}
                className="w-full"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-[--radius-md] bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                size="lg"
                disabled={loading || !email || !password}
                className="w-full"
                aria-describedby={error ? undefined : undefined}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" aria-hidden />
                    {isSignUp ? 'Creating account…' : 'Signing in…'}
                  </span>
                ) : isSignUp ? (
                  'Sign up'
                ) : (
                  'Sign in'
                )}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp((prev) => !prev)
                  setError(null)
                }}
                className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>

              <div className="relative my-4">
                <span className="absolute inset-0 flex items-center" aria-hidden="true">
                  <span className="w-full border-t border-border" />
                </span>
                <span className="relative flex justify-center text-xs text-muted-foreground">
                  or
                </span>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                disabled={loading || googleLoading}
                onClick={async () => {
                  setError(null)
                  setGoogleLoading(true)
                  try {
                    await signInWithGoogle()
                    // Supabase redirects to Google and then back; no navigate() needed
                  } catch (err) {
                    const message = err instanceof Error ? err.message : 'Google sign-in failed'
                    setError(message)
                  } finally {
                    setGoogleLoading(false)
                  }
                }}
                aria-label="Sign in with Google"
              >
                {googleLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
                    Redirecting…
                  </span>
                ) : (
                  'Sign in with Google'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
