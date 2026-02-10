import { useState, useCallback, useEffect, useRef } from 'react'
import {
  ArrowRight,
  ArrowLeft,
  Eye,
  Volume2,
  Brain,
  Type,
  Hand,
  Users,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { useAccessibility } from '@/components/AccessibilityProvider'
import type { DisabilityProfile, UserPreferences } from '@/lib/types'
import { defaultPreferences } from '@/lib/types'
import { profilePresets, applyProfilePreset } from '@/lib/profilePresets'

const ONBOARDING_KEY = 'accessadmin_onboarding_complete'

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === 'true'
}

const STEP_TITLES = [
  'Welcome',
  'Choose Your Profile',
  'Review Your Settings',
  "You're All Set",
]

const profileOptions: {
  value: DisabilityProfile
  label: string
  icon: React.ElementType
  persona: string
  shortDesc: string
}[] = [
  { value: 'visual', label: 'Visual Impairment', icon: Eye, persona: 'Alex', shortDesc: 'Audio output, screen reader support, high contrast' },
  { value: 'hearing', label: 'Hearing Impairment', icon: Volume2, persona: 'Jamie', shortDesc: 'Visual captions, text-first, vibration alerts' },
  { value: 'cognitive', label: 'Cognitive Disability', icon: Brain, persona: 'Taylor', shortDesc: 'Simplified interface, step-by-step guidance' },
  { value: 'dyslexia', label: 'Dyslexia', icon: Type, persona: 'Taylor', shortDesc: 'Audio alternatives, larger text, voice input' },
  { value: 'motor', label: 'Motor Disability', icon: Hand, persona: 'Alex', shortDesc: 'Voice commands, keyboard shortcuts, large targets' },
  { value: 'multiple', label: 'Multiple Disabilities', icon: Users, persona: 'Everyone', shortDesc: 'All accessibility features enabled' },
]

/** Returns all focusable elements within a container */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ')
  return Array.from(container.querySelectorAll<HTMLElement>(selector))
}

interface OnboardingWizardProps {
  onComplete: () => void
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { setPreferences, setDisabilityProfile } = useAccessibility()
  const [step, setStep] = useState(0)
  const [selectedProfile, setSelectedProfile] = useState<DisabilityProfile | null>(null)
  const [previewPrefs, setPreviewPrefs] = useState<UserPreferences>({ ...defaultPreferences })
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus the dialog on step change so screen readers announce the new content
  useEffect(() => {
    if (dialogRef.current) {
      dialogRef.current.focus()
    }
  }, [step])

  // Focus trap: keep Tab/Shift+Tab within the dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!dialogRef.current) return

      // Escape key: skip the wizard
      if (e.key === 'Escape') {
        e.preventDefault()
        handleSkip()
        return
      }

