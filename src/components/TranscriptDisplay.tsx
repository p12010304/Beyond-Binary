import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useAccessibility } from '@/components/AccessibilityProvider'

interface TranscriptDisplayProps {
  transcript: string
  interimTranscript: string
  isListening: boolean
  className?: string
}

export default function TranscriptDisplay({
  transcript,
  interimTranscript,
  isListening,
  className,
}: TranscriptDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { preferences } = useAccessibility()

  // Auto-scroll to bottom as new text arrives
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [transcript, interimTranscript])

  const isEmpty = !transcript && !interimTranscript

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-label="Live transcript"
      className={cn(
        'rounded-lg border border-border bg-white p-4 overflow-y-auto',
        'min-h-[200px] max-h-[400px]',
        preferences.high_contrast && 'border-2 border-foreground',
        className,
      )}
    >
      {isEmpty && !isListening && (
        <p className="text-muted-foreground italic text-center py-8">
          Click "Start Recording" to begin live transcription.
        </p>
      )}
      {isEmpty && isListening && (
        <p className="text-muted-foreground italic text-center py-8">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />
            Listening... Speak into your microphone.
          </span>
        </p>
      )}
      {transcript && (
        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
          {transcript}
        </p>
      )}
      {interimTranscript && (
        <span className="text-muted-foreground italic" aria-label="Partial transcription in progress">
          {' '}{interimTranscript}
        </span>
      )}
    </div>
  )
}
