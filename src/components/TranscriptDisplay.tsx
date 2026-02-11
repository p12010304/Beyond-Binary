import { useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTranscriptionEngine } from '@/services/transcriptionService'
import { useAccessibility } from '@/components/AccessibilityProvider'

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
  const { disabilityProfiles, wantsSimplified } = useAccessibility()

  const isCaptionMode = disabilityProfiles.includes('hearing')

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
      aria-label={isCaptionMode ? 'Live captions' : 'Live transcript'}
      className={cn(
        'rounded-[--radius-md] border border-border bg-card/80 p-4 overflow-y-auto neu-inset',
        isCaptionMode
          ? 'min-h-[250px] max-h-[500px] bg-foreground/95 dark:bg-foreground/90'
          : 'min-h-[200px] max-h-[400px]',
        className,
      )}
    >
      {isEmpty && !isListening && !isInitializing && (
        <p className={cn(
          'text-sm text-center py-8',
          isCaptionMode ? 'text-background/70' : 'text-muted-foreground',
        )}>
          {wantsSimplified
            ? 'Press Start Recording to begin.'
            : 'Press Start Recording to begin live transcription.'}
        </p>
      )}

      {isInitializing && (
        <p className={cn(
          'text-sm text-center py-8',
          isCaptionMode ? 'text-background/70' : 'text-muted-foreground',
        )}>
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            Preparing microphone&hellip; Please wait before speaking.
          </span>
        </p>
      )}

      {isEmpty && isListening && !isInitializing && (
        <p className={cn(
          'text-sm text-center py-8',
          isCaptionMode ? 'text-background/70' : 'text-muted-foreground',
        )}>
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
        <p className={cn(
          'leading-relaxed whitespace-pre-wrap',
          isCaptionMode
            ? 'text-background text-lg font-medium tracking-wide'
            : 'text-foreground text-sm',
        )}>
          {transcript}
        </p>
      )}
      {interimTranscript && (
        <span
          className={cn(
            'italic',
            isCaptionMode
              ? 'text-background/60 text-lg'
              : 'text-muted-foreground text-sm',
          )}
          aria-label="Partial transcription in progress"
        >
          {' '}{interimTranscript}
        </span>
      )}
    </div>
  )
}
