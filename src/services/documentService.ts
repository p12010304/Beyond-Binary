import { summarizeDocument } from '@/services/aiService'

/**
 * Document and email handling service.
 * Uses Gmail API for email access and Tesseract.js for OCR.
 */

const GMAIL_API_BASE = 'https://www.googleapis.com/gmail/v1'

function getAccessToken(): string | null {
  return window.gapi?.client?.getToken()?.access_token ?? null
}

// ============================================================
// Gmail API Functions
// ============================================================

interface GmailMessage {
  id: string
  snippet: string
  subject: string
  from: string
  date: string
  body: string
}

async function gmailFetch(endpoint: string): Promise<Response> {
  const token = getAccessToken()
  if (!token) {
    throw new Error('Not authenticated with Google. Please sign in first.')
  }

  const response = await fetch(`${GMAIL_API_BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new Error(`Gmail API error: ${response.status}`)
  }

  return response
}

function decodeBase64Url(data: string): string {
  const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
  try {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
  } catch {
    return atob(base64)
  }
}

function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? ''
}

/**
 * Fetch recent emails from Gmail inbox.
 */
export async function fetchEmails(maxResults = 10): Promise<GmailMessage[]> {
  const listResponse = await gmailFetch(`/users/me/messages?maxResults=${maxResults}&labelIds=INBOX`)
  const listData = await listResponse.json()

  if (!listData.messages || listData.messages.length === 0) {
    return []
  }

  const messages: GmailMessage[] = []

  for (const msg of listData.messages.slice(0, maxResults)) {
    try {
      const detailResponse = await gmailFetch(`/users/me/messages/${msg.id}?format=full`)
      const detail = await detailResponse.json()

      const headers = detail.payload?.headers ?? []
      let body = ''

      // Extract body from parts
      if (detail.payload?.body?.data) {
        body = decodeBase64Url(detail.payload.body.data)
      } else if (detail.payload?.parts) {
        const textPart = detail.payload.parts.find(
          (p: Record<string, unknown>) => (p.mimeType as string) === 'text/plain',
        )
        if (textPart?.body?.data) {
          body = decodeBase64Url(textPart.body.data)
        }
      }

      messages.push({
        id: msg.id,
        snippet: detail.snippet ?? '',
        subject: getHeader(headers, 'Subject'),
        from: getHeader(headers, 'From'),
        date: getHeader(headers, 'Date'),
        body: body || detail.snippet || '',
      })
    } catch {
      // Skip messages that fail to parse
    }
  }

  return messages
}

/**
 * Summarize an email using AI.
 */
export async function summarizeEmail(emailBody: string): Promise<string> {
  return summarizeDocument(emailBody, 'email')
}

// ============================================================
// OCR Functions (Tesseract.js)
// ============================================================

/**
 * Perform OCR on an image file.
 */
export async function performOCR(imageFile: File): Promise<string> {
  const { createWorker } = await import('tesseract.js')
  const worker = await createWorker('eng')
  const { data: { text } } = await worker.recognize(imageFile)
  await worker.terminate()
  return text
}

/**
 * Process a document: OCR if image, read if text, then summarize.
 */
export async function processDocument(file: File): Promise<{ text: string; summary: string }> {
  let extractedText: string

  if (file.type.startsWith('image/')) {
    extractedText = await performOCR(file)
  } else if (file.type === 'text/plain') {
    extractedText = await file.text()
  } else {
    throw new Error(`Unsupported file type: ${file.type}. Please use images (JPG, PNG) or text files.`)
  }

  if (!extractedText.trim()) {
    throw new Error('No text could be extracted from the file.')
  }

  const summary = await summarizeDocument(extractedText, 'document')

  return { text: extractedText, summary }
}
