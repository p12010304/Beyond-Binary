import { useState } from 'react'
import { Send, Mic, MicOff, Loader2, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useTranscription } from '@/hooks/useTranscription'
import { useAccessibility } from '@/components/AccessibilityProvider'

interface PromptFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: (prompt: string) => void
  isLoading: boolean
  placeholder?: string
}

export default function PromptForm({
  value,
  onChange,
  onSubmit,
  isLoading,
  placeholder = 'Type your question, or use the microphone for voice input.',
}: PromptFormProps) {
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } =
    useTranscription()
  const { speak, preferences } = useAccessibility()

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening()
      if (transcript) {
        onChange(value ? `${value} ${transcript}` : transcript)
      }
      resetTranscript()
      setIsVoiceActive(false)
    } else {
      resetTranscript()
      startListening()
      setIsVoiceActive(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim() || isLoading) return
    onSubmit(value.trim())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="prompt-input" className="sr-only">
          Enter your prompt
        </label>
        <Textarea
          id="prompt-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          disabled={isLoading}
          aria-describedby="prompt-help"
        />
        {isVoiceActive && transcript && (
          <p className="text-xs text-muted-foreground mt-1.5" aria-live="polite">
            Hearing: {transcript}
          </p>
        )}
      </div>

      <p id="prompt-help" className="text-xs text-muted-foreground leading-relaxed">
        {preferences.simplified_ui
          ? 'Type your question or use the microphone. Press Enter to send.'
          : 'Enter to send, Shift+Enter for new line. Use the microphone for voice input.'}
      </p>

      <div className="flex gap-2">
        <Button type="submit" disabled={!value.trim() || isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Send
            </>
          )}
        </Button>

        {isSupported && (
          <Button
            type="button"
            variant={isVoiceActive ? 'destructive' : 'outline'}
            onClick={handleVoiceToggle}
            aria-label={isVoiceActive ? 'Stop voice input' : 'Start voice input'}
          >
            {isVoiceActive ? (
              <MicOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Mic className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (value) speak(value)
          }}
          disabled={!value}
          aria-label="Read prompt aloud"
        >
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </form>
  )
}
