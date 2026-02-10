import { useState, useEffect } from 'react'
import { MessageCircle, Volume2, Trash2, Clock, AlertCircle, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import PromptForm from '@/components/PromptForm'
import PromptTemplates, { type PromptTemplate } from '@/components/PromptTemplates'
import ModalityBadges from '@/components/ModalityBadges'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { answerPrompt } from '@/services/aiService'

interface HistoryEntry {
  id: string
  prompt: string
  response: string
  timestamp: Date
}

export default function PromptHub() {
  const [promptValue, setPromptValue] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const { speak, preferences, disabilityProfile, wantsSimplified } = useAccessibility()

  const isCognitive = disabilityProfile === 'cognitive'
  const isDyslexia = disabilityProfile === 'dyslexia'
  const isVisual = disabilityProfile === 'visual'
  const showFewerTemplates = isCognitive || isDyslexia

  // Auto-focus textarea for visual profile
  useEffect(() => {
    if (isVisual) {
      const textarea = document.getElementById('prompt-input')
      if (textarea) textarea.focus()
    }
  }, [isVisual])

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true)
    setError(null)
    setResponse('')

    try {
      const result = await answerPrompt(prompt)
      setResponse(result)

      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          prompt,
          response: result,
          timestamp: new Date(),
        },
        ...prev,
      ])

      if (preferences.auto_tts) {
        speak(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (template: PromptTemplate) => {
    setPromptValue(template.prompt)
    const textarea = document.getElementById('prompt-input')
    if (textarea) {
      textarea.focus()
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.selectionStart = textarea.selectionEnd = template.prompt.length
      }
    }
  }

  const handleClearHistory = () => {
    setHistory([])
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Prompt Hub</h2>
          <ModalityBadges compact />
        </div>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {wantsSimplified
            ? 'Ask the AI a question. Use a template or type your own.'
            : 'Interact with AI using text, voice, or guided templates.'}
        </p>
      </div>

      {/* Cognitive: guided instructions */}
      {isCognitive && (
        <div className="rounded-[--radius-lg] bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" aria-hidden="true" />
            How to use:
          </p>
          <ol className="space-y-1 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Badge variant="secondary" className="shrink-0 text-xs">1</Badge>
              Pick a template below, or type your own question.
            </li>
            <li className="flex gap-2">
              <Badge variant="secondary" className="shrink-0 text-xs">2</Badge>
              Press <strong>Send</strong> (or Enter).
            </li>
            <li className="flex gap-2">
              <Badge variant="secondary" className="shrink-0 text-xs">3</Badge>
              The AI answer appears below. Click <strong>Read Aloud</strong> to hear it.
            </li>
          </ol>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {wantsSimplified ? 'Pick a Template' : 'Quick Templates'}
          </CardTitle>
          <CardDescription>
            {wantsSimplified
              ? 'Tap a button to start with a ready-made prompt.'
              : 'Select a template to pre-fill your prompt, then customize it.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptTemplates
            onSelect={handleTemplateSelect}
            maxVisible={showFewerTemplates ? 3 : undefined}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-[1.125rem] w-[1.125rem] text-primary" aria-hidden="true" />
            {wantsSimplified ? 'Your Question' : 'Ask a Question'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PromptForm
            value={promptValue}
            onChange={setPromptValue}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder={
              wantsSimplified
                ? 'Type your question here, or use the microphone.'
                : undefined
            }
          />
        </CardContent>
      </Card>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-[--radius-lg] bg-destructive/10 border border-destructive p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      )}

      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{wantsSimplified ? 'Answer' : 'Response'}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speak(response)}
                aria-label="Read response aloud"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                Read Aloud
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div aria-live="polite">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{response}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {history.length > 0 && !wantsSimplified && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent History</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClearHistory} aria-label="Clear prompt history">
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Clear
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4" role="list" aria-label="Prompt history">
              {history.map((entry) => (
                <div key={entry.id} className="border-b border-border pb-4 last:border-0 last:pb-0" role="listitem">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">You</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm font-medium mb-2 leading-relaxed">{entry.prompt}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">AI</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => speak(entry.response)}
                      aria-label={`Read response aloud: ${entry.prompt.slice(0, 30)}`}
                    >
                      <Volume2 className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3 leading-relaxed">
                    {entry.response}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
