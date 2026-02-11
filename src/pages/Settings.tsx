import { useState } from 'react'
import { Save, RotateCcw, Volume2, Eye, Hand, Brain, Type, Sun, Moon, Monitor, Mic, CheckCircle2, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAccessibility } from '@/components/AccessibilityProvider'
import type { DisabilityProfile, OutputMode, UserPreferences, ThemeMode } from '@/lib/types'
import { defaultPreferences } from '@/lib/types'
import { cn } from '@/lib/utils'
import { isElevenLabsAvailable, ELEVENLABS_VOICES } from '@/services/elevenLabsTtsService'
import { getTranscriptionEngine } from '@/services/transcriptionService'
import { applyProfilePreset, profilePresets } from '@/lib/profilePresets'

const disabilityOptions: { value: DisabilityProfile; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'visual', label: 'Visual', icon: Eye, description: 'Screen reader, audio output, high contrast' },
  { value: 'hearing', label: 'Hearing', icon: Volume2, description: 'Visual captions, text output, vibration' },
  { value: 'cognitive', label: 'Cognitive', icon: Brain, description: 'Simplified UI, step-by-step guidance' },
  { value: 'dyslexia', label: 'Dyslexia', icon: Type, description: 'Audio alternatives, larger text, visual aids' },
  { value: 'motor', label: 'Motor', icon: Hand, description: 'Voice commands, large touch targets' },
]

const outputModes: { value: OutputMode; label: string; description: string }[] = [
  { value: 'voice', label: 'Voice Output', description: 'Read content aloud via text-to-speech' },
  { value: 'visual', label: 'Visual Output', description: 'Display text with captions and icons' },
  { value: 'haptic', label: 'Haptic Feedback', description: 'Vibration alerts for notifications' },
  { value: 'simplified', label: 'Simplified', description: 'Reduced complexity, plain language' },
]

const themeOptions: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

