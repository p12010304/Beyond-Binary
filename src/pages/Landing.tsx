import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { 
  Mic, 
  Calendar, 
  FileText, 
  Sparkles, 
  ArrowRight,
  Accessibility,
  Zap,
  Shield
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Access Admin AI
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              Your Intelligent Workplace Assistant
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Combining voice recognition, AI intelligence, and accessibility-first design to provide comprehensive support for meetings, scheduling, and document management.
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => navigate('/login')}
            size="lg"
            className="group text-lg px-8 py-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Get Started
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>

          {/* Feature Grid */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Mic className="w-8 h-8" />}
              title="Smart Meetings"
              description="Real-time speech-to-text with AI summaries"
              color="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Schedule Management"
              description="Seamless Google Calendar integration"
              color="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon={<FileText className="w-8 h-8" />}
              title="Document Processing"
              description="OCR recognition and intelligent organization"
              color="from-green-500 to-emerald-500"
            />
            <FeatureCard
              icon={<Accessibility className="w-8 h-8" />}
              title="Accessibility First"
              description="Designed for everyone"
              color="from-orange-500 to-red-500"
            />
          </div>

          {/* Additional Features */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              <span>Fast & Efficient</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span>Secure & Reliable</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-8 text-gray-500 dark:text-gray-400 text-sm">
        © 2026 Access Admin AI. Built for accessible work.
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${color} text-white mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {description}
      </p>
    </div>
  )
}
