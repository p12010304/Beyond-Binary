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
    description: 'Real-time transcription, live captions, and AI-powered meeting summaries with action items.',
    color: 'text-blue-600 bg-blue-100',
  },
  {
    to: '/schedule',
    icon: Calendar,
    title: 'Smart Schedule',
    description: 'Voice-controlled calendar management with adaptive prompts and Google Calendar sync.',
    color: 'text-green-600 bg-green-100',
  },
  {
    to: '/documents',
    icon: FileText,
    title: 'Documents & Email',
    description: 'AI email summaries, document scanning with OCR, and voice dictation for replies.',
    color: 'text-orange-600 bg-orange-100',
  },
  {
    to: '/prompt-hub',
    icon: MessageSquare,
    title: 'Prompt Hub',
    description: 'Accessible AI prompting with guided templates, voice input, and multimodal outputs.',
    color: 'text-purple-600 bg-purple-100',
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
      {/* Hero section */}
      <section aria-labelledby="welcome-heading">
        <h2 id="welcome-heading" className="text-3xl font-bold tracking-tight">
          Welcome to AccessAdmin AI
        </h2>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Your adaptive AI companion for administrative work. Navigate meetings, manage schedules,
          handle documents, and interact with AI -- all tailored to your accessibility needs.
        </p>
        <div className="mt-4 flex gap-3">
          <Button asChild size="lg">
            <Link to="/meeting">
              <Mic className="h-5 w-5" aria-hidden="true" />
              Start Meeting Assist
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/settings">
              <Settings className="h-5 w-5" aria-hidden="true" />
              Configure Accessibility
            </Link>
          </Button>
        </div>
      </section>

      {/* Feature cards */}
      <section aria-labelledby="features-heading">
        <h3 id="features-heading" className="text-xl font-semibold mb-4">
          Quick Access
        </h3>
        <div className="grid gap-4 sm:grid-cols-2" role="list">
          {features.map((feature) => (
            <Link
              key={feature.to}
              to={feature.to}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
              onFocus={() => handleCardFocus(feature.title, feature.description)}
              role="listitem"
            >
              <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.color}`}>
                      <feature.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                  <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Open <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Status bar */}
      <section aria-label="Quick status" className="rounded-lg bg-muted p-4">
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Accessibility:</span>{' '}
            {preferences.output_mode.join(', ')} mode
          </div>
          <div>
            <span className="font-medium text-foreground">Font Size:</span>{' '}
            {preferences.font_size}
          </div>
          <div>
            <span className="font-medium text-foreground">High Contrast:</span>{' '}
            {preferences.high_contrast ? 'On' : 'Off'}
          </div>
        </div>
      </section>
    </div>
  )
}
