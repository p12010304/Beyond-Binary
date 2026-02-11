import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useSupabase'
import OnboardingWizard, { isOnboardingComplete } from '@/components/OnboardingWizard'

const ONBOARDING_KEY = 'accessadmin_onboarding_complete'

export default function OnboardingGate() {
  const { user } = useAuth()
  const [complete, setComplete] = useState(() => isOnboardingComplete())

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setComplete(true)
  }

  if (user && !complete) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />
  }

  return <Outlet />
}
