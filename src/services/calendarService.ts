import type { CalendarEvent } from '@/lib/types'

/**
 * Calendar service using Google Calendar API via gapi client.
 * Requires gapi to be loaded and authenticated first.
 */

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3'

function getAccessToken(): string | null {
  return window.gapi?.client?.getToken()?.access_token ?? null
}

async function calendarFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Not authenticated with Google. Please sign in first.')
  }

  const response = await fetch(`${CALENDAR_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Calendar API error: ${response.status} - ${errorText}`)
  }

  return response
}

/**
 * Fetch calendar events for a given time range.
 */
export async function fetchEvents(
  timeMin: string,
  timeMax: string,
  calendarId = 'primary',
): Promise<CalendarEvent[]> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  })

  const response = await calendarFetch(`/calendars/${calendarId}/events?${params}`)
  const data = await response.json()

  return (data.items ?? []).map((item: Record<string, unknown>) => ({
    id: item.id as string,
    summary: (item.summary as string) ?? 'Untitled Event',
    description: (item.description as string) ?? '',
    start: ((item.start as Record<string, string>)?.dateTime ?? (item.start as Record<string, string>)?.date) ?? '',
    end: ((item.end as Record<string, string>)?.dateTime ?? (item.end as Record<string, string>)?.date) ?? '',
    location: (item.location as string) ?? '',
  }))
}

/**
 * Create a new calendar event.
 */
export async function createEvent(
  event: {
    summary: string
    description?: string
    start: string
    end: string
    location?: string
  },
  calendarId = 'primary',
): Promise<CalendarEvent> {
  const body = {
    summary: event.summary,
    description: event.description ?? '',
    location: event.location ?? '',
    start: {
      dateTime: event.start,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: event.end,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }

  const response = await calendarFetch(`/calendars/${calendarId}/events`, {
    method: 'POST',
    body: JSON.stringify(body),
  })

  const data = await response.json()

  return {
    id: data.id,
    summary: data.summary ?? 'Untitled Event',
    description: data.description ?? '',
    start: data.start?.dateTime ?? data.start?.date ?? '',
    end: data.end?.dateTime ?? data.end?.date ?? '',
    location: data.location ?? '',
  }
}

/**
 * Delete a calendar event.
 */
export async function deleteEvent(
  eventId: string,
  calendarId = 'primary',
): Promise<void> {
  await calendarFetch(`/calendars/${calendarId}/events/${eventId}`, {
    method: 'DELETE',
  })
}
