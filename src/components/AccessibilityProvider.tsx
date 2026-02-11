import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { UserPreferences, DisabilityProfile, ThemeMode } from '@/lib/types'
import { defaultPreferences } from '@/lib/types'
import {
  isElevenLabsAvailable,
  speakWithElevenLabs,
  stopElevenLabs,
  pauseElevenLabs,
  resumeElevenLabs,
  seekElevenLabs,
} from '@/services/elevenLabsTtsService'
import { useAuth } from '@/hooks/useSupabase'
import { supabase } from '@/lib/supabaseClient'

type TtsProvider = 'elevenlabs' | 'browser'

export type SpeechStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'ended'

interface AccessibilityContextType {
  preferences: UserPreferences
  setPreferences: (prefs: UserPreferences) => void
  disabilityProfiles: DisabilityProfile[]
  setDisabilityProfiles: (profiles: DisabilityProfile[]) => void
  speak: (text: string) => void
  stopSpeaking: () => void
  pauseSpeaking: () => void
  resumeSpeaking: () => void
  seekSpeech: (time: number) => void
  isSpeaking: boolean
  speechStatus: SpeechStatus
  speechCurrentTime: number
  speechDuration: number
  spokenText: string
  vibrate: (pattern?: number | number[]) => void
  resolvedTheme: 'light' | 'dark'
  setTheme: (mode: ThemeMode) => void
  ttsProvider: TtsProvider
  /** Derived from output_mode: user wants voice/audio output */
  wantsVoice: boolean
  /** Derived from output_mode: user wants haptic/vibration feedback */
  wantsHaptic: boolean
  /** Derived from output_mode: user wants simplified/plain-language UI */
  wantsSimplified: boolean
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

const PREFERENCES_KEY = 'accessadmin_preferences'
const PROFILE_KEY = 'accessadmin_disability_profile'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return fallback
    const parsed = JSON.parse(stored) as T
    // Merge with fallback so newly-added keys always exist
    if (typeof parsed === 'object' && parsed !== null && typeof fallback === 'object' && fallback !== null) {
      return { ...fallback, ...parsed }
    }
    return parsed
  } catch {
    return fallback
  }
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const VALID_DISABILITY_PROFILES: DisabilityProfile[] = ['visual', 'hearing', 'cognitive', 'dyslexia', 'motor']

