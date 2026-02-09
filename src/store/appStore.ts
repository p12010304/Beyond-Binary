import { create } from 'zustand'

interface AppState {
  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void

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
