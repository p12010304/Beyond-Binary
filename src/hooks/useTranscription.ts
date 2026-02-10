import { useState, useCallback, useRef, useEffect } from 'react'
import {
  createTranscriptionSession,
  isSpeechRecognitionSupported,
} from '@/services/transcriptionService'
import { useAppStore } from '@/store/appStore'

export interface UseTranscriptionReturn {
  /** True while the microphone is initializing (before audio capture begins) */
  isInitializing: boolean
  /** True once the microphone is live and actively capturing audio */
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
  const { voiceNavigationActive } = useAppStore()
  const [isInitializing, setIsInitializing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<{ start: () => void; stop: () => void } | null>(null)
  const pausedByNavigationRef = useRef(false)
  const isSupported = isSpeechRecognitionSupported()

  const startListening = useCallback(() => {
    setError(null)
    setInterimTranscript('')
    setIsInitializing(true)
    setIsListening(false)

    const session = createTranscriptionSession({
      onTranscript: (text, isFinal) => {
        if (isFinal) {
          setTranscript((prev) => (prev ? `${prev} ${text}` : text))
          setInterimTranscript('')
        } else {
          setInterimTranscript(text)
        }
      },
      onReady: () => {
        // Microphone is live — switch from initializing to listening
        setIsInitializing(false)
        setIsListening(true)
      },
      onError: (err) => {
        setError(err)
        setIsInitializing(false)
        setIsListening(false)
      },
      onEnd: () => {
        // Auto-restart for continuous listening
        if (sessionRef.current) {
          try {
            sessionRef.current.start()
          } catch {
            setIsInitializing(false)
            setIsListening(false)
          }
        }
      },
    })

    sessionRef.current = session
    session.start()
  }, [])

  const stopListening = useCallback(() => {
    if (sessionRef.current) {
      const session = sessionRef.current
      sessionRef.current = null // Clear ref before stop to prevent auto-restart
      session.stop()
    }
    
    // Explicit stop should prevent auto-resume from voice navigation
    pausedByNavigationRef.current = false
    
    setIsInitializing(false)
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  // Pause transcription when voice navigation is active
  useEffect(() => {
    if (voiceNavigationActive && isListening) {
      console.log('[Transcription] Pausing for voice navigation')
      pausedByNavigationRef.current = true
      
      // CRITICAL: Clear sessionRef BEFORE stopping to prevent auto-restart in onEnd
      if (sessionRef.current) {
        const session = sessionRef.current
        sessionRef.current = null 
        session.stop()
      }
      
      setIsListening(false)
      setIsInitializing(false)
    } else if (!voiceNavigationActive && pausedByNavigationRef.current) {
      console.log('[Transcription] Resuming after voice navigation')
      pausedByNavigationRef.current = false
      // Auto-resume after a short delay
      setTimeout(() => {
        startListening()
      }, 300)
    }
  }, [voiceNavigationActive, isListening, startListening])

  return {
    isInitializing,
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
