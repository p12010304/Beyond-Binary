import { useState } from 'react'
import { Save, RotateCcw, Volume2, Eye, Hand, Brain, Type } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useAccessibility } from '@/components/AccessibilityProvider'
import type { DisabilityProfile, OutputMode, UserPreferences } from '@/lib/types'
import { defaultPreferences } from '@/lib/types'
import { cn } from '@/lib/utils'

const disabilityOptions: { value: DisabilityProfile; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'visual', label: 'Visual', icon: Eye, description: 'Screen reader, audio output, high contrast' },
  { value: 'hearing', label: 'Hearing', icon: Volume2, description: 'Visual captions, text output, vibration' },
  { value: 'cognitive', label: 'Cognitive', icon: Brain, description: 'Simplified UI, step-by-step guidance' },
  { value: 'dyslexia', label: 'Dyslexia', icon: Type, description: 'Audio alternatives, larger text, visual aids' },
  { value: 'motor', label: 'Motor', icon: Hand, description: 'Voice commands, large touch targets' },
  { value: 'multiple', label: 'Multiple', icon: Brain, description: 'Combined accessibility features' },
]

const outputModes: { value: OutputMode; label: string; description: string }[] = [
  { value: 'voice', label: 'Voice Output', description: 'Read content aloud using text-to-speech' },
  { value: 'visual', label: 'Visual Output', description: 'Display text with captions and icons' },
  { value: 'haptic', label: 'Haptic Feedback', description: 'Vibration alerts for notifications' },
  { value: 'simplified', label: 'Simplified', description: 'Reduce complexity, use plain language' },
]

export default function Settings() {
  const {
    preferences,
    setPreferences,
    disabilityProfile,
    setDisabilityProfile,
    speak,
  } = useAccessibility()

  const [localPrefs, setLocalPrefs] = useState<UserPreferences>({ ...preferences })
  const [localProfile, setLocalProfile] = useState<DisabilityProfile | null>(disabilityProfile)
  const [saved, setSaved] = useState(false)

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
    setDisabilityProfile(localProfile)
    setSaved(true)
    speak('Settings saved successfully.')
    setTimeout(() => setSaved(false), 3000)
  }

  const handleReset = () => {
    setLocalPrefs({ ...defaultPreferences })
    setLocalProfile(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Customize your accessibility preferences and disability profile.
        </p>
      </div>

      {/* Disability Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Disability Profile</CardTitle>
          <CardDescription>
            Select your disability type to automatically configure accessibility features.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Disability profile selection">
            {disabilityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setLocalProfile(option.value)}
                className={cn(
                  'flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors',
                  'hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  localProfile === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border',
                )}
                role="radio"
                aria-checked={localProfile === option.value}
                aria-label={`${option.label}: ${option.description}`}
              >
                <option.icon
                  className={cn('h-5 w-5', localProfile === option.value ? 'text-primary' : 'text-muted-foreground')}
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium">{option.label}</p>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </button>
            ))}
          </div>
          {localProfile && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => setLocalProfile(null)}
            >
              Clear selection
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Output Modes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Output Modes</CardTitle>
          <CardDescription>
            Choose how you want to receive information. Select multiple modes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="Output mode selection">
            {outputModes.map((mode) => {
              const isSelected = localPrefs.output_mode.includes(mode.value)
              return (
                <button
                  key={mode.value}
                  onClick={() => handleOutputModeToggle(mode.value)}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border-2 p-4 text-left transition-colors',
                    'hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border',
                  )}
                  aria-pressed={isSelected}
                  aria-label={`${mode.label}: ${mode.description}`}
                >
                  <div
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 rounded border-2 transition-colors',
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg viewBox="0 0 16 16" fill="white" className="h-full w-full">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{mode.label}</p>
                    <p className="text-xs text-muted-foreground">{mode.description}</p>
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
          <CardTitle className="text-lg">Display Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Font size */}
          <div>
            <label className="text-sm font-medium mb-2 block">Font Size</label>
            <div className="flex gap-2" role="radiogroup" aria-label="Font size">
              {(['normal', 'large', 'extra-large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={localPrefs.font_size === size ? 'default' : 'outline'}
                  onClick={() => setLocalPrefs((p) => ({ ...p, font_size: size }))}
                  role="radio"
                  aria-checked={localPrefs.font_size === size}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1).replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Toggle options */}
          {[
            { key: 'high_contrast' as const, label: 'High Contrast', description: 'Increase color contrast for better visibility' },
            { key: 'reduced_motion' as const, label: 'Reduced Motion', description: 'Minimize animations and transitions' },
            { key: 'haptic_feedback' as const, label: 'Haptic Feedback', description: 'Enable vibration for notifications' },
            { key: 'auto_tts' as const, label: 'Auto Text-to-Speech', description: 'Automatically read AI responses aloud' },
            { key: 'simplified_ui' as const, label: 'Simplified Interface', description: 'Show fewer options, simpler forms' },
          ].map((toggle) => (
            <div key={toggle.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{toggle.label}</p>
                <p className="text-xs text-muted-foreground">{toggle.description}</p>
              </div>
              <button
                onClick={() =>
                  setLocalPrefs((p) => ({ ...p, [toggle.key]: !p[toggle.key] }))
                }
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  localPrefs[toggle.key] ? 'bg-primary' : 'bg-input',
                )}
                role="switch"
                aria-checked={localPrefs[toggle.key]}
                aria-label={toggle.label}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform',
                    localPrefs[toggle.key] ? 'translate-x-5' : 'translate-x-0',
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Google Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected Accounts</CardTitle>
          <CardDescription>
            Link external services for calendar and email features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Google Account</p>
              <p className="text-xs text-muted-foreground">Calendar and Gmail integration</p>
            </div>
            <Badge variant="outline">Configure in Schedule / Documents</Badge>
          </div>
          <div>
            <label htmlFor="gemini-key" className="text-sm font-medium mb-1 block">
              Gemini API Key
            </label>
            <Input
              id="gemini-key"
              type="password"
              placeholder="Set in .env file (VITE_GEMINI_API_KEY)"
              disabled
              className="max-w-md"
            />
            <p className="text-xs text-muted-foreground mt-1">
              API keys are configured via environment variables for security.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save / Reset */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} size="lg">
          <Save className="h-4 w-4" aria-hidden="true" />
          Save Settings
        </Button>
        <Button onClick={handleReset} variant="outline" size="lg">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset to Defaults
        </Button>
        {saved && (
          <Badge variant="success" aria-live="polite">
            Settings saved!
          </Badge>
        )}
      </div>
    </div>
  )
}
