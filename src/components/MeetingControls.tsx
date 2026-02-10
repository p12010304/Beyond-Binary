import { Mic, MicOff, RotateCcw, ListChecks, Volume2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { SpeechStatus } from '@/components/AccessibilityProvider'

interface MeetingControlsProps {
  isInitializing: boolean
  isListening: boolean
  isProcessing: boolean
  speechStatus: SpeechStatus
  hasTranscript: boolean
  onStart: () => void
  onStop: () => void
  onReset: () => void
  onSummarize: () => void
  onReadAloud: () => void
  className?: string
}

export default function MeetingControls({
  isInitializing,
  isListening,
  isProcessing,
  speechStatus,
  hasTranscript,
  onStart,
  onStop,
  onReset,
  onSummarize,
  onReadAloud,
  className,
}: MeetingControlsProps) {
  const isLoadingAudio = speechStatus === 'loading'
  const isSpeechActive = speechStatus === 'playing' || speechStatus === 'paused' || speechStatus === 'loading'

  return (
    <div
      className={cn('flex flex-wrap gap-3', className)}
      role="toolbar"
      aria-label="Meeting controls"
    >
      {isInitializing ? (
        <Button disabled variant="default" aria-label="Preparing microphone">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Preparing...
        </Button>
      ) : isListening ? (
        <Button onClick={onStop} variant="destructive" aria-label="Stop recording">
          <MicOff className="h-4 w-4" aria-hidden="true" />
          Stop Recording
        </Button>
      ) : (
        <Button onClick={onStart} aria-label="Start recording">
          <Mic className="h-4 w-4" aria-hidden="true" />
          Start Recording
        </Button>
      )}

      <Button
        onClick={onSummarize}
        variant="secondary"
        disabled={!hasTranscript || isProcessing}
        aria-label="Generate summary from transcript"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <ListChecks className="h-4 w-4" aria-hidden="true" />
        )}
        {isProcessing ? 'Summarizing...' : 'Summarize'}
      </Button>

      <Button
        onClick={onReadAloud}
        variant="outline"
        disabled={!hasTranscript || isSpeechActive}
        aria-label={isLoadingAudio ? 'Loading audio' : 'Read transcript aloud'}
      >
        {isLoadingAudio ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        )}
        {isLoadingAudio ? 'Loading...' : 'Read Aloud'}
      </Button>

      <Button
        onClick={onReset}
        variant="ghost"
        disabled={!hasTranscript && !isListening && !isInitializing}
        aria-label="Reset transcript"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Reset
      </Button>
    </div>
  )
}
