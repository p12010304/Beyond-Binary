import { useState, useCallback, useRef } from 'react'
import {
  createTranscriptionSession,
  isSpeechRecognitionSupported,
} from '@/services/transcriptionService'

export interface UseTranscriptionReturn {
  isListening: boolean
  transcript: string
  interimTranscript: string
  error: string | null
  isSupported: boolean
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

export function useTranscription(): UseTranscriptionReturn {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<{ start: () => void; stop: () => void } | null>(null)
  const isSupported = isSpeechRecognitionSupported()

  const startListening = useCallback(() => {
    setError(null)
    setInterimTranscript('')

    const session = createTranscriptionSession({
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setTranscript((prev) => (prev ? `${prev} ${text}` : text))
          setInterimTranscript('')
        } else {
          setInterimTranscript(text)
        }
      },
      onError: (err) => {
        setError(err)
        setIsListening(false)
      },
      onEnd: () => {
        // Auto-restart for continuous listening
        if (sessionRef.current) {
          try {
            sessionRef.current.start()
          } catch {
            setIsListening(false)
          }
        }
      },
    })

    sessionRef.current = session
    session.start()
    setIsListening(true)
  }, [])

  const stopListening = useCallback(() => {
    if (sessionRef.current) {
      const session = sessionRef.current
      sessionRef.current = null // Clear ref before stop to prevent auto-restart
      session.stop()
    }
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  }
}
