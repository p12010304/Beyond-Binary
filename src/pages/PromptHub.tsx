import { useState } from 'react'
import { MessageCircle, Volume2, Trash2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import PromptForm from '@/components/PromptForm'
import PromptTemplates, { type PromptTemplate } from '@/components/PromptTemplates'
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
  const { speak, preferences } = useAccessibility()

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
        <h2 className="text-xl font-semibold tracking-tight">Prompt Hub</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Interact with AI using text, voice, or guided templates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>
            {preferences.simplified_ui
              ? 'Tap a button to start with a ready-made prompt.'
              : 'Select a template to pre-fill your prompt, then customize it.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptTemplates onSelect={handleTemplateSelect} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-[1.125rem] w-[1.125rem] text-primary" aria-hidden="true" />
            Ask a Question
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PromptForm
            value={promptValue}
            onChange={setPromptValue}
            onSubmit={handleSubmit}
            isLoading={isLoading}
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
              <CardTitle>Response</CardTitle>
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

      {history.length > 0 && (
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