      // Tab trapping
      if (e.key === 'Tab') {
        const focusable = getFocusableElements(dialogRef.current)
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          // Shift+Tab: wrap from first to last
          if (document.activeElement === first || document.activeElement === dialogRef.current) {
            e.preventDefault()
            last.focus()
          }
        } else {
          // Tab: wrap from last to first
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // When profile is selected, compute preview prefs
  useEffect(() => {
    if (selectedProfile) {
      setPreviewPrefs(applyProfilePreset(defaultPreferences, selectedProfile))
    } else {
      setPreviewPrefs({ ...defaultPreferences })
    }
  }, [selectedProfile])

  const handleFinish = useCallback(() => {
    if (selectedProfile) {
      setDisabilityProfile(selectedProfile)
      setPreferences(previewPrefs)
    }
    localStorage.setItem(ONBOARDING_KEY, 'true')
    onComplete()
  }, [selectedProfile, previewPrefs, setDisabilityProfile, setPreferences, onComplete])

  const handleSkip = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    onComplete()
  }, [onComplete])

  const nextStep = () => setStep((s) => Math.min(s + 1, 3))
  const prevStep = () => setStep((s) => Math.max(s - 1, 0))

  const preset = selectedProfile ? profilePresets[selectedProfile] : null

  // Settings preview labels
  const prefsPreview = [
    { label: 'Auto Text-to-Speech', value: previewPrefs.auto_tts },
    { label: 'High Contrast', value: previewPrefs.high_contrast },
    { label: 'Simplified Interface', value: previewPrefs.simplified_ui },
    { label: 'Haptic Feedback', value: previewPrefs.haptic_feedback },
    { label: 'Reduced Motion', value: previewPrefs.reduced_motion },
    { label: 'Font Size', value: previewPrefs.font_size },
    { label: 'Output Modes', value: previewPrefs.output_mode.join(', ') },
  ]

  return (
    // Backdrop: prevent interaction with content behind
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        // Prevent clicking the backdrop from moving focus outside the dialog
        if (e.target === e.currentTarget) e.preventDefault()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Setup wizard — Step ${step + 1} of 4: ${STEP_TITLES[step]}`}
        tabIndex={-1}
        className={cn(
          'w-full max-w-lg max-h-[85vh] flex flex-col glass neu-raised rounded-[--radius-lg] overflow-hidden',
          'focus:outline-none',
        )}
      >
        {/* Progress bar + accessible step indicator */}
        <div className="flex gap-1 px-6 pt-5 shrink-0">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-[--duration-normal]',
                i <= step ? 'bg-primary' : 'bg-border',
              )}
              aria-hidden="true"
            />
          ))}
        </div>
        {/* Screen-reader-only step announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Step {step + 1} of 4: {STEP_TITLES[step]}
        </div>

        {/* Scrollable content area */}
        <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Welcome to AccessAdmin AI</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  An adaptive AI companion for admin and office work, designed for people with different abilities.
                  This app adjusts how you interact with it based on your needs.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Built for people like:</p>
                <div className="grid gap-2">
                  {[
                    { name: 'Alex', desc: 'Visually impaired admin assistant — needs audio output for emails and meeting notes.' },
                    { name: 'Jamie', desc: 'Hearing-impaired receptionist — needs real-time captions and visual alerts.' },
                    { name: 'Taylor', desc: 'Person with dyslexia in data entry — benefits from audio alternatives to text.' },
                  ].map((p) => (
                    <div key={p.name} className="flex gap-3 rounded-[--radius-md] bg-muted/60 p-3">
                      <Badge variant="secondary" className="shrink-0 mt-0.5">{p.name}</Badge>
                      <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Next, select your accessibility profile so we can configure the right settings for you.
              </p>
            </div>
          )}

          {/* Step 1: Profile Selection */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Choose Your Profile</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Select the profile that best matches your needs. This will auto-configure the app for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Choose your accessibility profile">
                {profileOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedProfile(opt.value)}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-[--radius-lg] border-2 p-3 text-left',
                      'transition-all duration-[--duration-fast] ease-[--ease-out]',
                      'hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      selectedProfile === opt.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border',
                    )}
                    role="radio"
                    aria-checked={selectedProfile === opt.value}
                    aria-label={`${opt.label}: ${opt.shortDesc}`}
                  >
                    <div className="flex items-center gap-2">
                      <opt.icon
                        className={cn(
                          'h-4 w-4',
                          selectedProfile === opt.value ? 'text-primary' : 'text-muted-foreground',
                        )}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium leading-tight">{opt.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{opt.shortDesc}</p>
                    <p className="text-xs text-muted-foreground/70 italic">Like {opt.persona}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setSelectedProfile(null)
                  setStep(3) // Skip to ready
                }}
                className="text-xs text-muted-foreground underline hover:text-foreground transition-colors"
                aria-label="Skip profile selection and explore all features"
              >
                No specific profile — explore all features
              </button>
            </div>
          )}

          {/* Step 2: Preview & Confirm */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Review Your Settings</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {preset
                    ? `Here's what we'll configure for ${preset.label}. You can adjust any of these later in Settings.`
                    : 'Default settings will be used. You can customize everything in Settings.'}
                </p>
              </div>

              {preset && (
                <div className="rounded-[--radius-md] bg-muted/60 p-3 space-y-1">
                  <p className="text-xs font-medium text-foreground">{preset.persona}'s profile</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{preset.description}</p>
                </div>
              )}

              <div className="space-y-2" role="list" aria-label="Settings preview">
                {prefsPreview.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm" role="listitem">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">
                      {typeof item.value === 'boolean' ? (
                        <Badge variant={item.value ? 'success' : 'secondary'} className="text-xs">
                          {item.value ? 'On' : 'Off'}
                        </Badge>
                      ) : (
                        <span className="capitalize">{item.value}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {preset && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">You can toggle any setting:</p>
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Toggle settings">
                    {[
                      { key: 'auto_tts' as const, label: 'Auto TTS' },
                      { key: 'high_contrast' as const, label: 'High Contrast' },
                      { key: 'simplified_ui' as const, label: 'Simplified' },
                      { key: 'haptic_feedback' as const, label: 'Haptic' },
                      { key: 'reduced_motion' as const, label: 'No Motion' },
                    ].map((t) => (
                      <button
                        key={t.key}
                        onClick={() =>
                          setPreviewPrefs((p) => ({ ...p, [t.key]: !p[t.key] }))
                        }
                        className={cn(
                          'rounded-full px-3 py-1 text-xs border transition-colors duration-[--duration-fast]',
                          previewPrefs[t.key]
                            ? 'bg-primary/10 border-primary text-primary'
                            : 'bg-muted border-border text-muted-foreground',
                        )}
                        aria-pressed={previewPrefs[t.key]}
                        aria-label={`Toggle ${t.label}: currently ${previewPrefs[t.key] ? 'on' : 'off'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">You're All Set</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedProfile
                      ? `Your workspace is configured for ${profilePresets[selectedProfile].label}.`
                      : 'Your workspace is ready with default settings.'}
                  </p>
                </div>
              </div>

              {preset && preset.tips.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                    Tips for you
                  </p>
                  <ul className="space-y-1.5">
                    {preset.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                        <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-[--radius-md] bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You can change any setting anytime from the <strong>Settings</strong> page in the sidebar.
                  Use <kbd className="rounded bg-muted px-1 py-0.5 text-[10px] font-mono">Ctrl+Shift+V</kbd> for voice navigation.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 pb-5 pt-2 shrink-0 border-t border-border/30">
          <div>
            {step > 0 && step < 3 && (
              <Button variant="ghost" onClick={prevStep} aria-label="Go to previous step">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {step < 3 && (
              <Button variant="ghost" onClick={handleSkip} className="text-muted-foreground" aria-label="Skip setup wizard">
                <X className="h-4 w-4" aria-hidden="true" />
                Skip
              </Button>
            )}

            {step < 3 ? (
              <Button
                onClick={nextStep}
                disabled={step === 1 && !selectedProfile}
                aria-label={step === 2 ? 'Confirm settings and continue' : `Go to step ${step + 2}: ${STEP_TITLES[step + 1]}`}
              >
                {step === 2 ? 'Confirm' : 'Next'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button onClick={handleFinish} aria-label="Finish setup and start using the app">
                Get Started
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
