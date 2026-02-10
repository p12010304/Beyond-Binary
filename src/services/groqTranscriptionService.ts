/**
 * Groq Whisper transcription service.
 * Records audio in short chunks via MediaRecorder, sends each chunk
 * to Groq's Whisper API for accurate, punctuated transcription.
 */

import type { TranscriptionCallbacks } from './transcriptionService'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined
const GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions'
const CHUNK_DURATION_MS = 5_000 // 5-second chunks

export function isGroqAvailable(): boolean {
  return !!GROQ_API_KEY
}

async function transcribeChunk(audioBlob: Blob): Promise<string> {
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model', 'whisper-large-v3')
  formData.append('response_format', 'text')
  formData.append('language', 'en')

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Groq API error ${response.status}: ${errorText}`)
  }

  const text = await response.text()
  return text.trim()
}

export function startGroqTranscription(
  callbacks: TranscriptionCallbacks,
): { start: () => void; stop: () => void } {
  let mediaRecorder: MediaRecorder | null = null
  let stream: MediaStream | null = null
  let chunkTimer: ReturnType<typeof setInterval> | null = null
  let stopped = false

  const start = async () => {
    try {
      stopped = false
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Prefer webm/opus, fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : undefined

      mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      let chunks: Blob[] = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        if (chunks.length === 0 || stopped) return
        const audioBlob = new Blob(chunks, { type: mimeType ?? 'audio/webm' })
        chunks = []

        // Skip tiny blobs (silence / too short to be useful)
        if (audioBlob.size < 1000) return

        try {
          const text = await transcribeChunk(audioBlob)
          if (text && !stopped) {
            callbacks.onTranscript(text, true)
          }
        } catch (err) {
          if (!stopped) {
            callbacks.onError(err instanceof Error ? err.message : 'Transcription failed')
          }
        }
      }

      mediaRecorder.start()

      // Mic is live — signal readiness
      callbacks.onReady?.()

      // Every CHUNK_DURATION_MS, stop + restart to send a chunk
      chunkTimer = setInterval(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording' && !stopped) {
          mediaRecorder.stop()
          // Small delay then restart recording for the next chunk
          setTimeout(() => {
            if (!stopped && mediaRecorder && stream?.active) {
              try {
                mediaRecorder.start()
              } catch {
                // Stream may have been stopped
              }
            }
          }, 100)
        }
      }, CHUNK_DURATION_MS)
    } catch (err) {
      callbacks.onError(
        err instanceof Error ? err.message : 'Failed to access microphone',
      )
    }
  }

  const stop = () => {
    stopped = true

    if (chunkTimer) {
      clearInterval(chunkTimer)
      chunkTimer = null
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop()
      } catch {
        // Already stopped
      }
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      stream = null
    }

    mediaRecorder = null
    callbacks.onEnd()
  }

  return { start: () => { start() }, stop }
}
