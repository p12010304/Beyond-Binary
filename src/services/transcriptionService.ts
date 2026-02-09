/**
 * Transcription service using the Web Speech API.
 * Falls back gracefully when not available (e.g., Firefox).
 */

export interface TranscriptionCallbacks {
  onTranscript: (text: string, isFinal: boolean) => void
  onError: (error: string) => void
  onEnd: () => void
}

// Extend Window for vendor-prefixed SpeechRecognition
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  error: string
  message?: string
}

type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  const w = window as unknown as Record<string, unknown>
  return (w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null) as SpeechRecognitionConstructor | null
}

export function isSpeechRecognitionSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null
}

export function createTranscriptionSession(
  callbacks: TranscriptionCallbacks,
  lang = 'en-US',
): { start: () => void; stop: () => void } {
  const SpeechRecognition = getSpeechRecognitionConstructor()

  if (!SpeechRecognition) {
    return {
      start: () => callbacks.onError('Speech recognition is not supported in this browser. Try Chrome or Edge.'),
      stop: () => {},
    }
  }

  const recognition = new SpeechRecognition()
  recognition.continuous = true
  recognition.interimResults = true
  recognition.lang = lang

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i]
      const transcript = result[0].transcript
      const isFinal = result.isFinal
      callbacks.onTranscript(transcript, isFinal)
    }
  }

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    if (event.error === 'no-speech') return // Ignore no-speech errors
    callbacks.onError(`Speech recognition error: ${event.error}`)
  }

  recognition.onend = () => {
    callbacks.onEnd()
  }

  return {
    start: () => {
      try {
        recognition.start()
      } catch (e) {
        callbacks.onError(`Failed to start: ${e instanceof Error ? e.message : String(e)}`)
      }
    },
    stop: () => {
      try {
        recognition.stop()
      } catch {
        // Already stopped
      }
    },
  }
}
