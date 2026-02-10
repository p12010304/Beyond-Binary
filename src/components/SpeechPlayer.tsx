import { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { Play, Pause, Square, Loader2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccessibility } from '@/components/AccessibilityProvider'

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

interface SpeechPlayerProps {
  className?: string
}

export default function SpeechPlayer({ className }: SpeechPlayerProps) {
  const {
    speechStatus,
    speechCurrentTime,
    speechDuration,
    spokenText,
    pauseSpeaking,
    resumeSpeaking,
    seekSpeech,
    stopSpeaking,
    speak,
  } = useAccessibility()

  const progressBarRef = useRef<HTMLDivElement>(null)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)

  // Split text into words for highlighting
  const words = useMemo(() => {
    if (!spokenText) return []
    return spokenText.split(/(\s+)/).filter(Boolean)
  }, [spokenText])

  // Estimate which word is currently being spoken
  const currentWordIndex = useMemo(() => {
    if (!speechDuration || speechDuration === 0) return -1
    const progress = (isDragging ? dragTime : speechCurrentTime) / speechDuration
    // Only count actual words (not whitespace tokens)
    const wordTokens = words.filter(w => w.trim().length > 0)
    const totalWords = wordTokens.length
    if (totalWords === 0) return -1
    const wordIdx = Math.floor(progress * totalWords)
    return Math.min(wordIdx, totalWords - 1)
  }, [speechCurrentTime, speechDuration, words, isDragging, dragTime])

  // Map word-only index back to token index (including whitespace)
  const currentTokenIndex = useMemo(() => {
    if (currentWordIndex < 0) return -1
    let wordCount = 0
    for (let i = 0; i < words.length; i++) {
      if (words[i].trim().length > 0) {
        if (wordCount === currentWordIndex) return i
        wordCount++
      }
    }
    return -1
  }, [currentWordIndex, words])

  // Auto-scroll to keep the highlighted word visible
  useEffect(() => {
    if (currentTokenIndex < 0 || !textContainerRef.current) return
    const highlighted = textContainerRef.current.querySelector('[data-speech-active="true"]')
    if (highlighted) {
      highlighted.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
    }
  }, [currentTokenIndex])

  // Progress fraction (0-1)
  const progressFraction = useMemo(() => {
    if (!speechDuration || speechDuration === 0) return 0
    const time = isDragging ? dragTime : speechCurrentTime
    return Math.min(time / speechDuration, 1)
  }, [speechCurrentTime, speechDuration, isDragging, dragTime])

  // Handle clicking/dragging on the progress bar
  const getTimeFromEvent = useCallback(
    (clientX: number) => {
      if (!progressBarRef.current || !speechDuration) return 0
      const rect = progressBarRef.current.getBoundingClientRect()
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      return fraction * speechDuration
    },
    [speechDuration],
  )

  const handleProgressClick = useCallback(
    (e: React.MouseEvent) => {
      const time = getTimeFromEvent(e.clientX)
      seekSpeech(time)
      // If ended, restart playback from this point
      if (speechStatus === 'ended') {
        seekSpeech(time)
        resumeSpeaking()
      }
    },
    [getTimeFromEvent, seekSpeech, speechStatus, resumeSpeaking],
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      setDragTime(getTimeFromEvent(e.clientX))
    },
    [getTimeFromEvent],
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setDragTime(getTimeFromEvent(e.clientX))
    }

    const handleMouseUp = (e: MouseEvent) => {
      const time = getTimeFromEvent(e.clientX)
      seekSpeech(time)
      setIsDragging(false)
      if (speechStatus === 'ended') {
        resumeSpeaking()
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, getTimeFromEvent, seekSpeech, speechStatus, resumeSpeaking])

  // Handle clicking on a word to seek
  const handleWordClick = useCallback(
    (tokenIndex: number) => {
      // Count word-only index for the token
      let wordIdx = 0
      for (let i = 0; i < tokenIndex; i++) {
        if (words[i].trim().length > 0) wordIdx++
      }
      const totalWords = words.filter(w => w.trim().length > 0).length
      if (totalWords === 0 || !speechDuration) return
      const time = (wordIdx / totalWords) * speechDuration
      seekSpeech(time)
      if (speechStatus === 'paused' || speechStatus === 'ended') {
        resumeSpeaking()
      }
    },
    [words, speechDuration, seekSpeech, speechStatus, resumeSpeaking],
  )

  // Handle keyboard navigation on progress bar
  const handleProgressKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!speechDuration) return
      const step = speechDuration * 0.05 // 5% steps
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        seekSpeech(Math.max(0, speechCurrentTime - step))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        seekSpeech(Math.min(speechDuration, speechCurrentTime + step))
      }
    },
    [speechDuration, speechCurrentTime, seekSpeech],
  )

  const handlePlayPause = useCallback(() => {
    if (speechStatus === 'playing') {
      pauseSpeaking()
    } else if (speechStatus === 'paused') {
      resumeSpeaking()
    } else if (speechStatus === 'ended') {
      // Replay from beginning
      seekSpeech(0)
      resumeSpeaking()
    }
  }, [speechStatus, pauseSpeaking, resumeSpeaking, seekSpeech])

  const handleReplay = useCallback(() => {
    if (spokenText) {
      speak(spokenText)
    }
  }, [speak, spokenText])

  // Don't render if there's nothing to show
  if (speechStatus === 'idle' && !spokenText) return null

  const isLoading = speechStatus === 'loading'
  const isPlaying = speechStatus === 'playing'
  const isPaused = speechStatus === 'paused'
  const isEnded = speechStatus === 'ended'
  const showPlayer = isLoading || isPlaying || isPaused || isEnded

  if (!showPlayer) return null

  return (
    <div
      className={cn(
        'glass neu-raised rounded-[--radius-lg] overflow-hidden',
        'transition-all duration-[--duration-normal] ease-[--ease-out]',
        className,
      )}
      role="region"
      aria-label="Speech playback controls"
    >
      {/* Controls row */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        {/* Play / Pause / Loading button */}
        <button
          onClick={handlePlayPause}
          disabled={isLoading}
          className={cn(
            'flex items-center justify-center w-9 h-9 rounded-full',
            'transition-all duration-[--duration-fast] ease-[--ease-out]',
            'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
            isLoading
              ? 'bg-muted text-muted-foreground cursor-wait'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95',
          )}
          aria-label={
            isLoading
              ? 'Loading audio'
              : isPlaying
                ? 'Pause'
                : isPaused
                  ? 'Resume'
                  : 'Replay'
          }
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : isPlaying ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4 ml-0.5" aria-hidden="true" />
          )}
        </button>

        {/* Progress bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs tabular-nums text-muted-foreground w-9 text-right shrink-0" aria-hidden="true">
            {formatTime(isDragging ? dragTime : speechCurrentTime)}
          </span>

          <div
            ref={progressBarRef}
            role="slider"
            aria-label="Playback progress"
            aria-valuemin={0}
            aria-valuemax={speechDuration || 100}
            aria-valuenow={isDragging ? dragTime : speechCurrentTime}
            aria-valuetext={`${formatTime(isDragging ? dragTime : speechCurrentTime)} of ${formatTime(speechDuration)}`}
            tabIndex={0}
            className={cn(
              'relative flex-1 h-2 rounded-full cursor-pointer group',
              'bg-border neu-inset',
            )}
            onClick={handleProgressClick}
            onMouseDown={handleMouseDown}
            onKeyDown={handleProgressKeyDown}
          >
            {/* Filled portion */}
            <div
              className={cn(
                'absolute top-0 left-0 h-full rounded-full',
                'transition-[width] duration-100 ease-linear',
                isLoading ? 'bg-muted-foreground/40 animate-pulse' : 'bg-primary',
              )}
              style={{ width: `${progressFraction * 100}%` }}
            />

            {/* Thumb / scrubber */}
            {!isLoading && (
              <div
                className={cn(
                  'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
                  'w-3.5 h-3.5 rounded-full bg-primary border-2 border-primary-foreground',
                  'shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-[--duration-fast]',
                  isDragging && 'opacity-100 scale-110',
                )}
                style={{ left: `${progressFraction * 100}%` }}
                aria-hidden="true"
              />
            )}
          </div>

          <span className="text-xs tabular-nums text-muted-foreground w-9 shrink-0" aria-hidden="true">
            {formatTime(speechDuration)}
          </span>
        </div>

        {/* Replay button */}
        {isEnded && (
          <button
            onClick={handleReplay}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full',
              'text-muted-foreground hover:text-foreground hover:bg-muted',
              'transition-all duration-[--duration-fast] ease-[--ease-out]',
              'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
            )}
            aria-label="Replay from beginning"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}

        {/* Stop / close button */}
        <button
          onClick={stopSpeaking}
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full',
            'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
            'transition-all duration-[--duration-fast] ease-[--ease-out]',
            'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
          )}
          aria-label="Stop and close player"
        >
          <Square className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Word-highlighted text */}
      {spokenText && !isLoading && (
        <div
          ref={textContainerRef}
          className={cn(
            'px-4 pb-3 pt-1 max-h-28 overflow-y-auto',
            'text-sm leading-relaxed',
          )}
          aria-label="Spoken text with word tracking"
        >
          {words.map((token, i) => {
            const isWhitespace = token.trim().length === 0
            if (isWhitespace) {
              return <span key={i}>{token}</span>
            }

            const isActive = i === currentTokenIndex && (isPlaying || isDragging)
            const isPast = currentTokenIndex >= 0 && i < currentTokenIndex && (isPlaying || isPaused || isDragging)

            return (
              <span
                key={i}
                data-speech-active={isActive ? 'true' : undefined}
                onClick={() => handleWordClick(i)}
                className={cn(
                  'cursor-pointer rounded-[2px] transition-colors duration-100',
                  'hover:bg-primary/10',
                  isActive && 'bg-primary/20 text-primary font-semibold speech-word-active',
                  isPast && 'text-muted-foreground',
                  !isActive && !isPast && 'text-foreground',
                )}
                role="button"
                tabIndex={-1}
                aria-label={`Seek to word: ${token}`}
              >
                {token}
              </span>
            )
          })}
        </div>
      )}

      {/* Loading text state */}
      {isLoading && (
        <div className="px-4 pb-3 pt-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block w-full h-4 rounded skeleton-shimmer" />
          </div>
        </div>
      )}
    </div>
  )
}
