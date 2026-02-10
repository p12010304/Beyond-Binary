import { useState } from 'react'
import { Mail, ScanText, Volume2, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { summarizeEmail } from '@/services/documentService'
import { cn } from '@/lib/utils'

interface Email {
  id: string
  subject: string
  from: string
  date: string
  snippet: string
  body: string
}

interface EmailSummaryProps {
  emails: Email[]
  loading: boolean
  className?: string
}

export default function EmailSummary({ emails, loading, className }: EmailSummaryProps) {
  const [summaries, setSummaries] = useState<Record<string, string>>({})
  const [loadingSummary, setLoadingSummary] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const { speak } = useAccessibility()

  const handleSummarize = async (email: Email) => {
    if (summaries[email.id]) return
    setLoadingSummary(email.id)
    try {
      const summary = await summarizeEmail(email.body)
      setSummaries((prev) => ({ ...prev, [email.id]: summary }))
    } catch {
      setSummaries((prev) => ({ ...prev, [email.id]: 'Failed to generate summary. Please try again.' }))
    } finally {
      setLoadingSummary(null)
    }
  }

  const handleReadAloud = (email: Email) => {
    const text = summaries[email.id]
      ? `Email from ${email.from}. Subject: ${email.subject}. Summary: ${summaries[email.id]}`
      : `Email from ${email.from}. Subject: ${email.subject}. ${email.snippet}`
    speak(text)
  }

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Mail className="h-10 w-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">No emails found. Connect your Gmail account to get started.</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)} role="list" aria-label="Email messages">
      {emails.map((email) => (
        <Card key={email.id} role="listitem">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-sm truncate leading-tight">{email.subject || '(No Subject)'}</h4>
                <p className="text-xs text-muted-foreground truncate mt-0.5">From: {email.from}</p>
                <p className="text-xs text-muted-foreground">{email.date}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleReadAloud(email)}
                  aria-label={`Read aloud: ${email.subject}`}
                >
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSummarize(email)}
                  disabled={loadingSummary === email.id}
                  aria-label={`Summarize: ${email.subject}`}
                >
                  {loadingSummary === email.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <ScanText className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setExpandedId(expandedId === email.id ? null : email.id)}
                  aria-label={expandedId === email.id ? `Collapse: ${email.subject}` : `Expand: ${email.subject}`}
                  aria-expanded={expandedId === email.id}
                >
                  {expandedId === email.id ? (
                    <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{email.snippet}</p>

            {summaries[email.id] && (
              <div className="rounded-[--radius-md] bg-primary/5 border border-primary/15 p-3">
                <Badge variant="secondary" className="text-xs mb-1.5">Summary</Badge>
                <p className="text-sm leading-relaxed">{summaries[email.id]}</p>
              </div>
            )}

            {expandedId === email.id && (
              <div className="rounded-[--radius-md] bg-muted p-3 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed">
                {email.body || email.snippet}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
