/**
 * Returns the current Google access token for Calendar/Gmail API calls.
 * Prefers Supabase session provider_token (when user signed in with Google),
 * otherwise falls back to gapi client token from the "Connect Google" flow.
 */
export async function getGoogleAccessToken(): Promise<string | null> {
  const { supabase } = await import('@/lib/supabaseClient')
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.provider_token) {
    return session.provider_token
  }
  return typeof window !== 'undefined' ? window.gapi?.client?.getToken()?.access_token ?? null : null
}
