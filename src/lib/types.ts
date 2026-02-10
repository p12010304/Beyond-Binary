// Application-level types

export type DisabilityProfile = 'visual' | 'hearing' | 'cognitive' | 'dyslexia' | 'motor' | 'multiple'

export type OutputMode = 'voice' | 'visual' | 'haptic' | 'simplified'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface UserPreferences {
  output_mode: OutputMode[]
  theme: ThemeMode
  font_size: 'normal' | 'large' | 'extra-large'
  high_contrast: boolean
  reduced_motion: boolean
  haptic_feedback: boolean
  auto_tts: boolean
  simplified_ui: boolean
  tts_voice: string
}

export const defaultPreferences: UserPreferences = {
  output_mode: ['visual'],
  theme: 'system',
  font_size: 'normal',
  high_contrast: false,
  reduced_motion: false,
  haptic_feedback: false,
  auto_tts: false,
  simplified_ui: false,
  tts_voice: '21m00Tcm4TlvDq8ikWAM', // ElevenLabs Rachel
}

export interface Profile {
  id: string
  disability_profile: DisabilityProfile | null
  preferences: UserPreferences
  created_at: string
}

export interface ActionItem {
  task: string
  due: string | null
  completed: boolean
}

export interface MeetingNote {
  id: string
  user_id: string
  meeting_id: string
  transcript: string
  summary: string
  action_items: ActionItem[]
  created_at: string
}

export interface PromptHistoryEntry {
  id: string
  user_id: string
  prompt: string
  response: string
  mode: string
  created_at: string
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: string
  end: string
  location?: string
}

export interface AISummaryResult {
  summary: string
  action_items: ActionItem[]
  key_topics: string[]
}
