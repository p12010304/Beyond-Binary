import { useState } from 'react'
import { AlertCircle, LogIn, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import EmailSummary from '@/components/EmailSummary'
import DocumentScanner from '@/components/DocumentScanner'
import { hasValidToken, loadGapiScript, loadGisScript, requestAccessToken } from '@/lib/googleAuth'
import { fetchEmails } from '@/services/documentService'

interface EmailData {
  id: string
  subject: string
  from: string
  date: string
  snippet: string
  body: string
}

export default function Documents() {
  const [isAuthenticated, setIsAuthenticated] = useState(hasValidToken())
  const [emails, setEmails] = useState<EmailData[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)
    try {
      await loadGapiScript()
      await loadGisScript()
      await requestAccessToken()
      setIsAuthenticated(true)
      loadEmailsData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Google')
    } finally {
      setIsConnecting(false)
    }
  }

  const loadEmailsData = async () => {
    setLoadingEmails(true)
    setError(null)
    try {
      const data = await fetchEmails(10)
      setEmails(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails')
    } finally {
      setLoadingEmails(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Documents & Email</h2>
        <p className="text-muted-foreground mt-1">
          AI-powered email summaries, document scanning, and OCR with text-to-speech.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email section */}
        <section aria-labelledby="email-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 id="email-heading" className="text-lg font-semibold">Email Inbox</h3>
            {isAuthenticated && (
              <Button variant="outline" size="sm" onClick={loadEmailsData} disabled={loadingEmails}>
                <RefreshCw className={`h-4 w-4 ${loadingEmails ? 'animate-spin' : ''}`} aria-hidden="true" />
                Refresh
              </Button>
            )}
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col items-center py-8 space-y-3">
              <LogIn className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground text-center">
                Connect Gmail to view and summarize emails.
              </p>
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect Gmail'}
              </Button>
            </div>
          ) : (
            <EmailSummary emails={emails} loading={loadingEmails} />
          )}
        </section>

        {/* Document Scanner section */}
        <section aria-labelledby="scanner-heading" className="space-y-4">
          <h3 id="scanner-heading" className="text-lg font-semibold">Document Scanner</h3>
          <DocumentScanner />
        </section>
      </div>
    </div>
  )
}
