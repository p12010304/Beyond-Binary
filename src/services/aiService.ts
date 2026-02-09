import type { AISummaryResult } from '@/lib/types'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>
    }
  }>
  error?: { message: string }
}

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env')
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
  }

  const data = (await response.json()) as GeminiResponse

  if (data.error) {
    throw new Error(`Gemini error: ${data.error.message}`)
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

/**
 * Summarize a meeting transcript and extract action items.
 */
export async function summarizeMeeting(transcript: string): Promise<AISummaryResult> {
  const prompt = `You are an AI assistant helping people with disabilities in administrative roles.

Analyze the following meeting transcript and provide:
1. A clear, concise summary (2-4 sentences, using simple language)
2. A list of action items with assignees if mentioned
3. Key topics discussed

Format your response as JSON with this structure:
{
  "summary": "...",
  "action_items": [{"task": "...", "due": null, "completed": false}],
  "key_topics": ["..."]
}

Transcript:
${transcript}

Respond ONLY with valid JSON, no markdown formatting.`

  const result = await callGemini(prompt)

  try {
    const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    return JSON.parse(cleaned) as AISummaryResult
  } catch {
    return {
      summary: result,
      action_items: [],
      key_topics: [],
    }
  }
}

/**
 * Summarize an email or document.
 */
export async function summarizeDocument(content: string, type: 'email' | 'document' = 'document'): Promise<string> {
  const prompt = `You are an AI assistant helping people with disabilities.

Summarize the following ${type} in simple, clear language (2-3 sentences). 
Highlight any deadlines, required actions, or important dates.

${type === 'email' ? 'Email' : 'Document'} content:
${content}

Provide a concise summary:`

  return callGemini(prompt)
}

/**
 * Answer a general prompt from the Prompt Hub.
 */
export async function answerPrompt(
  prompt: string,
  context?: string,
): Promise<string> {
  const systemContext = context
    ? `Context: ${context}\n\n`
    : ''

  const fullPrompt = `You are an accessible AI assistant helping people with disabilities in administrative work.
Use clear, simple language. Be concise and actionable.

${systemContext}User request: ${prompt}`

  return callGemini(fullPrompt)
}

/**
 * Generate a simplified version of text for cognitive accessibility.
 */
export async function simplifyText(text: string): Promise<string> {
  const prompt = `Rewrite the following text in very simple, easy-to-understand language. 
Use short sentences. Avoid jargon. Use bullet points where helpful.

Text: ${text}`

  return callGemini(prompt)
}
