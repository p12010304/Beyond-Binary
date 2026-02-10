import { useState } from 'react'
import { CalendarPlus, Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useTranscription } from '@/hooks/useTranscription'
import { useAccessibility } from '@/components/AccessibilityProvider'

interface EventFormProps {
  onSubmit: (event: {
    summary: string
    description?: string
    start: string
    end: string
    location?: string
  }) => Promise<unknown>
  className?: string
}

export default function EventForm({ onSubmit, className }: EventFormProps) {
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [activeField, setActiveField] = useState<'summary' | 'description' | 'location' | null>(null)

  const { isListening, transcript, startListening, stopListening, resetTranscript } = useTranscription()
  const { preferences } = useAccessibility()
  const simplified = preferences.simplified_ui

  const toggleVoiceInput = (field: 'summary' | 'description' | 'location') => {
    if (isListening) {
      stopListening()
      if (activeField === 'summary') setSummary((prev) => (prev ? `${prev} ${transcript}` : transcript))
      else if (activeField === 'description') setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript))
      else if (activeField === 'location') setLocation((prev) => (prev ? `${prev} ${transcript}` : transcript))
      resetTranscript()
      setActiveField(null)
    } else {
      resetTranscript()
      setActiveField(field)
      startListening()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!summary || !startDate || !startTime) return

    setSubmitting(true)
    try {
      const startISO = new Date(`${startDate}T${startTime}`).toISOString()
      const endISO = endDate && endTime
        ? new Date(`${endDate}T${endTime}`).toISOString()
        : new Date(new Date(`${startDate}T${startTime}`).getTime() + 3600000).toISOString()

      await onSubmit({
        summary,
        description: description || undefined,
        start: startISO,
        end: endISO,
        location: location || undefined,
      })

      setSummary('')
      setDescription('')
      setStartDate('')
      setStartTime('')
      setEndDate('')
      setEndTime('')
      setLocation('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarPlus className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
          {simplified ? 'Add Event' : 'New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="event-summary" className="block text-sm font-medium mb-1.5 leading-tight">
              {simplified ? 'What?' : 'Event Name'} <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="event-summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder={simplified ? 'What is the event about?' : 'e.g., Team standup meeting'}
                required
                aria-required="true"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleVoiceInput('summary')}
                aria-label={isListening && activeField === 'summary' ? 'Stop voice input' : 'Use voice input for event name'}
              >
                {isListening && activeField === 'summary' ? (
                  <MicOff className="h-4 w-4 text-destructive" aria-hidden="true" />
                ) : (
                  <Mic className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="start-date" className="block text-sm font-medium mb-1.5 leading-tight">
                Start Date <span className="text-destructive">*</span>
              </label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  if (!endDate) setEndDate(e.target.value)
                }}
                required
              />
            </div>
            <div>
              <label htmlFor="start-time" className="block text-sm font-medium mb-1.5 leading-tight">
                Start Time <span className="text-destructive">*</span>
              </label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-sm font-medium mb-1.5 leading-tight">
                End Date
              </label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="end-time" className="block text-sm font-medium mb-1.5 leading-tight">
                End Time
              </label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {!simplified && (
            <div>
              <label htmlFor="event-location" className="block text-sm font-medium mb-1.5 leading-tight">
                Location
              </label>
              <div className="flex gap-2">
                <Input
                  id="event-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Conference Room A"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => toggleVoiceInput('location')}
                  aria-label="Use voice input for location"
                >
                  {isListening && activeField === 'location' ? (
                    <MicOff className="h-4 w-4 text-destructive" aria-hidden="true" />
                  ) : (
                    <Mic className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {!simplified && (
            <div>
              <label htmlFor="event-description" className="block text-sm font-medium mb-1.5 leading-tight">
                Description
              </label>
              <Textarea
                id="event-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional notes or agenda"
                rows={3}
              />
            </div>
          )}

          <Button type="submit" disabled={submitting || !summary || !startDate || !startTime} className="w-full">
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Creating...
              </>
            ) : (
              <>
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                {simplified ? 'Add' : 'Create Event'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
