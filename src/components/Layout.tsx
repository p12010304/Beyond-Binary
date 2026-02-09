import { NavLink, Outlet } from 'react-router-dom'
import {
  Home,
  Mic,
  Calendar,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/meeting', icon: Mic, label: 'Meeting Assist' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/prompt-hub', icon: MessageSquare, label: 'Prompt Hub' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isSpeaking, stopSpeaking, speak } = useAccessibility()

  return (
    <div className="flex min-h-screen">
      {/* Skip to content link */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar navigation */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            AA
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">AccessAdmin</h1>
            <p className="text-xs text-sidebar-foreground/60">AI Companion</p>
          </div>
        </div>

        {/* Nav links */}
        <ul className="flex-1 space-y-1 px-3 py-4" role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                    'hover:bg-white/10 focus-visible:bg-white/10',
                    isActive
                      ? 'bg-sidebar-active text-white'
                      : 'text-sidebar-foreground/80',
                  )
                }
                aria-current={undefined}
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* TTS control at bottom */}
        <div className="border-t border-white/10 p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-white/10 hover:text-sidebar-foreground"
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking()
              } else {
                speak('Text to speech is enabled.')
              }
            }}
            aria-label={isSpeaking ? 'Stop text to speech' : 'Test text to speech'}
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Volume2 className="h-5 w-5" aria-hidden="true" />
            )}
            <span>{isSpeaking ? 'Stop Speaking' : 'Text to Speech'}</span>
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <main
        id="main-content"
        role="main"
        className="flex-1 overflow-y-auto"
        tabIndex={-1}
      >
        <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
