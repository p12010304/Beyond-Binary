import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createTranscriptionSession,
  isSpeechRecognitionSupported,
} from '@/services/transcriptionService'
import { useAppStore } from '@/store/appStore'
import { useAccessibility } from '@/components/AccessibilityProvider'

// Navigation map: spoken keywords -> routes
const NAVIGATION_MAP: Record<string, { route: string; keywords: string[] }> = {
  dashboard: { route: '/', keywords: ['dashboard', 'home', 'main'] },
  meeting: { route: '/meeting', keywords: ['meeting', 'meetings', 'transcribe', 'record'] },
  schedule: { route: '/schedule', keywords: ['schedule', 'calendar', 'events'] },
  documents: { route: '/documents', keywords: ['documents', 'document', 'files', 'email'] },
  prompt: { route: '/prompt-hub', keywords: ['prompt', 'prompts', 'ai', 'assistant'] },
  settings: { route: '/settings', keywords: ['settings', 'preferences', 'config'] },
}

// Global action registry for function navigation
type ActionHandler = () => void
const ACTION_REGISTRY = new Map<string, { handler: ActionHandler; keywords: string[] }>()

export type NavigationMode = 'page' | 'function'

export interface UseVoiceNavigationReturn {
  isListening: boolean
  mode: NavigationMode | null
  transcript: string
  error: string | null
  isSupported: boolean
  activate: (mode: NavigationMode) => void
  deactivate: () => void
  registerAction: (id: string, keywords: string[], handler: ActionHandler) => () => void
}

/**
 * Hook for voice-activated navigation.
 * Supports both page navigation and function execution.
 */
export function useVoiceNavigation(): UseVoiceNavigationReturn {
  const navigate = useNavigate()
  const { setVoiceNavigationActive } = useAppStore()
  const { stopSpeaking } = useAccessibility()
  const [isListening, setIsListening] = useState(false)
  const [mode, setMode] = useState<NavigationMode | null>(null)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sessionRef = useRef<{ start: () => void; stop: () => void } | null>(null)
  const isSupported = isSpeechRecognitionSupported()
  const timeoutRef = useRef<number | null>(null)
  const activationTimeoutRef = useRef<number | null>(null)
  
  // Match transcript to navigation route or action
  const matchAndExecute = useCallback(
    (text: string, currentMode: NavigationMode) => {
      const normalized = text.toLowerCase().trim()
      
      if (currentMode === 'page') {
        // Check page navigation
        for (const { route, keywords } of Object.values(NAVIGATION_MAP)) {
          if (keywords.some((kw) => normalized.includes(kw))) {
            console.log(`[Voice Nav] Page match: "${normalized}" -> ${route}`)
            navigate(route)
            return true
          }
        }
      } else if (currentMode === 'function') {
        // Check registered actions
        for (const [id, { handler, keywords }] of ACTION_REGISTRY.entries()) {
          if (keywords.some((kw) => normalized.includes(kw))) {
            console.log(`[Voice Nav] Function match: "${normalized}" -> ${id}`)
            handler()
            return true
          }
        }
      }
      
      console.log(`[Voice Nav] No match for: "${normalized}" (mode: ${currentMode})`)
      return false
    },
    [navigate],
  )

  // Auto-stop after timeout (prevent endless listening)
  const startTimeout = useCallback(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      console.log('[Voice Nav] Timeout - stopping')
      deactivate()
    }, 15000) // 15 second timeout for PTT safety
  }, [])

  // Register an action for function navigation
  const registerAction = useCallback(
    (id: string, keywords: string[], handler: ActionHandler) => {
      ACTION_REGISTRY.set(id, { handler, keywords })
      console.log(`[Voice Nav] Registered action: ${id} with keywords:`, keywords)
      
      // Return cleanup function
      return () => {
        ACTION_REGISTRY.delete(id)
        console.log(`[Voice Nav] Unregistered action: ${id}`)
      }
    },
    [],
  )

  const activate = useCallback((navMode: NavigationMode) => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser.')
      return
    }

    if (sessionRef.current) return // Prevent duplicate activation

    // IMMEDIATE: Stop any TTS playback so it doesn't interfere
    stopSpeaking()

    // Set global flag to pause other voice inputs
    setVoiceNavigationActive(true)

    setError(null)
    setTranscript('')
    setIsListening(true)
    setMode(navMode)
    startTimeout()

    // Create session but delay start to allow other hooks (useTranscription) to pause
    const session = createTranscriptionSession({
      onTranscript: (text, isFinal) => {
        console.log(`[Voice Nav] Transcript: "${text}" (final: ${isFinal})`)
        setTranscript(text)

        if (isFinal && text.trim()) {
          matchAndExecute(text, navMode)
          // Maintain listening state until PTT release, regardless of match
        }
      },
      onReady: () => {
        const modeText = navMode === 'page' ? 'pages' : 'functions'
        console.log(`[Voice Nav] Ready - listening for ${modeText}`)
      },
      onError: (err) => {
        console.error('[Voice Nav] Error:', err)
        setError(err)
      },
      onEnd: () => {
        if (sessionRef.current) {
          sessionRef.current = null
        }
      },
      // PTT requires continuous=true to prevent auto-stop on silence
    }, 'en-US', true)
    
    sessionRef.current = session

    // Delay start by 150ms to prevent race condition with useTranscription stop()
    if (activationTimeoutRef.current) clearTimeout(activationTimeoutRef.current)
    activationTimeoutRef.current = window.setTimeout(() => {
      // Create a fresh check for activity (checking store state directly is safest)
      const isActive = useAppStore.getState().voiceNavigationActive
      if (isActive && sessionRef.current) {
        try {
          sessionRef.current.start()
        } catch (e) {
          console.error('[Voice Nav] Start failed:', e)
        }
      }
    }, 150)

  }, [isSupported, matchAndExecute, startTimeout, setVoiceNavigationActive, stopSpeaking])

  const deactivate = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    if (activationTimeoutRef.current) {
      window.clearTimeout(activationTimeoutRef.current)
      activationTimeoutRef.current = null
    }
    
    // Stop session immediately
    if (sessionRef.current) {
      const session = sessionRef.current
      sessionRef.current = null
      
      session.stop()
    }
    
    setIsListening(false)
    setMode(null)
    setTranscript('')
    
    // Clear global flag to allow other voice inputs
    setVoiceNavigationActive(false)
  }, [setVoiceNavigationActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      if (sessionRef.current) sessionRef.current.stop()
    }
  }, [])

  return {
    isListening,
    mode,
    transcript,
    error,
    isSupported,
    activate,
    deactivate,
    registerAction,
  }
}
