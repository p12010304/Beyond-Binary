import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import MeetingControls from '@/components/MeetingControls'
import TranscriptDisplay from '@/components/TranscriptDisplay'
import ActionItems from '@/components/ActionItems'
import { useTranscription } from '@/hooks/useTranscription'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { summarizeMeeting } from '@/services/aiService'
import type { AISummaryResult, ActionItem } from '@/lib/types'

export default function MeetingAssist() {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useTranscription()

  const { speak, vibrate, preferences } = useAccessibility()

  const [summary, setSummary] = useState<AISummaryResult | null>(null)
  const [actionItems, setActionItems] = useState<ActionItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const handleSummarize = async () => {
    if (!transcript) return
    setIsProcessing(true)
    setAiError(null)

    try {
      const result = await summarizeMeeting(transcript)
      setSummary(result)
      setActionItems(result.action_items)
      vibrate([100, 50, 100])

      if (preferences.auto_tts) {
        speak(`Summary: ${result.summary}`)
      }
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReadAloud = () => {
    if (summary) {
      speak(`Meeting summary: ${summary.summary}. Action items: ${actionItems.map((a) => a.task).join('. ')}`)
    } else if (transcript) {
      speak(transcript)
    }
  }

  const handleReset = () => {
    stopListening()
    resetTranscript()
    setSummary(null)
    setActionItems([])
    setAiError(null)
  }

  const handleToggleActionItem = (index: number) => {
    setActionItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Meeting Assist</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Transcribe speech in real time with automatic summaries and action items.
        </p>
      </div>

      {!isSupported && (
        <div role="alert" className="flex items-center gap-2 rounded-[--radius-lg] bg-warning/10 border border-warning p-4 text-sm">
          <AlertCircle className="h-4 w-4 text-warning shrink-0" aria-hidden="true" />
          <p>Speech recognition is not supported in this browser. Use Chrome or Edge for live transcription.</p>
        </div>
      )}

      {(error || aiError) && (
        <div role="alert" className="flex items-center gap-2 rounded-[--radius-lg] bg-destructive/10 border border-destructive p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error || aiError}</p>
        </div>
      )}

      <MeetingControls
        isListening={isListening}
        isProcessing={isProcessing}
        hasTranscript={!!transcript}
        onStart={startListening}
        onStop={stopListening}
        onReset={handleReset}
        onSummarize={handleSummarize}
        onReadAloud={handleReadAloud}
      />

      <div className="flex items-center gap-2">
        <Badge variant={isListening ? 'destructive' : 'secondary'}>
          {isListening ? (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive-foreground animate-recording" aria-hidden="true" />
              Recording
            </span>
          ) : (
            'Idle'
          )}
        </Badge>
        {transcript && (
          <Badge variant="outline">
            {transcript.split(/\s+/).length} words
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Live Transcript</CardTitle>
          <CardDescription>
            Spoken words appear here in real time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TranscriptDisplay
            transcript={transcript}
            interimTranscript={interimTranscript}
            isListening={isListening}
          />
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">{summary.summary}</p>

            {summary.key_topics.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Key Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {summary.key_topics.map((topic, i) => (
                    <Badge key={i} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(actionItems.length > 0 || summary) && (
        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>
              Tap the circle to mark items as complete.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActionItems items={actionItems} onToggle={handleToggleActionItem} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
