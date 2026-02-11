import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AccessibilityProvider } from '@/components/AccessibilityProvider'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import OnboardingGate from '@/components/OnboardingGate'
import Home from '@/pages/Home'
import MeetingAssist from '@/pages/MeetingAssist'
import Schedule from '@/pages/Schedule'
import Documents from '@/pages/Documents'
import PromptHub from '@/pages/PromptHub'
import Settings from '@/pages/Settings'
import Login from '@/pages/Login'
import Landing from '@/pages/Landing'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<OnboardingGate />}>
                <Route element={<Layout />}>
                  <Route path="/home" element={<Home />} />
                  <Route path="/meeting" element={<MeetingAssist />} />
                  <Route path="/schedule" element={<Schedule />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/prompt-hub" element={<PromptHub />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AccessibilityProvider>
    </QueryClientProvider>
  )
}

export default App
