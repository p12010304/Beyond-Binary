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
  Sun,
  Moon,
  Monitor,
  GripVertical,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { useAccessibility } from '@/components/AccessibilityProvider'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'

const SIDEBAR_MIN = 200
const SIDEBAR_MAX = 400
const SIDEBAR_DEFAULT = 256
const SIDEBAR_COLLAPSED_WIDTH = 64

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/meeting', icon: Mic, label: 'Meeting Assist' },
  { to: '/schedule', icon: Calendar, label: 'Schedule' },
  { to: '/documents', icon: FileText, label: 'Documents' },
  { to: '/prompt-hub', icon: MessageSquare, label: 'Prompt Hub' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const themeIcons = { light: Sun, dark: Moon, system: Monitor } as const

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { isSpeaking, stopSpeaking, speak, preferences, setTheme } = useAccessibility()
  const {
    sidebarWidth,
    setSidebarWidth,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useAppStore()

  const sidebarRef = useRef<HTMLElement>(null)
  const isResizing = useRef(false)

  // Cycle theme: light -> dark -> system
  const cycleTheme = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const idx = order.indexOf(preferences.theme)
    setTheme(order[(idx + 1) % order.length])
  }

  const ThemeIcon = themeIcons[preferences.theme] ?? Sun

  // --- Resize logic ---
  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    isResizing.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'

    const startX = e.clientX
    const startWidth = sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth

    const onMove = (ev: PointerEvent) => {
      if (!isResizing.current) return
      const delta = ev.clientX - startX
      const newWidth = startWidth + delta

      if (newWidth < SIDEBAR_MIN - 40) {
        setSidebarCollapsed(true)
      } else {
        setSidebarCollapsed(false)
        setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, newWidth)))
      }
    }

    const onUp = () => {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }, [sidebarWidth, sidebarCollapsed, setSidebarWidth, setSidebarCollapsed])

  // Keyboard resize
  const handleResizeKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      const next = sidebarWidth - 10
      if (next < SIDEBAR_MIN) {
        setSidebarCollapsed(true)
      } else {
        setSidebarWidth(next)
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      if (sidebarCollapsed) {
        setSidebarCollapsed(false)
        setSidebarWidth(SIDEBAR_DEFAULT)
      } else {
        setSidebarWidth(Math.min(SIDEBAR_MAX, sidebarWidth + 10))
      }
    }
  }, [sidebarWidth, sidebarCollapsed, setSidebarWidth, setSidebarCollapsed])

  // Escape to close mobile sidebar
  useEffect(() => {
    if (!mobileOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [mobileOpen])

  // Focus trap for mobile sidebar
  useEffect(() => {
    if (!mobileOpen || !sidebarRef.current) return
    const nav = sidebarRef.current
    const focusable = nav.querySelectorAll<HTMLElement>(
      'a, button, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first.focus()

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [mobileOpen])

  const collapsed = sidebarCollapsed
  const desktopWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : sidebarWidth

  return (
    <div className="flex min-h-screen">
      {/* Skip to content */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/30 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav
        ref={sidebarRef}
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col glass-heavy text-sidebar-foreground',
          'md:static md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{
          width: `${mobileOpen ? SIDEBAR_DEFAULT : desktopWidth}px`,
          transition: isResizing.current ? 'none' : `transform var(--duration-slow) var(--ease-in-out), width var(--duration-normal) var(--ease-out)`,
        }}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-3 border-b border-sidebar-foreground/10 px-4 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-[--radius-md] bg-primary text-primary-foreground font-semibold text-xs shrink-0">
            AA
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-semibold leading-tight truncate">AccessAdmin</h1>
              <p className="text-[0.6875rem] text-sidebar-foreground/50 leading-tight">Workspace</p>
            </div>
          )}
        </div>

        {/* Nav links */}
        <ul className="flex-1 space-y-0.5 px-2 py-3 overflow-y-auto" role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-[--radius-md] px-3 py-2.5 text-sm font-medium',
                    'transition-all',
                    'hover:bg-sidebar-foreground/8 focus-visible:bg-sidebar-foreground/8',
                    isActive
                      ? 'bg-sidebar-active/90 text-primary-foreground'
                      : 'text-sidebar-foreground/70',
                    collapsed && 'justify-center px-0',
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Bottom controls */}
        <div className="border-t border-sidebar-foreground/10 p-2 space-y-0.5 shrink-0">
          {/* Collapse toggle (desktop only) */}
          <Button
            variant="ghost"
            className={cn(
              'w-full text-sidebar-foreground/60 hover:bg-sidebar-foreground/8 hover:text-sidebar-foreground',
              collapsed ? 'justify-center' : 'justify-start gap-3',
            )}
            size={collapsed ? 'icon' : 'default'}
            onClick={() => {
              if (collapsed) {
                setSidebarCollapsed(false)
                setSidebarWidth(SIDEBAR_DEFAULT)
              } else {
                setSidebarCollapsed(true)
              }
            }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeft className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
            ) : (
              <>
                <PanelLeftClose className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
                <span className="text-sm truncate">Collapse</span>
              </>
            )}
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            className={cn(
              'w-full text-sidebar-foreground/60 hover:bg-sidebar-foreground/8 hover:text-sidebar-foreground',
              collapsed ? 'justify-center' : 'justify-start gap-3',
            )}
            size={collapsed ? 'icon' : 'default'}
            onClick={cycleTheme}
            aria-label={`Theme: ${preferences.theme}. Click to change.`}
            title={`Theme: ${preferences.theme}`}
          >
            <ThemeIcon className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
            {!collapsed && (
              <span className="text-sm truncate capitalize">{preferences.theme} mode</span>
            )}
          </Button>

          {/* TTS toggle */}
          <Button
            variant="ghost"
            className={cn(
              'w-full text-sidebar-foreground/60 hover:bg-sidebar-foreground/8 hover:text-sidebar-foreground',
              collapsed ? 'justify-center' : 'justify-start gap-3',
            )}
            size={collapsed ? 'icon' : 'default'}
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking()
              } else {
                speak('Text to speech is enabled.')
              }
            }}
            aria-label={isSpeaking ? 'Stop text to speech' : 'Test text to speech'}
            title={isSpeaking ? 'Stop speaking' : 'Text to speech'}
          >
            {isSpeaking ? (
              <VolumeX className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
            ) : (
              <Volume2 className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
            )}
            {!collapsed && (
              <span className="text-sm truncate">{isSpeaking ? 'Stop Speaking' : 'Text to Speech'}</span>
            )}
          </Button>
        </div>
      </nav>

      {/* Resize handle (desktop only) */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        aria-valuenow={desktopWidth}
        aria-valuemin={SIDEBAR_COLLAPSED_WIDTH}
        aria-valuemax={SIDEBAR_MAX}
        tabIndex={0}
        className={cn(
          'hidden md:flex items-center justify-center w-2 cursor-col-resize shrink-0',
          'hover:bg-primary/10 focus-visible:bg-primary/10 transition-colors',
          'group',
        )}
        onPointerDown={handleResizeStart}
        onKeyDown={handleResizeKeyDown}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary/60 transition-colors" aria-hidden="true" />
      </div>

      {/* Main content */}
      <main
        id="main-content"
        role="main"
        className="flex-1 min-w-0 overflow-y-auto"
        tabIndex={-1}
      >
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
