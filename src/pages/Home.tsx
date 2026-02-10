import { Link } from 'react-router-dom'
import { Mic, Calendar, FileText, MessageSquare, Settings, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAccessibility } from '@/components/AccessibilityProvider'

const features = [
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
  const { speak, preferences } = useAccessibility()

  const handleCardFocus = (title: string, description: string) => {
    if (preferences.auto_tts) {
      speak(`${title}. ${description}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section aria-labelledby="welcome-heading">
        <h2 id="welcome-heading" className="text-xl font-semibold tracking-tight leading-tight">
          Your Workspace
        </h2>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl leading-relaxed">
          Adaptive tools for meetings, scheduling, documents, and AI prompting,
          configured to match your accessibility preferences.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/meeting">
              <Mic className="h-4 w-4" aria-hidden="true" />
              Start Meeting Assist
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/settings">
              <Settings className="h-4 w-4" aria-hidden="true" />
              Accessibility Settings
            </Link>
          </Button>
        </div>
      </section>

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
                    <CardTitle>{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {feature.description}
                  </CardDescription>
                  <div className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary group-hover:gap-2.5 transition-all duration-[--duration-normal] ease-[--ease-out]">
                    Open <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Status */}
      <section aria-label="Current settings" className="rounded-[--radius-lg] bg-muted/60 p-4">
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
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
          <div>
            <span className="font-medium text-foreground">Theme:</span>{' '}
            <span className="capitalize">{preferences.theme}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
