import { useState, useEffect } from 'react'
import { AlertCircle, Info } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import MeetingControls from '@/components/MeetingControls'
import SpeechPlayer from '@/components/SpeechPlayer'
import TranscriptDisplay from '@/components/TranscriptDisplay'
import ActionItems from '@/components/ActionItems'
import ModalityBadges from '@/components/ModalityBadges'
import { useTranscription } from '@/hooks/useTranscription'
import { useVoiceNavigation } from '@/hooks/useVoiceNavigation'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { summarizeMeeting } from '@/services/aiService'
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
  const { speak, stopSpeaking, speechStatus, vibrate, preferences, disabilities, wantsSimplified } = useAccessibility()

  const isHearing = disabilities.includes('hearing')
  const isCognitive = disabilities.includes('cognitive')

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
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Meeting Assist</h2>
          <ModalityBadges compact />
        </div>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {wantsSimplified
            ? 'Record a meeting. Get a summary and to-do list.'
            : 'Transcribe speech in real time with automatic summaries and action items.'}
          {!wantsSimplified && (
            <>
              <br />
              <span className="text-xs opacity-75">Voice commands: "Start", "Stop", "Summarize", "Read", "Reset"</span>
            </>
          )}
        </p>
      </div>

      {/* Cognitive profile: step-by-step guidance */}
      {isCognitive && (
        <div className="rounded-[--radius-lg] bg-primary/5 border border-primary/20 p-4">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" aria-hidden="true" />
            Follow these steps:
          </p>
          <ol className="space-y-1 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Badge variant={isListening || isInitializing ? 'success' : 'secondary'} className="shrink-0 text-xs">1</Badge>
              Click <strong>Start Recording</strong> and wait for "Ready".
            </li>
            <li className="flex gap-2">
              <Badge variant={!!transcript ? 'success' : 'secondary'} className="shrink-0 text-xs">2</Badge>
              Speak clearly. Your words appear below.
            </li>
            <li className="flex gap-2">
              <Badge variant={!!summary ? 'success' : 'secondary'} className="shrink-0 text-xs">3</Badge>
              Click <strong>Summarize</strong> to get a summary and action items.
            </li>
          </ol>
        </div>
      )}

      {/* Hearing profile: caption mode note */}
      {isHearing && (
        <div className="rounded-[--radius-lg] bg-accent/10 border border-accent/20 p-3 flex items-center gap-2 text-sm text-accent-foreground">
          <Info className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
          Caption mode is on. Transcript displays in large, high-contrast text below.
        </div>
      )}

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
