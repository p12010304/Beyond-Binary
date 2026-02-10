import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

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
        'rounded-[--radius-md] border border-border bg-card/80 p-4 overflow-y-auto neu-inset',
        'min-h-[200px] max-h-[400px]',
        className,
      )}
    >
      {isEmpty && !isListening && (
        <p className="text-muted-foreground text-sm text-center py-8">
          Press Start Recording to begin live transcription.
        </p>
      )}
      {isEmpty && isListening && (
        <p className="text-muted-foreground text-sm text-center py-8">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-destructive animate-recording" aria-hidden="true" />
            Listening. Speak into your microphone.
          </span>
        </p>
      )}
      {transcript && (
        <p className="text-foreground leading-relaxed whitespace-pre-wrap text-sm">
          {transcript}
        </p>
      )}
      {interimTranscript && (
        <span className="text-muted-foreground italic text-sm" aria-label="Partial transcription in progress">
          {' '}{interimTranscript}
        </span>
      )}
    </div>
  )
}