function parseDisabilityProfiles(raw: unknown): DisabilityProfile[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (v): v is DisabilityProfile =>
      typeof v === 'string' && VALID_DISABILITY_PROFILES.includes(v as DisabilityProfile),
  )
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [preferences, setPreferencesState] = useState<UserPreferences>(() =>
    loadFromStorage(PREFERENCES_KEY, defaultPreferences),
  )
  const [disabilityProfiles, setDisabilityProfilesState] = useState<DisabilityProfile[]>(() => {
    const stored = loadFromStorage<DisabilityProfile[] | DisabilityProfile | null>(PROFILE_KEY, [])
    if (Array.isArray(stored)) return parseDisabilityProfiles(stored)
    if (stored && VALID_DISABILITY_PROFILES.includes(stored)) return [stored]
    return []
  })
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>('idle')
  const [speechCurrentTime, setSpeechCurrentTime] = useState(0)
  const [speechDuration, setSpeechDuration] = useState(0)
  const [spokenText, setSpokenText] = useState('')
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme)
  const profileFetchedForUser = useRef<string | null>(null)

  // Use ref to avoid stale closures in callbacks
  const speechStatusRef = useRef<SpeechStatus>('idle')
  speechStatusRef.current = speechStatus

  // When user logs in, fetch their profile from Supabase and set state (+ localStorage)
  useEffect(() => {
    if (!user?.id) {
      profileFetchedForUser.current = null
      return
    }
    if (profileFetchedForUser.current === user.id) return
    profileFetchedForUser.current = user.id

    supabase
      .from('profiles')
      .select('disability_profiles, preferences')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) return
        const prefs = {
          ...defaultPreferences,
          ...(data.preferences as Partial<UserPreferences>),
        } as UserPreferences
        const profiles = parseDisabilityProfiles(data.disability_profiles)
        setPreferencesState(prefs)
        setDisabilityProfilesState(profiles)
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles))
      })
  }, [user?.id])

  const isSpeaking = speechStatus === 'playing'

  const resolvedTheme: 'light' | 'dark' =
    preferences.theme === 'system' ? systemTheme : preferences.theme

  const ttsProvider: TtsProvider = isElevenLabsAvailable() ? 'elevenlabs' : 'browser'

  // Derived from output_mode for easy consumption across the app
  const wantsVoice = preferences.output_mode.includes('voice')
  const wantsHaptic = preferences.output_mode.includes('haptic')
  const wantsSimplified = preferences.output_mode.includes('simplified') || preferences.simplified_ui

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Persist preferences
  const setPreferences = useCallback((prefs: UserPreferences) => {
    setPreferencesState(prefs)
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
  }, [])

  const setDisabilityProfiles = useCallback((profiles: DisabilityProfile[]) => {
    setDisabilityProfilesState(profiles)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles))
  }, [])

  const setTheme = useCallback((mode: ThemeMode) => {
    setPreferences({ ...preferences, theme: mode })
  }, [preferences, setPreferences])

  // Apply global CSS classes based on preferences
  useEffect(() => {
    const root = document.documentElement

    // Theme
    root.classList.toggle('dark', resolvedTheme === 'dark')

    // Accessibility toggles
    root.classList.toggle('high-contrast', preferences.high_contrast)
    root.classList.toggle('large-text', preferences.font_size === 'large' || preferences.font_size === 'extra-large')
    root.classList.toggle('reduced-motion', preferences.reduced_motion)

    if (preferences.font_size === 'extra-large') {
      root.style.fontSize = '1.5rem'
    } else if (preferences.font_size === 'large') {
      root.style.fontSize = '1.25rem'
    } else {
      root.style.fontSize = ''
    }
  }, [preferences, resolvedTheme])

  // Reset speech state helper
  const resetSpeechState = useCallback(() => {
    setSpeechStatus('idle')
    setSpeechCurrentTime(0)
    setSpeechDuration(0)
    setSpokenText('')
  }, [])

  // Stop all speech engines
  const stopSpeaking = useCallback(() => {
    stopElevenLabs()
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    resetSpeechState()
  }, [resetSpeechState])

  // Pause speech
  const pauseSpeaking = useCallback(() => {
    if (isElevenLabsAvailable()) {
      pauseElevenLabs()
      setSpeechStatus('paused')
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.pause()
      setSpeechStatus('paused')
    }
  }, [])

  // Resume speech
  const resumeSpeaking = useCallback(() => {
    if (isElevenLabsAvailable()) {
      resumeElevenLabs()
      setSpeechStatus('playing')
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.resume()
      setSpeechStatus('playing')
    }
  }, [])

  // Seek to a specific time (seconds)
  const seekSpeech = useCallback((time: number) => {
    if (isElevenLabsAvailable()) {
      seekElevenLabs(time)
      setSpeechCurrentTime(time)
    }
    // Browser TTS doesn't support seeking
  }, [])

  // Browser TTS fallback
  const speakBrowser = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onstart = () => setSpeechStatus('playing')
    utterance.onend = () => {
      setSpeechStatus('ended')
      // Auto-reset after a moment
      setTimeout(() => {
        if (speechStatusRef.current === 'ended') {
          resetSpeechState()
        }
      }, 500)
    }
    utterance.onerror = () => resetSpeechState()
    window.speechSynthesis.speak(utterance)
  }, [resetSpeechState])

  // TTS: always stop first, then speak via ElevenLabs or browser
  const speak = useCallback((text: string) => {
    if (!text) return

    // Always cancel everything before starting new speech
    stopSpeaking()

    // Track spoken text
    setSpokenText(text)

    if (isElevenLabsAvailable()) {
      const voiceId = preferences.tts_voice || defaultPreferences.tts_voice
      setSpeechStatus('loading')

      speakWithElevenLabs(text, voiceId, {
        onLoading: () => setSpeechStatus('loading'),
        onStart: () => setSpeechStatus('playing'),
        onEnd: () => setSpeechStatus('ended'),
        onError: (errorMsg) => {
          console.warn('ElevenLabs TTS error:', errorMsg)
          resetSpeechState()
        },
        onTimeUpdate: (currentTime, duration) => {
          setSpeechCurrentTime(currentTime)
          setSpeechDuration(duration)
        },
      })
      return
    }

    speakBrowser(text)
  }, [preferences.tts_voice, stopSpeaking, speakBrowser, resetSpeechState])

  // Haptic feedback - respects both the boolean toggle and output_mode
  const vibrate = useCallback((pattern: number | number[] = 200) => {
    const shouldVibrate = preferences.haptic_feedback || preferences.output_mode.includes('haptic')
    if (shouldVibrate && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [preferences.haptic_feedback, preferences.output_mode])

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        setPreferences,
        disabilityProfiles,
        setDisabilityProfiles,
        speak,
        stopSpeaking,
        pauseSpeaking,
        resumeSpeaking,
        seekSpeech,
        isSpeaking,
        speechStatus,
        speechCurrentTime,
        speechDuration,
        spokenText,
        vibrate,
        resolvedTheme,
        setTheme,
        ttsProvider,
        wantsVoice,
        wantsHaptic,
        wantsSimplified,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}
