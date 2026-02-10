import { create } from 'zustand'

const SIDEBAR_WIDTH_KEY = 'accessadmin_sidebar_width'
const SIDEBAR_COLLAPSED_KEY = 'accessadmin_sidebar_collapsed'

function loadNumber(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key)
    return v ? Number(v) : fallback
  } catch {
    return fallback
  }
}

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const v = localStorage.getItem(key)
    return v ? v === 'true' : fallback
  } catch {
    return fallback
  }
}

interface AppState {
  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

  // Sidebar width (desktop resizable)
  sidebarWidth: number
  setSidebarWidth: (width: number) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void

  // Voice navigation priority
  voiceNavigationActive: boolean
  setVoiceNavigationActive: (active: boolean) => void

  // Meeting state
  currentMeetingId: string | null
  setCurrentMeetingId: (id: string | null) => void

  // Global loading
  isGlobalLoading: boolean
  setGlobalLoading: (loading: boolean) => void

  // Notifications
  notifications: Array<{ id: string; message: string; type: 'info' | 'success' | 'error' }>
  addNotification: (message: string, type?: 'info' | 'success' | 'error') => void
  removeNotification: (id: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  sidebarWidth: loadNumber(SIDEBAR_WIDTH_KEY, 256),
  setSidebarWidth: (width) => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(width))
    set({ sidebarWidth: width })
  },
  sidebarCollapsed: loadBool(SIDEBAR_COLLAPSED_KEY, false),
  setSidebarCollapsed: (collapsed) => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed))
    set({ sidebarCollapsed: collapsed })
  },

  voiceNavigationActive: false,
  setVoiceNavigationActive: (active) => set({ voiceNavigationActive: active }),

  currentMeetingId: null,
  setCurrentMeetingId: (id) => set({ currentMeetingId: id }),

  isGlobalLoading: false,
  setGlobalLoading: (loading) => set({ isGlobalLoading: loading }),

  notifications: [],
  addNotification: (message, type = 'info') =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { id: crypto.randomUUID(), message, type },
      ],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}))
