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
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Meeting Assist</h2>
        <p className="text-muted-foreground mt-1">
          Real-time transcription with AI-powered summaries and action items.
        </p>
      </div>

      {/* Browser support warning */}
      {!isSupported && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-warning/10 border border-warning p-4 text-sm">
          <AlertCircle className="h-5 w-5 text-warning shrink-0" aria-hidden="true" />
          <p>
            Speech recognition is not supported in this browser. Please use Chrome or Edge for live transcription.
          </p>
        </div>
      )}

      {/* Error display */}
      {(error || aiError) && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error || aiError}</p>
        </div>
      )}

      {/* Controls */}
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

      {/* Status badge */}
      <div className="flex items-center gap-2">
        <Badge variant={isListening ? 'destructive' : 'secondary'}>
          {isListening ? (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" aria-hidden="true" />
              Recording
            </span>
          ) : (
            'Not Recording'
          )}
        </Badge>
        {transcript && (
          <Badge variant="outline">
            {transcript.split(/\s+/).length} words
          </Badge>
        )}
      </div>

      {/* Live Transcript */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Live Transcript</CardTitle>
          <CardDescription>
            Spoken words appear here in real time. Partial text shows in gray.
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

      {/* AI Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AI Summary</CardTitle>
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

      {/* Action Items */}
      {(actionItems.length > 0 || summary) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Action Items</CardTitle>
            <CardDescription>
              Click the circle to mark items as complete.
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
