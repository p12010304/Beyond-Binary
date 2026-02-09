/**
 * Google OAuth and API helpers.
 * Uses the gapi client library for Calendar and Gmail API access.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.readonly',
].join(' ')

let gapiLoaded = false
let gisLoaded = false
let tokenClient: google.accounts.oauth2.TokenClient | null = null

/**
 * Load the gapi client library script.
 */
export function loadGapiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gapiLoaded) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://apis.google.com/js/api.js'
    script.onload = () => {
      window.gapi.load('client', async () => {
        await window.gapi.client.init({})
        gapiLoaded = true
        resolve()
      })
    }
    script.onerror = () => reject(new Error('Failed to load Google API script'))
    document.head.appendChild(script)
  })
}

/**
 * Load the Google Identity Services (GIS) script.
 */
export function loadGisScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (gisLoaded) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.onload = () => {
      gisLoaded = true
      resolve()
    }
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
}

/**
 * Initialize and return a token client.
 */
export function getTokenClient(callback: (response: google.accounts.oauth2.TokenResponse) => void): google.accounts.oauth2.TokenClient {
  if (!CLIENT_ID) {
    throw new Error('Google Client ID not configured. Set VITE_GOOGLE_CLIENT_ID in .env')
  }

  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback,
    })
  }

  return tokenClient
}

/**
 * Check if we have a valid access token.
 */
export function hasValidToken(): boolean {
  const token = window.gapi?.client?.getToken()
  return !!token?.access_token
}

/**
 * Request a new access token via popup.
 */
export function requestAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = getTokenClient((response) => {
      if (response.error) {
        reject(new Error(response.error))
      } else {
        resolve(response.access_token)
      }
    })
    client.requestAccessToken()
  })
}
