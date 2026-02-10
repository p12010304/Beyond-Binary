import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { UserPreferences, DisabilityProfile, ThemeMode } from '@/lib/types'
import { defaultPreferences } from '@/lib/types'

interface AccessibilityContextType {
  preferences: UserPreferences
  setPreferences: (prefs: UserPreferences) => void
  disabilityProfile: DisabilityProfile | null
  setDisabilityProfile: (profile: DisabilityProfile | null) => void
  speak: (text: string) => void
  stopSpeaking: () => void
  isSpeaking: boolean
  vibrate: (pattern?: number | number[]) => void
  resolvedTheme: 'light' | 'dark'
  setTheme: (mode: ThemeMode) => void
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

const PREFERENCES_KEY = 'accessadmin_preferences'
const PROFILE_KEY = 'accessadmin_disability_profile'

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() =>
    loadFromStorage(PREFERENCES_KEY, defaultPreferences),
  )
  const [disabilityProfile, setDisabilityProfileState] = useState<DisabilityProfile | null>(() =>
    loadFromStorage(PROFILE_KEY, null),
  )
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme)

  const resolvedTheme: 'light' | 'dark' =
    preferences.theme === 'system' ? systemTheme : preferences.theme

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

  const setDisabilityProfile = useCallback((profile: DisabilityProfile | null) => {
    setDisabilityProfileState(profile)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
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

  // TTS functions
  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }, [])

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [])

  // Haptic feedback
  const vibrate = useCallback((pattern: number | number[] = 200) => {
    if (preferences.haptic_feedback && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [preferences.haptic_feedback])

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        setPreferences,
        disabilityProfile,
        setDisabilityProfile,
        speak,
        stopSpeaking,
        isSpeaking,
        vibrate,
        resolvedTheme,
        setTheme,
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
