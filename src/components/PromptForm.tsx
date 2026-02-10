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
  const { isInitializing, isListening, transcript, startListening, stopListening, resetTranscript, isSupported } =
    useTranscription()
  const { speak, preferences } = useAccessibility()

  const isMicBusy = isInitializing || isListening

  const handleVoiceToggle = () => {
    if (isMicBusy) {
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
        {isVoiceActive && isInitializing && (
          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5" aria-live="polite">
            <Loader2 className="h-3 w-3 animate-spin text-primary" aria-hidden="true" />
            Preparing microphone&hellip; Please wait before speaking.
          </p>
        )}
        {isVoiceActive && isListening && !transcript && (
          <p className="text-xs mt-1.5 flex items-center gap-1.5" aria-live="polite">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-recording" aria-hidden="true" />
            <span className="text-success font-medium">Ready</span>
            <span className="text-muted-foreground">— speak now.</span>
          </p>
        )}
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
            variant={isVoiceActive ? (isInitializing ? 'outline' : 'destructive') : 'outline'}
            onClick={handleVoiceToggle}
            aria-label={
              isInitializing
                ? 'Preparing microphone — click to cancel'
                : isMicBusy
                  ? 'Stop voice input'
                  : 'Start voice input'
            }
          >
            {isInitializing ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            ) : isMicBusy ? (
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