export default function Settings() {
  const {
    preferences,
    setPreferences,
    disabilities,
    setDisabilities,
    setTheme,
    speak,
  } = useAccessibility()

  const [localPrefs, setLocalPrefs] = useState<UserPreferences>({ ...preferences })
  const [localProfile, setLocalProfile] = useState<DisabilityProfile[]>(disabilities)
  const [saved, setSaved] = useState(false)
  const [profileApplied, setProfileApplied] = useState<string | null>(null)

  const handleProfileToggle = (profile: DisabilityProfile) => {
    const next = localProfile.includes(profile)
      ? localProfile.filter((p) => p !== profile)
      : [...localProfile, profile]
    setLocalProfile(next)
    if (next.length > 0) {
      // Apply presets in sequence so multiple profiles merge preferences
      let newPrefs = { ...localPrefs }
      for (const p of next) {
        newPrefs = applyProfilePreset(newPrefs, p)
      }
      setLocalPrefs(newPrefs)
      const preset = profilePresets[profile]
      setProfileApplied(preset.label)
      setTimeout(() => setProfileApplied(null), 4000)
    } else {
      setLocalPrefs({ ...defaultPreferences })
      setProfileApplied(null)
    }
  }

  const handleProfileClear = () => {
    setLocalProfile([])
    setLocalPrefs({ ...defaultPreferences })
    setProfileApplied(null)
  }

  const handleRerunOnboarding = () => {
    localStorage.removeItem('accessadmin_onboarding_complete')
    window.location.reload()
  }

  const handleOutputModeToggle = (mode: OutputMode) => {
    setLocalPrefs((prev) => ({
      ...prev,
      output_mode: prev.output_mode.includes(mode)
        ? prev.output_mode.filter((m) => m !== mode)
        : [...prev.output_mode, mode],
    }))
  }

  const handleSave = () => {
    setPreferences(localPrefs)
    setDisabilities(localProfile.length ? localProfile : [])
    setSaved(true)
    speak('Settings saved.')
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setLocalPrefs({ ...defaultPreferences })
    setLocalProfile([])
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Configure your accessibility preferences and connected accounts.
        </p>
      </div>

      {/* Disability Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Disability Profile</CardTitle>
          <CardDescription>
            Select one or more profiles to auto-configure accessibility features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4" role="group" aria-label="Disability profile selection">
            {disabilityOptions.map((option) => {
              const isSelected = localProfile.includes(option.value)
              return (
                <button
                  key={option.value}
                  onClick={() => handleProfileToggle(option.value)}
                  className={cn(
                    'flex flex-col items-start gap-2 rounded-[--radius-lg] border-2 p-4 text-left',
                    'transition-all duration-[--duration-fast] ease-[--ease-out]',
                    'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border',
                  )}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={`${option.label}: ${option.description}`}
                >
                  <option.icon
                    className={cn('h-[1.125rem] w-[1.125rem]', isSelected ? 'text-primary' : 'text-muted-foreground')}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium leading-tight">{option.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
          {localProfile.length > 0 && (
            <Button variant="ghost" size="sm" className="mt-3" onClick={handleProfileClear}>
              Clear selection
            </Button>
          )}

          {profileApplied && (
            <div
              className="mt-3 flex items-center gap-2 rounded-[--radius-md] bg-success/10 border border-success/30 px-3 py-2 text-sm text-success"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Settings auto-configured for {profileApplied}. You can adjust below.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2" role="radiogroup" aria-label="Theme selection">
            {themeOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={localPrefs.theme === opt.value ? 'default' : 'outline'}
                onClick={() => {
                  setLocalPrefs((p) => ({ ...p, theme: opt.value }))
                  setTheme(opt.value) // Apply immediately so the user sees the change
                }}
                role="radio"
                aria-checked={localPrefs.theme === opt.value}
                aria-label={`${opt.label} theme`}
              >
                <opt.icon className="h-4 w-4" aria-hidden="true" />
                {opt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice & Transcription */}
      <Card>
        <CardHeader>
          <CardTitle>Voice & Transcription</CardTitle>
          <CardDescription>
            Speech engines used for transcription and text-to-speech.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* STT engine indicator */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium leading-tight flex items-center gap-2">
                <Mic className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Speech-to-Text
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                {getTranscriptionEngine() === 'groq'
                  ? 'Groq Whisper (high accuracy, auto-punctuated)'
                  : getTranscriptionEngine() === 'web-speech'
                    ? 'Browser Web Speech API (requires Chrome/Edge)'
                    : 'Not available in this browser'}
              </p>
            </div>
            <Badge variant={getTranscriptionEngine() !== 'none' ? 'success' : 'secondary'}>
              {getTranscriptionEngine() === 'groq' ? 'Groq' : getTranscriptionEngine() === 'web-speech' ? 'Browser' : 'None'}
            </Badge>
          </div>

          {/* TTS engine indicator */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium leading-tight flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Text-to-Speech
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                {isElevenLabsAvailable()
                  ? 'ElevenLabs (natural voice)'
                  : 'Browser SpeechSynthesis (default OS voice)'}
              </p>
            </div>
            <Badge variant={isElevenLabsAvailable() ? 'success' : 'secondary'}>
              {isElevenLabsAvailable() ? 'ElevenLabs' : 'Browser'}
            </Badge>
          </div>

          {/* ElevenLabs voice picker */}
          {isElevenLabsAvailable() && (
            <div>
              <label htmlFor="tts-voice-select" className="text-sm font-medium mb-1.5 block leading-tight">
                Voice
              </label>
              <select
                id="tts-voice-select"
                value={localPrefs.tts_voice}
                onChange={(e) => setLocalPrefs((p) => ({ ...p, tts_voice: e.target.value }))}
                className={cn(
                  'flex h-10 w-full max-w-xs rounded-[--radius-md] border border-input bg-card/50 px-3 py-2 text-sm neu-inset',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
                )}
                aria-label="Select ElevenLabs voice"
              >
                {ELEVENLABS_VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} — {voice.description}
                  </option>
                ))}
              </select>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speak(`Hello! This is a preview of the selected voice.`)}
                  aria-label="Preview selected voice"
                >
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Preview Voice
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Modes */}
      <Card>
        <CardHeader>
          <CardTitle>Output Modes</CardTitle>
          <CardDescription>
            Choose how you receive information. Select multiple.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="group" aria-label="Output mode selection">
            {outputModes.map((mode) => {
              const isSelected = localPrefs.output_mode.includes(mode.value)
              return (
                <button
                  key={mode.value}
                  onClick={() => handleOutputModeToggle(mode.value)}
                  className={cn(
                    'flex items-start gap-3 rounded-[--radius-lg] border-2 p-4 text-left',
                    'transition-all duration-[--duration-fast] ease-[--ease-out]',
                    'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border',
                  )}
                  aria-pressed={isSelected}
                  aria-label={`${mode.label}: ${mode.description}`}
                >
                  <div
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 rounded-[3px] border-2 transition-colors duration-[--duration-fast]',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg viewBox="0 0 16 16" fill="currentColor" className="h-full w-full text-primary-foreground">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{mode.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{mode.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <label className="text-sm font-medium mb-2 block" id="font-size-label">Font Size</label>
            <div className="flex gap-2" role="radiogroup" aria-labelledby="font-size-label">
              {(['normal', 'large', 'extra-large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={localPrefs.font_size === size ? 'default' : 'outline'}
                  onClick={() => setLocalPrefs((p) => ({ ...p, font_size: size }))}
                  role="radio"
                  aria-checked={localPrefs.font_size === size}
                  aria-label={`${size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')} font size`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {[
            { key: 'high_contrast' as const, label: 'High Contrast', description: 'Increase color contrast for visibility' },
            { key: 'reduced_motion' as const, label: 'Reduced Motion', description: 'Minimize animations and transitions' },
            { key: 'haptic_feedback' as const, label: 'Haptic Feedback', description: 'Enable vibration for notifications' },
            { key: 'auto_tts' as const, label: 'Auto Text-to-Speech', description: 'Read AI responses aloud automatically' },
            { key: 'simplified_ui' as const, label: 'Simplified Interface', description: 'Fewer options, simpler forms' },
          ].map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium leading-tight">{toggle.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{toggle.description}</p>
              </div>
              <button
                onClick={() =>
                  setLocalPrefs((p) => ({ ...p, [toggle.key]: !p[toggle.key] }))
                }
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent neu-inset',
                  'transition-colors duration-[--duration-fast] ease-[--ease-out]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  localPrefs[toggle.key] ? 'bg-primary' : 'bg-input',
                )}
                role="switch"
                aria-checked={localPrefs[toggle.key]}
                aria-label={toggle.label}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-card shadow ring-0',
                    'transition-transform duration-[--duration-fast] ease-[--ease-out]',
                    localPrefs[toggle.key] ? 'translate-x-5' : 'translate-x-0',
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Link external services for calendar and email features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">Google Account</p>
              <p className="text-xs text-muted-foreground">Calendar and Gmail integration</p>
            </div>
            <Badge variant="outline">Via Schedule / Documents</Badge>
          </div>
          <div>
            <label htmlFor="gemini-key" className="text-sm font-medium mb-1 block">
              Gemini API Key
            </label>
            <Input
              id="gemini-key"
              type="password"
              placeholder="Set via VITE_GEMINI_API_KEY in .env"
              disabled
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground mt-1">
              API keys are configured via environment variables.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save / Reset */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Settings
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset to Defaults
        </Button>
        <Button onClick={handleRerunOnboarding} variant="ghost">
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Re-run Setup Wizard
        </Button>
        {saved && (
          <Badge variant="success" aria-live="polite">
            Saved
          </Badge>
        )}
      </div>
    </div>
  )
}
