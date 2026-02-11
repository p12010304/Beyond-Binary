import { useState } from 'react'
import { AlertCircle, LogIn, RefreshCw, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import EmailSummary from '@/components/EmailSummary'
import DocumentScanner from '@/components/DocumentScanner'
import ModalityBadges from '@/components/ModalityBadges'
import { hasValidToken, loadGapiScript, loadGisScript, requestAccessToken } from '@/lib/googleAuth'
import { fetchEmails } from '@/services/documentService'
import { useAccessibility } from '@/components/AccessibilityProvider'

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
  const { speak, disabilities, wantsSimplified, wantsVoice } = useAccessibility()

  const isCognitive = disabilities.includes('cognitive')
  const isVisual = disabilities.includes('visual')

  // Cognitive: fewer emails; visual: full set
  const maxEmails = isCognitive ? 5 : 10

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
      const data = await fetchEmails(maxEmails)
      setEmails(data)

      // Visual profile: announce how many emails loaded
      if (isVisual && wantsVoice && data.length > 0) {
        speak(`Loaded ${data.length} emails. First email: ${data[0].subject}, from ${data[0].from}.`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load emails')
    } finally {
      setLoadingEmails(false)
    }
  }

  const handleReadAllSubjects = () => {
    if (emails.length === 0) return
    const subjects = emails.map((e, i) => `${i + 1}. ${e.subject}, from ${e.from}`).join('. ')
    speak(`You have ${emails.length} emails. ${subjects}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Documents & Email</h2>
          <ModalityBadges compact />
        </div>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {wantsSimplified
            ? 'Read and summarize your emails. Scan documents with your camera.'
            : 'Summarize emails, scan documents with OCR, and use text-to-speech on any content.'}
        </p>
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-[--radius-lg] bg-destructive/10 border border-destructive p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="email-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 id="email-heading" className="text-base font-medium">
              {wantsSimplified ? 'Emails' : 'Email Inbox'}
            </h3>
            <div className="flex items-center gap-2">
              {/* Visual profile: read all subjects button */}
              {isAuthenticated && isVisual && emails.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleReadAllSubjects} aria-label="Read all email subjects aloud">
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                  Read All
                </Button>
              )}
              {isAuthenticated && (
                <Button variant="outline" size="sm" onClick={loadEmailsData} disabled={loadingEmails}>
                  <RefreshCw className={`h-4 w-4 ${loadingEmails ? 'animate-spin' : ''}`} aria-hidden="true" />
                  Refresh
                </Button>
              )}
            </div>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col items-center py-8 space-y-3">
              <LogIn className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground text-center">
                {wantsSimplified
                  ? 'Connect Gmail to see your emails.'
                  : 'Connect Gmail to view and summarize emails.'}
              </p>
              <Button onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? 'Connecting...' : 'Connect Gmail'}
              </Button>
            </div>
          ) : (
            <EmailSummary emails={emails} loading={loadingEmails} />
          )}
        </section>

        <section aria-labelledby="scanner-heading" className="space-y-4">
          <h3 id="scanner-heading" className="text-base font-medium">
            {wantsSimplified ? 'Scan a Document' : 'Document Scanner'}
          </h3>
          <DocumentScanner />
        </section>
      </div>
    </div>
  )
}
