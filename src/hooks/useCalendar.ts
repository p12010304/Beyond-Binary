import { useState, useCallback } from 'react'
import type { CalendarEvent } from '@/lib/types'
import { fetchEvents, createEvent, deleteEvent } from '@/services/calendarService'

export function useCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadEvents = useCallback(async (startDate: Date, endDate: Date) => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchEvents(startDate.toISOString(), endDate.toISOString())
      setEvents(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [])

  const addEvent = useCallback(
    async (event: {
      summary: string
      description?: string
      start: string
      end: string
      location?: string
    }) => {
      setError(null)
      try {
        const created = await createEvent(event)
        setEvents((prev) => [...prev, created].sort((a, b) => a.start.localeCompare(b.start)))
        return created
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create event')
        return null
      }
    },
    [],
  )

  const removeEvent = useCallback(async (eventId: string) => {
    setError(null)
    try {
      await deleteEvent(eventId)
      setEvents((prev) => prev.filter((e) => e.id !== eventId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event')
    }
  }, [])

  return {
    events,
    loading,
    error,
    loadEvents,
    addEvent,
    removeEvent,
  }
}
