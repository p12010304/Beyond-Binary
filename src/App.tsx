import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AccessibilityProvider } from '@/components/AccessibilityProvider'
import Layout from '@/components/Layout'
import Home from '@/pages/Home'
import MeetingAssist from '@/pages/MeetingAssist'
import Schedule from '@/pages/Schedule'
import Documents from '@/pages/Documents'
import PromptHub from '@/pages/PromptHub'
import Settings from '@/pages/Settings'

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
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/meeting" element={<MeetingAssist />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/prompt-hub" element={<PromptHub />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AccessibilityProvider>
    </QueryClientProvider>
  )
}

export default App
