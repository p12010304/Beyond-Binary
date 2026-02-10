import { useState } from 'react'
import { Calendar, Clock, MapPin, Trash2, Volume2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { useAccessibility } from '@/components/AccessibilityProvider'
import type { CalendarEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ScheduleViewProps {
  events: CalendarEvent[]
  loading: boolean
  onDelete?: (eventId: string) => void
  className?: string
}

function formatTime(isoString: string): string {
  try {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return isoString
  }
}

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}

function isToday(isoString: string): boolean {
  try {
    const date = new Date(isoString)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  } catch {
    return false
  }
}

export default function ScheduleView({ events, loading, onDelete, className }: ScheduleViewProps) {
  const { speak } = useAccessibility()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleReadEvent = (event: CalendarEvent) => {
    const text = `${event.summary}, ${formatDate(event.start)} from ${formatTime(event.start)} to ${formatTime(event.end)}${event.location ? `, at ${event.location}` : ''}`
    speak(text)
  }

  const handleDelete = async (eventId: string) => {
    if (!onDelete) return
    setDeletingId(eventId)
    try {
      await onDelete(eventId)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[0, 1, 2].map((i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          No events found. Create one using the form.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)} role="list" aria-label="Calendar events">
      {events.map((event) => (
        <Card
          key={event.id}
          className={cn(
            isToday(event.start) && 'border-primary/40',
          )}
          role="listitem"
        >
          <CardContent className="flex items-start gap-4 p-4">
            <div className="shrink-0 text-center min-w-[56px]">
              <p className="text-sm font-semibold leading-tight">{formatTime(event.start)}</p>
              <p className="text-xs text-muted-foreground">to {formatTime(event.end)}</p>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-medium text-sm truncate leading-tight">{event.summary}</h4>
                {isToday(event.start) && <Badge variant="default">Today</Badge>}
              </div>
              {event.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{event.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {formatDate(event.start)}
                </span>
                {event.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleReadEvent(event)}
                aria-label={`Read aloud: ${event.summary}`}
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  aria-label={`Delete event: ${event.summary}`}
                >
                  {deletingId === event.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
