/**
 * Profile presets: per-disability recommended settings, tips, and feature rankings.
 * When a user selects a disability profile, these presets auto-configure their preferences
 * so the app immediately adapts to their needs.
 */

import type { DisabilityProfile, UserPreferences } from './types'

export interface ProfilePreset {
  /** Human-readable label */
  label: string
  /** Persona name from the PRD */
  persona: string
  /** Short persona story */
  personaStory: string
  /** Extended description for onboarding */
  description: string
  /** Preference overrides applied on top of defaults */
  preferencesOverride: Partial<UserPreferences>
  /** Profile-specific tips shown on the dashboard */
  tips: string[]
  /** Feature routes ranked by relevance (first = most relevant) */
  recommendedFeatures: string[]
  /** Which output modalities this profile emphasizes */
  primaryModalities: ('text' | 'voice' | 'haptic' | 'visual')[]
}

export const profilePresets: Record<DisabilityProfile, ProfilePreset> = {
  visual: {
    label: 'Visual Impairment',
    persona: 'Alex',
    personaStory: 'Admin assistant who relies on audio output for email summaries and meeting notes.',
    description:
      'Optimized for screen reader users and those with low vision. Enables high contrast, auto text-to-speech, and voice-first navigation so you can work without relying on the screen.',
    preferencesOverride: {
      auto_tts: true,
      high_contrast: true,
      font_size: 'large',
      haptic_feedback: true,
      output_mode: ['voice', 'haptic'],
    },
    tips: [
      'All AI responses are read aloud automatically.',
      'Use Ctrl+Shift+V to navigate pages by voice.',
      'Meeting transcripts can be played back with the speech player.',
      'Documents and emails are summarized and spoken to you.',
    ],
    recommendedFeatures: ['/documents', '/meeting', '/prompt-hub', '/schedule'],
    primaryModalities: ['voice', 'haptic'],
  },

  hearing: {
    label: 'Hearing Impairment',
    persona: 'Jamie',
    personaStory: 'Receptionist who needs real-time captions and visual cues for meetings and calls.',
    description:
      'Emphasizes visual output and haptic feedback. Meeting transcripts appear in large caption mode, vibration alerts replace audio cues, and all content is text-first.',
    preferencesOverride: {
      haptic_feedback: true,
      auto_tts: false,
      output_mode: ['visual', 'haptic', 'simplified'],
      simplified_ui: false,
    },
    tips: [
      'Meeting transcripts display in large caption mode for easy reading.',
      'Vibration alerts notify you of important events.',
      'All AI responses appear as text — no audio required.',
      'Use the visual recording indicator to know when transcription is active.',
    ],
    recommendedFeatures: ['/meeting', '/documents', '/prompt-hub', '/schedule'],
    primaryModalities: ['text', 'visual', 'haptic'],
  },

  cognitive: {
    label: 'Cognitive Disability',
    persona: 'Taylor',
    personaStory: 'Data entry worker who benefits from simplified interfaces and step-by-step guidance.',
    description:
      'Reduces complexity throughout the app. Shows step-by-step instructions, uses plain language, hides advanced options, and limits choices so each task feels manageable.',
    preferencesOverride: {
      simplified_ui: true,
      font_size: 'large',
      reduced_motion: true,
      auto_tts: true,
      output_mode: ['visual', 'simplified'],
    },
    tips: [
      'Each page shows numbered steps to guide you.',
      'Forms are simplified — only essential fields are shown.',
      'AI templates help you get started without typing from scratch.',
      'Responses are read aloud so you can listen instead of read.',
    ],
    recommendedFeatures: ['/prompt-hub', '/meeting', '/schedule', '/documents'],
    primaryModalities: ['text', 'visual', 'voice'],
  },

  dyslexia: {
    label: 'Dyslexia',
    persona: 'Taylor',
    personaStory: 'Office worker overwhelmed by text-heavy tasks who benefits from audio alternatives.',
    description:
      'Provides audio alternatives to text, larger and more spaced typography, and voice input so you can dictate instead of type. AI summaries condense long documents into manageable chunks.',
    preferencesOverride: {
      font_size: 'large',
      auto_tts: true,
      output_mode: ['voice', 'visual'],
    },
    tips: [
      'Click "Read Aloud" on any content to hear it spoken.',
      'Use the microphone to dictate instead of typing.',
      'AI can summarize long emails and documents into short paragraphs.',
      'The speech player lets you pause, seek, and replay at your pace.',
    ],
    recommendedFeatures: ['/documents', '/prompt-hub', '/meeting', '/schedule'],
    primaryModalities: ['voice', 'visual'],
  },

  motor: {
    label: 'Motor Disability',
    persona: 'Alex',
    personaStory: 'Office worker who uses voice commands and keyboard shortcuts instead of a mouse.',
    description:
      'Focuses on voice-driven interaction and keyboard navigation. Large touch targets, voice commands for all major actions, and minimal fine-motor requirements.',
    preferencesOverride: {
      auto_tts: true,
      font_size: 'large',
      output_mode: ['voice', 'visual'],
    },
    tips: [
      'Use Ctrl+Shift+V to navigate to any page by voice.',
      'Use Ctrl+Shift+F to trigger page actions by voice.',
      'All forms support microphone input — speak instead of type.',
      'Keyboard shortcuts: Enter to send, Escape to close.',
    ],
    recommendedFeatures: ['/prompt-hub', '/meeting', '/schedule', '/documents'],
    primaryModalities: ['voice', 'visual'],
  },
}

/** Apply a profile preset on top of existing preferences */
export function applyProfilePreset(
  currentPrefs: UserPreferences,
  profile: DisabilityProfile,
): UserPreferences {
  const preset = profilePresets[profile]
  return {
    ...currentPrefs,
    ...preset.preferencesOverride,
  }
}

/** Get merged preset for one or more profiles; null when array is empty */
export function getProfilePreset(
  profiles: DisabilityProfile[],
): ProfilePreset | null {
  if (!profiles.length) return null
  if (profiles.length === 1) return profilePresets[profiles[0]] ?? null
  return getMergedPreset(profiles)
}

/** Merge multiple profile presets (tips, recommendedFeatures, preferencesOverride) */
function getMergedPreset(profiles: DisabilityProfile[]): ProfilePreset {
  const first = profilePresets[profiles[0]]
  let merged: ProfilePreset = {
    ...first,
    label: profiles.length > 1 ? 'Multiple profiles' : first.label,
    persona: first.persona,
    personaStory: first.personaStory,
    description: first.description,
    preferencesOverride: { ...first.preferencesOverride },
    tips: [...first.tips],
    recommendedFeatures: [...first.recommendedFeatures],
    primaryModalities: [...first.primaryModalities],
  }
  for (let i = 1; i < profiles.length; i++) {
    const p = profilePresets[profiles[i]]
    if (!p) continue
    Object.assign(merged.preferencesOverride, p.preferencesOverride)
    merged.tips = [...new Set([...merged.tips, ...p.tips])]
    merged.recommendedFeatures = [...new Set([...merged.recommendedFeatures, ...p.recommendedFeatures])]
    merged.primaryModalities = [...new Set([...merged.primaryModalities, ...p.primaryModalities])]
  }
  return merged
}
