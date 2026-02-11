import { useEffect, useRef } from 'react'
import { Loader2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getTranscriptionEngine } from '@/services/transcriptionService'
import { useAccessibility } from '@/components/AccessibilityProvider'

interface TranscriptDisplayProps {
  transcript: string
  /** Called when the user edits the transcript text */
  onTranscriptChange?: (value: string) => void
  interimTranscript: string
  isInitializing?: boolean
  isListening: boolean
  className?: string
}

export default function TranscriptDisplay({
  transcript,
  onTranscriptChange,
  interimTranscript,
  isInitializing = false,
  isListening,
  className,
}: TranscriptDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const engine = getTranscriptionEngine()
  const { disabilityProfile, wantsSimplified } = useAccessibility()

  const isCaptionMode = disabilityProfile === 'hearing'
  const isEditable = !isListening && !isInitializing && !!transcript && !!onTranscriptChange

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [transcript, interimTranscript])

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [transcript, isEditable])

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

      {transcript && isEditable ? (
        <>
          <div className="flex items-center gap-1.5 mb-2">
            <Pencil className="h-3 w-3 text-muted-foreground" aria-hidden="true" />
            <span className="text-xs text-muted-foreground">Click to edit transcript</span>
          </div>
          <textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            className={cn(
              'w-full resize-none bg-transparent border-none outline-none p-0',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'leading-relaxed whitespace-pre-wrap',
              isCaptionMode
                ? 'text-background text-lg font-medium tracking-wide'
                : 'text-foreground text-sm',
            )}
            aria-label="Editable transcript — make corrections here"
          />
        </>
      ) : transcript ? (
        <p className={cn(
          'leading-relaxed whitespace-pre-wrap',
          isCaptionMode
            ? 'text-background text-lg font-medium tracking-wide'
            : 'text-foreground text-sm',
        )}>
          {transcript}
        </p>
      ) : null}

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
