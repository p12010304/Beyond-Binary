import { useState, useEffect } from 'react'
import { AlertCircle, Download } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import MeetingControls from '@/components/MeetingControls'
import SpeechPlayer from '@/components/SpeechPlayer'
import TranscriptDisplay from '@/components/TranscriptDisplay'
import ActionItems from '@/components/ActionItems'
import { useTranscription } from '@/hooks/useTranscription'
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { summarizeMeeting } from '@/services/aiService'
import { generateMeetingPDF } from '@/lib/pdfGenerator'
import type { AISummaryResult, ActionItem } from '@/lib/types'

export default function MeetingAssist() {
  const {
    isInitializing,
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useTranscription()

  const { registerAction } = useVoiceNavigation()
  const { speak, stopSpeaking, speechStatus, vibrate, preferences } = useAccessibility()

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
    stopSpeaking()
  }

  const handleToggleActionItem = (index: number) => {
    setActionItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, completed: !item.completed } : item,
      ),
    )
  }

  // Register voice navigation actions
  useEffect(() => {
    const cleanups: (() => void)[] = []

    // Start recording
    cleanups.push(
      registerAction('meeting-start', ['start', 'record', 'begin', 'start recording'], () => {
        if (!isListening && !isInitializing) {
          startListening()
          speak('Recording started')
        }
      })
    )

    // Stop recording
    cleanups.push(
      registerAction('meeting-stop', ['stop', 'pause', 'stop recording'], () => {
        if (isListening) {
          stopListening()
          speak('Recording stopped')
        }
      })
    )

    // Summarize
    cleanups.push(
      registerAction('meeting-summarize', ['summarize', 'summary', 'analyze'], async () => {
        if (!transcript || isProcessing) return
        setIsProcessing(true)
        setAiError(null)
        speak('Generating summary')

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
      })
    )

    // Read aloud
    cleanups.push(
      registerAction('meeting-read', ['read', 'speak', 'read aloud'], () => {
        if (summary) {
          speak(`Meeting summary: ${summary.summary}. Action items: ${actionItems.map((a) => a.task).join('. ')}`)
        } else if (transcript) {
          speak(transcript)
        }
      })
    )

    // Reset
    cleanups.push(
      registerAction('meeting-reset', ['reset', 'clear', 'new'], () => {
        stopListening()
        resetTranscript()
        setSummary(null)
        setActionItems([])
        setAiError(null)
        stopSpeaking()
        speak('Reset complete')
      })
    )

    // Cleanup all registrations on unmount
    return () => {
      cleanups.forEach((cleanup) => cleanup())
    }
  }, [registerAction, isListening, isInitializing, transcript, isProcessing, summary, actionItems, startListening, stopListening, resetTranscript, speak, stopSpeaking, vibrate, preferences.auto_tts])

  // Keyboard shortcut: Press Enter to stop recording
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If pressing Enter while recording is active, stop it
      if (e.key === 'Enter' && isListening) {
        e.preventDefault()
        stopListening()
        // speak('Recording stopped') // Optional feedback
        vibrate(100)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isListening, stopListening, vibrate])
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Meeting Assist</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Transcribe speech in real time with automatic summaries and action items.
          <br />
          <span className="text-xs opacity-75">Voice commands: "Start", "Stop", "Summarize", "Read", "Reset"</span>
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
        isInitializing={isInitializing}
        isListening={isListening}
        isProcessing={isProcessing}
        speechStatus={speechStatus}
        hasTranscript={!!transcript}
        onStart={startListening}
        onStop={stopListening}
        onReset={handleReset}
        onSummarize={handleSummarize}
        onReadAloud={handleReadAloud}
      />

      {/* Speech playback player */}
      <SpeechPlayer />

      <div className="flex items-center gap-2">
        <Badge variant={isListening ? 'destructive' : isInitializing ? 'warning' : 'secondary'}>
          {isInitializing ? (
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-warning-foreground animate-spin" aria-hidden="true" />
              Preparing
            </span>
          ) : isListening ? (
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
            isInitializing={isInitializing}
            isListening={isListening}
          />
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle>Summary</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateMeetingPDF(summary, transcript)}
              aria-label="Export summary to PDF"
              className="ml-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <p className="text-sm leading-relaxed">{summary.summary}</p>
            
            {summary.tone_analysis && (
              <div className="rounded-md bg-muted/50 p-3 mt-4">
                <h4 className="text-sm font-medium mb-1 flex items-center gap-2">
                  Tone Analysis
                  {summary.sentiment && (
                    <Badge variant={
                      summary.sentiment === 'positive' || summary.sentiment === 'collaborative' ? 'secondary' : 
                      summary.sentiment === 'negative' || summary.sentiment === 'tense' ? 'destructive' : 'outline'
                    } className="text-[10px] h-5 px-1.5">
                      {summary.sentiment}
                    </Badge>
                  )}
                </h4>
                <p className="text-sm text-muted-foreground">{summary.tone_analysis}</p>
              </div>
            )}

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
