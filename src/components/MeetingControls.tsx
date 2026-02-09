import { Mic, MicOff, RotateCcw, Sparkles, Volume2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface MeetingControlsProps {
  isListening: boolean
  isProcessing: boolean
  hasTranscript: boolean
  onStart: () => void
  onStop: () => void
  onReset: () => void
  onSummarize: () => void
  onReadAloud: () => void
  className?: string
}

export default function MeetingControls({
  isListening,
  isProcessing,
  hasTranscript,
  onStart,
  onStop,
  onReset,
  onSummarize,
  onReadAloud,
  className,
}: MeetingControlsProps) {
  return (
    <div
      className={cn('flex flex-wrap gap-3', className)}
      role="toolbar"
      aria-label="Meeting controls"
    >
      {/* Record / Stop */}
      {isListening ? (
        <Button onClick={onStop} variant="destructive" size="lg" aria-label="Stop recording">
          <MicOff className="h-5 w-5" aria-hidden="true" />
          Stop Recording
        </Button>
      ) : (
        <Button onClick={onStart} size="lg" aria-label="Start recording">
          <Mic className="h-5 w-5" aria-hidden="true" />
          Start Recording
        </Button>
      )}

      {/* Summarize */}
      <Button
        onClick={onSummarize}
        variant="secondary"
        size="lg"
        disabled={!hasTranscript || isProcessing}
        aria-label="Generate AI summary from transcript"
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        )}
        {isProcessing ? 'Summarizing...' : 'AI Summary'}
      </Button>

      {/* Read Aloud */}
      <Button
        onClick={onReadAloud}
        variant="outline"
        size="lg"
        disabled={!hasTranscript}
        aria-label="Read transcript aloud"
      >
        <Volume2 className="h-5 w-5" aria-hidden="true" />
        Read Aloud
      </Button>

      {/* Reset */}
      <Button
        onClick={onReset}
        variant="ghost"
        size="lg"
        disabled={!hasTranscript && !isListening}
        aria-label="Reset transcript"
      >
        <RotateCcw className="h-5 w-5" aria-hidden="true" />
        Reset
      </Button>
    </div>
  )
}
