/**
 * ElevenLabs text-to-speech service.
 * Generates natural-sounding speech via the ElevenLabs API.
 * Supports pause, resume, seek, and time-update tracking.
 */

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined

// Pre-defined voices (id -> label)
export const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Clear, calm female voice' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep, warm male voice' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Friendly, natural female voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft, gentle female voice' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Expressive male voice' },
] as const

const DEFAULT_VOICE_ID = '21m00Tcm4TlvDq8ikWAM' // Rachel

let currentAudio: HTMLAudioElement | null = null
let currentObjectUrl: string | null = null
let currentAbortController: AbortController | null = null
let timeUpdateHandler: (() => void) | null = null

export interface SpeechCallbacks {
  onLoading?: () => void
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
  onTimeUpdate?: (currentTime: number, duration: number) => void
}

export interface ElevenLabsPlaybackState {
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  currentTime: number
  duration: number
}

let playbackState: ElevenLabsPlaybackState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  duration: 0,
}

export function isElevenLabsAvailable(): boolean {
  return !!ELEVENLABS_API_KEY
}

export function getPlaybackState(): ElevenLabsPlaybackState {
  // Return live values from the audio element if available
  if (currentAudio) {
    return {
      ...playbackState,
      currentTime: currentAudio.currentTime,
      duration: currentAudio.duration || 0,
    }
  }
  return { ...playbackState }
}

function resetPlaybackState() {
  playbackState = {
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 0,
  }
}

function cleanup() {
  // Abort any in-flight fetch
  if (currentAbortController) {
    currentAbortController.abort()
    currentAbortController = null
  }

  // Remove timeupdate handler
  if (currentAudio && timeUpdateHandler) {
    currentAudio.removeEventListener('timeupdate', timeUpdateHandler)
    timeUpdateHandler = null
  }

  // Stop and discard current audio
  if (currentAudio) {
    currentAudio.onplay = null
    currentAudio.onended = null
    currentAudio.onerror = null
    currentAudio.onpause = null
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }

  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }

  resetPlaybackState()
}

export async function speakWithElevenLabs(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID,
  callbacks?: SpeechCallbacks,
): Promise<void> {
  if (!ELEVENLABS_API_KEY) {
    callbacks?.onError?.('ElevenLabs API key not configured')
    return
  }

  // Cancel any previous speech (in-flight request + playing audio)
  cleanup()

  const abortController = new AbortController()
  currentAbortController = abortController

  // Signal loading state
  playbackState = { ...playbackState, isLoading: true }
  callbacks?.onLoading?.()

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
        signal: abortController.signal,
      },
    )

    // If aborted while waiting for response, bail out silently
    if (abortController.signal.aborted) return

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error ${response.status}: ${errorText}`)
    }

    const audioBlob = await response.blob()

    // Check again after blob download
    if (abortController.signal.aborted) return

    currentObjectUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(currentObjectUrl)
    currentAudio = audio

    // Set up timeupdate listener for progress tracking
    const onTimeUpdate = () => {
      if (currentAudio === audio) {
        playbackState = {
          ...playbackState,
          currentTime: audio.currentTime,
          duration: audio.duration || 0,
        }
        callbacks?.onTimeUpdate?.(audio.currentTime, audio.duration || 0)
      }
    }
    timeUpdateHandler = onTimeUpdate
    audio.addEventListener('timeupdate', onTimeUpdate)

    audio.onplay = () => {
      playbackState = {
        ...playbackState,
        isPlaying: true,
        isPaused: false,
        isLoading: false,
        duration: audio.duration || 0,
      }
      callbacks?.onStart?.()
    }

    audio.onpause = () => {
      if (currentAudio === audio) {
        playbackState = {
          ...playbackState,
          isPlaying: false,
          isPaused: true,
        }
      }
    }

    audio.onended = () => {
      if (currentAudio === audio) {
        // Don't cleanup -- keep audio around so user can replay/seek
        playbackState = {
          ...playbackState,
          isPlaying: false,
          isPaused: false,
          currentTime: audio.duration || 0,
        }
      }
      callbacks?.onEnd?.()
    }

    audio.onerror = () => {
      if (currentAudio === audio) {
        cleanup()
      }
      callbacks?.onError?.('Audio playback failed')
    }

    await audio.play()
  } catch (err) {
    // Ignore abort errors (expected when user clicks again)
    if (err instanceof DOMException && err.name === 'AbortError') return
    if (abortController.signal.aborted) return

    cleanup()
    callbacks?.onError?.(err instanceof Error ? err.message : 'ElevenLabs TTS failed')
  }
}

export function pauseElevenLabs(): void {
  if (currentAudio && !currentAudio.paused) {
    currentAudio.pause()
    playbackState = { ...playbackState, isPlaying: false, isPaused: true }
  }
}

export function resumeElevenLabs(): void {
  if (currentAudio && currentAudio.paused && currentAudio.src) {
    currentAudio.play().catch(() => {
      // Ignore play errors (e.g. user interaction requirement)
    })
    playbackState = { ...playbackState, isPlaying: true, isPaused: false }
  }
}

export function seekElevenLabs(time: number): void {
  if (currentAudio && currentAudio.duration) {
    const clampedTime = Math.max(0, Math.min(time, currentAudio.duration))
    currentAudio.currentTime = clampedTime
    playbackState = { ...playbackState, currentTime: clampedTime }
  }
}

export function stopElevenLabs(): void {
  cleanup()
}
