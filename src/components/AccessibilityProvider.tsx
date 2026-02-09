import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { UserPreferences, DisabilityProfile } from '@/lib/types'
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

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<UserPreferences>(() =>
    loadFromStorage(PREFERENCES_KEY, defaultPreferences),
  )
  const [disabilityProfile, setDisabilityProfileState] = useState<DisabilityProfile | null>(() =>
    loadFromStorage(PROFILE_KEY, null),
  )
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Persist preferences
  const setPreferences = (prefs: UserPreferences) => {
    setPreferencesState(prefs)
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs))
  }

  const setDisabilityProfile = (profile: DisabilityProfile | null) => {
    setDisabilityProfileState(profile)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  }

  // Apply global CSS classes based on preferences
  useEffect(() => {
    const root = document.documentElement
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
  }, [preferences])

  // TTS functions
  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Haptic feedback
  const vibrate = (pattern: number | number[] = 200) => {
    if (preferences.haptic_feedback && 'vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

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
