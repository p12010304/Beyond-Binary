import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Mic, Calendar, FileText, MessageSquare, Settings, ArrowRight, Lightbulb, User } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { getProfilePreset } from '@/lib/profilePresets'
import ModalityBadges from '@/components/ModalityBadges'

const allFeatures = [
  {
    to: '/meeting',
    icon: Mic,
    title: 'Meeting Assist',
    description: 'Transcribe meetings in real time and extract action items automatically.',
    colorFg: 'text-[--color-cat-1]',
    colorBg: 'bg-[--color-cat-1-bg]',
  },
  {
    to: '/schedule',
    icon: Calendar,
    title: 'Smart Schedule',
    description: 'Manage your calendar with voice commands and Google Calendar sync.',
    colorFg: 'text-[--color-cat-2]',
    colorBg: 'bg-[--color-cat-2-bg]',
  },
  {
    to: '/documents',
    icon: FileText,
    title: 'Documents & Email',
    description: 'Summarize emails, scan documents with OCR, and dictate replies.',
    colorFg: 'text-[--color-cat-3]',
    colorBg: 'bg-[--color-cat-3-bg]',
  },
  {
    to: '/prompt-hub',
    icon: MessageSquare,
    title: 'Prompt Hub',
    description: 'Interact with AI using text, voice, or guided templates.',
    colorFg: 'text-[--color-cat-4]',
    colorBg: 'bg-[--color-cat-4-bg]',
  },
]

export default function Home() {
  const { speak, preferences, disabilities, wantsSimplified } = useAccessibility()
  const preset = getProfilePreset(disabilities)

  // Reorder features based on profile's recommended order
  const features = useMemo(() => {
    if (!preset) return allFeatures
    const order = preset.recommendedFeatures
    return [...allFeatures].sort((a, b) => {
      const ai = order.indexOf(a.to)
      const bi = order.indexOf(b.to)
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
    })
  }, [preset])

  const handleCardFocus = (title: string, description: string) => {
    if (preferences.auto_tts) {
      speak(`${title}. ${description}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero with profile-aware greeting */}
      <section aria-labelledby="welcome-heading">
        <div className="flex items-start gap-3">
          {preset && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          )}
          <div>
            <h2 id="welcome-heading" className="text-xl font-semibold tracking-tight leading-tight">
              {preset
                ? `Your Workspace — ${preset.label}`
                : 'Your Workspace'}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-xl leading-relaxed">
              {preset
                ? wantsSimplified
                  ? `Hi! Your app is set up for ${preset.label.toLowerCase()}. Here are your tools.`
                  : `Adaptive tools configured for ${preset.label.toLowerCase()} accessibility. ${preset.description.split('.')[0]}.`
                : 'Adaptive tools for meetings, scheduling, documents, and AI prompting, configured to match your accessibility preferences.'}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to={preset ? preset.recommendedFeatures[0] : '/meeting'}>
              <Mic className="h-4 w-4" aria-hidden="true" />
              {wantsSimplified ? 'Start' : 'Start Meeting Assist'}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/settings">
              <Settings className="h-4 w-4" aria-hidden="true" />
              {wantsSimplified ? 'Settings' : 'Accessibility Settings'}
            </Link>
          </Button>
        </div>
      </section>

      {/* Profile tips */}
      {preset && preset.tips.length > 0 && (
        <section aria-label="Tips for your profile" className="rounded-[--radius-lg] bg-primary/5 border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-medium">
              {wantsSimplified ? 'Tips' : `Tips for ${preset.persona}'s profile`}
            </h3>
          </div>
          <ul className="space-y-1">
            {preset.tips.slice(0, wantsSimplified ? 2 : 4).map((tip, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <span className="text-primary font-medium shrink-0">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Feature cards */}
      <section aria-labelledby="features-heading">
        <h3 id="features-heading" className="text-base font-medium mb-4">
          Quick Access
        </h3>
        <div className="grid gap-4 sm:grid-cols-2" role="list">
          {features.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group block rounded-[--radius-lg] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onFocus={() => handleCardFocus(feature.title, feature.description)}
              role="listitem"
            >
              <Card className="h-full group-hover:-translate-y-0.5 group-focus-visible:-translate-y-0.5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[--radius-md] ${feature.colorBg}`}>
                      <feature.icon className={`h-[1.125rem] w-[1.125rem] ${feature.colorFg}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <ModalityBadges compact />
                    <div className="flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all duration-[--duration-normal] ease-[--ease-out]">
                      Open <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Profile status */}
      <section aria-label="Current settings" className="rounded-[--radius-lg] bg-muted/60 p-4">
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          {disabilities.length > 0 && preset && (
            <div>
              <span className="font-medium text-foreground">Profile:</span>{' '}
              <Badge variant="default" className="text-xs ml-1">{preset.label}</Badge>
            </div>
          )}
          <div>
            <span className="font-medium text-foreground">Output:</span>{' '}
            {preferences.output_mode.join(', ')}
          </div>
          <div>
            <span className="font-medium text-foreground">Font:</span>{' '}
            {preferences.font_size}
          </div>
          <div>
            <span className="font-medium text-foreground">Contrast:</span>{' '}
            {preferences.high_contrast ? 'High' : 'Standard'}
          </div>
        </div>
      </section>
    </div>
  )
}
