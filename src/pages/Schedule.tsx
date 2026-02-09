import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import ScheduleView from '@/components/ScheduleView'
import EventForm from '@/components/EventForm'
import { useCalendar } from '@/hooks/useCalendar'
import { hasValidToken, loadGapiScript, loadGisScript, requestAccessToken } from '@/lib/googleAuth'

export default function Schedule() {
  const { events, loading, error, loadEvents, addEvent, removeEvent } = useCalendar()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  // Check authentication status
  useEffect(() => {
    setIsAuthenticated(hasValidToken())
  }, [])

  // Load events for the current week
  useEffect(() => {
    if (!isAuthenticated) return
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)
    loadEvents(startOfWeek, endOfWeek)
  }, [isAuthenticated, loadEvents])

  const handleConnect = async () => {
    setIsConnecting(true)
    setAuthError(null)
    try {
      await loadGapiScript()
      await loadGisScript()
      await requestAccessToken()
      setIsAuthenticated(true)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Failed to connect to Google')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleRefresh = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 7)
    loadEvents(startOfWeek, endOfWeek)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Smart Schedule</h2>
          <p className="text-muted-foreground mt-1">
            Manage your calendar with voice commands and adaptive forms.
          </p>
        </div>
        {isAuthenticated && (
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </Button>
        )}
      </div>

      {/* Errors */}
      {(error || authError) && (
        <div role="alert" className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive p-4 text-sm text-destructive">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error || authError}</p>
        </div>
      )}

      {/* Not connected */}
      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <LogIn className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold">Connect Google Calendar</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Link your Google account to view and manage your calendar events with voice commands and accessibility features.
          </p>
          <Button onClick={handleConnect} disabled={isConnecting} size="lg">
            {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
          </Button>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            Requires a Google Client ID. Set VITE_GOOGLE_CLIENT_ID in your .env file.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Events list */}
          <div>
            <h3 className="text-lg font-semibold mb-3">This Week</h3>
            <ScheduleView
              events={events}
              loading={loading}
              onDelete={removeEvent}
            />
          </div>

          {/* Event form */}
          <EventForm onSubmit={addEvent} />
        </div>
      )}
    </div>
  )
}
