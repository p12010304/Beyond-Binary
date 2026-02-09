import { useState } from 'react'
import { Sparkles, Volume2, Trash2, Clock } from 'lucide-react'
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

      // Add to history
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
    // Focus the textarea
    const textarea = document.getElementById('prompt-input')
    if (textarea) {
      textarea.focus()
      // Place cursor at end
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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Prompt Hub</h2>
        <p className="text-muted-foreground mt-1">
          Ask AI anything using text, voice, or guided templates. Designed for accessibility.
        </p>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Templates</CardTitle>
          <CardDescription>
            {preferences.simplified_ui
              ? 'Click a button to start with a ready-made prompt.'
              : 'Select a template to pre-fill your prompt, then customize it.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptTemplates onSelect={handleTemplateSelect} />
        </CardContent>
      </Card>

      {/* Prompt input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
            Ask AI
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

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-lg bg-destructive/10 border border-destructive p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Current response */}
      {response && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">AI Response</CardTitle>
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
            <div className="prose prose-sm max-w-none" aria-live="polite">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{response}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent History</CardTitle>
              <Button variant="ghost" size="sm" onClick={handleClearHistory}>
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
                  <p className="text-sm font-medium mb-2">{entry.prompt}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">AI</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => speak(entry.response)}
                      aria-label="Read this response aloud"
                    >
                      <Volume2 className="h-3 w-3" aria-hidden="true" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">
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
