import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTranscriptionEngine } from '@/services/transcriptionService'

interface TranscriptDisplayProps {
  transcript: string
  interimTranscript: string
  isInitializing?: boolean
  isListening: boolean
  className?: string
}

export default function TranscriptDisplay({
  transcript,
  interimTranscript,
  isInitializing = false,
  isListening,
  className,
}: TranscriptDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const engine = getTranscriptionEngine()

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
      {isEmpty && !isListening && !isInitializing && (
        <p className="text-muted-foreground text-sm text-center py-8">
          Press Start Recording to begin live transcription.
        </p>
      )}

      {isInitializing && (
        <p className="text-muted-foreground text-sm text-center py-8">
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            Preparing microphone&hellip; Please wait before speaking.
          </span>
        </p>
      )}

      {isEmpty && isListening && !isInitializing && (
        <p className="text-muted-foreground text-sm text-center py-8">
          <span className="inline-flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success animate-recording" aria-hidden="true" />
              <span className="text-success font-medium">Ready</span>
            </span>
            <span>
              {engine === 'groq'
                ? 'Listening now. Transcription updates every few seconds.'
                : 'Listening now. Speak into your microphone.'}
            </span>
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
