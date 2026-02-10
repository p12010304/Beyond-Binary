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

  useEffect(() => {
    setIsAuthenticated(hasValidToken())
  }, [])

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Smart Schedule</h2>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Manage your calendar with voice commands and adaptive forms.
          </p>
        </div>
        {isAuthenticated && (
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </Button>
        )}
      </div>

      {(error || authError) && (
        <div role="alert" className="flex items-center gap-2 rounded-[--radius-lg] bg-destructive/10 border border-destructive p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error || authError}</p>
        </div>
      )}

      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted/80">
            <LogIn className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
          <h3 className="text-base font-medium">Connect Google Calendar</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md leading-relaxed">
            Link your Google account to view and manage calendar events with voice commands and accessibility features.
          </p>
          <Button onClick={handleConnect} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect Google Calendar'}
          </Button>
          <p className="text-xs text-muted-foreground text-center max-w-sm">
            Requires VITE_GOOGLE_CLIENT_ID in your .env file.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(320px,400px)]">
          <div>
            <h3 className="text-base font-medium mb-3">This Week</h3>
            <ScheduleView
              events={events}
              loading={loading}
              onDelete={removeEvent}
            />
          </div>
          <EventForm onSubmit={addEvent} />
        </div>
      )}
    </div>
  )
}
