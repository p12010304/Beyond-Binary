# AccessAdmin AI

An adaptive AI companion for people with disabilities in administrative and office roles. The app adapts its entire interface — interaction modes, layout complexity, audio behaviour, and visual design — based on the user's disability profile so that every feature works across multiple abilities instead of relying on a single mode of interaction.

Built for the **Beyond Binary** hackathon.

---

## Problem Statement

Technology's potential in supporting specially-abled individuals remains under-explored. Existing assistive tools often target only one group and rely on a single mode (speech, text, or vision), leaving out people who cannot use that specific mode. AccessAdmin AI addresses this by providing a **unified, multimodal** workspace that auto-configures itself to match each user's needs.

## Target Audience

| Persona | Profile | Scenario |
|---------|---------|----------|
| **Alex** | Visual impairment | Admin assistant who relies on audio output for emails and meeting notes |
| **Jamie** | Hearing impairment | Receptionist who needs real-time captions and visual alerts |
| **Taylor** | Dyslexia / Cognitive | Data entry worker overwhelmed by text-heavy tasks, benefits from audio alternatives and simplified guidance |

Primary users: individuals with disabilities (visual, hearing, cognitive, dyslexia, motor, or multiple) seeking or employed in admin/office roles. Secondary users: employers, HR teams, and job coaches integrating the app into supported employment programs.

---

## Features

### Profile-Driven Adaptive UX
- **Guided onboarding wizard** — 4-step setup that profiles the user and auto-configures every accessibility setting
- **6 disability profiles** (visual, hearing, cognitive, dyslexia, motor, multiple) with per-profile presets, tips, and feature rankings
- **Functional output modes** — `voice`, `visual`, `haptic`, and `simplified` modes that drive real behaviour throughout the app
- **Modality badges** on every feature card showing which interaction modes are available and active

### Voice Navigation
- **Push-to-Talk** — hold `Ctrl+Shift+V` (page navigation) or `Ctrl+Shift+F` (function navigation), say a command, release
- **Page-specific voice commands** — e.g. "Start", "Stop", "Summarize", "Read", "Reset" on Meeting Assist
- Hands-free operation designed for motor disabilities and screen reader users

### Meeting Assist
- **Real-time transcription** via Groq Whisper (high accuracy, auto-punctuated) with Web Speech API fallback
- **AI-powered summaries** and action item extraction via Google Gemini
- **Speech player** — music-player-style TTS playback with pause, resume, seek, progress bar, and real-time word highlighting
- **STT readiness indicator** — "Preparing microphone..." → "Ready — speak now" so initial words are never lost
- **Profile adaptations:**
  - *Hearing:* caption mode — large, high-contrast transcript text
  - *Cognitive:* numbered step-by-step guidance above the controls
  - *Visual:* auto-speak summaries on generation

### Smart Schedule
- Google Calendar integration with voice-controlled event creation
- Adaptive forms with microphone input on all fields
- Simplified mode reduces form complexity for cognitive profiles

### Documents & Email
- **Gmail integration** with AI email summarization via Gemini
- **Document OCR** scanning via Tesseract.js with TTS readout
- **Profile adaptations:**
  - *Visual:* "Read All" button, auto-announce subjects on load
  - *Cognitive:* fewer emails displayed, simplified labels

### Prompt Hub
- AI prompting with guided templates, voice input, and conversation history
- **Profile adaptations:**
  - *Cognitive/Dyslexia:* 3 templates instead of 6, step-by-step instructions, history hidden in simplified mode
  - *Visual:* auto-focus textarea on page load

### Accessibility Settings
- Disability profile selection with auto-configuration and confirmation toast
- Output mode preferences (voice, visual, haptic, simplified)
- Theme (light / dark / system) with instant preview
- Font size, high contrast, reduced motion, haptic feedback, simplified UI toggles
- ElevenLabs voice picker with preview
- STT/TTS engine status indicators
- "Re-run Setup Wizard" button

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript + Vite 7 |
| **Styling** | Tailwind CSS v4 + Radix UI primitives (Dialog, Tooltip, Toast, Tabs, Dropdown) |
| **State** | Zustand (global app state) + TanStack React Query (async data) |
| **Backend** | Supabase (Auth, PostgreSQL, Row Level Security) |
| **AI** | Google Gemini API — meeting summarization, email summarization, AI prompting |
| **Speech-to-Text** | Groq Whisper API (primary, chunked `MediaRecorder` upload) · Web Speech API (fallback) |
| **Text-to-Speech** | ElevenLabs API (primary, natural voices, pause/seek/resume) · Browser `SpeechSynthesis` (fallback) |
| **OCR** | Tesseract.js v7 |
| **Calendar/Email** | Google Calendar API + Gmail API via `gapi` + Google Identity Services |
| **Routing** | React Router v7 |

### API Keys & Services

| Service | Purpose | Required? |
|---------|---------|-----------|
| Supabase | Auth, database | Yes |
| Google Gemini | AI summarization & prompting | Yes |
| Google OAuth | Calendar & Gmail access | For Schedule/Documents features |
| Groq | High-accuracy speech-to-text | Optional (falls back to Web Speech API) |
| ElevenLabs | Natural text-to-speech voices | Optional (falls back to browser voices) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project (free tier works)
- Google Gemini API key ([AI Studio](https://aistudio.google.com/))
- Google Cloud OAuth 2.0 Client ID (for Calendar/Gmail)
- *(Optional)* Groq API key ([console.groq.com](https://console.groq.com/))
- *(Optional)* ElevenLabs API key ([elevenlabs.io](https://elevenlabs.io/))

### Installation

```bash
git clone https://github.com/your-org/Beyond-Binary.git
cd Beyond-Binary
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_GEMINI_API_KEY` | Google Gemini API key |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID |
| `VITE_GROQ_API_KEY` | Groq API key *(optional)* |
| `VITE_ELEVENLABS_API_KEY` | ElevenLabs API key *(optional)* |

### Database Setup

1. Open your Supabase dashboard → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. This creates the `profiles`, `meeting_notes`, and `prompt_history` tables with Row Level Security

### Google OAuth Setup

1. Create an OAuth 2.0 Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Add your dev origin (e.g. `http://localhost:5173`) to **Authorized JavaScript origins** and **Authorized redirect URIs**
3. Enable the **Google Calendar API** and **Gmail API** in the APIs & Services library

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser (Chrome or Edge recommended for full Web Speech API support).

### Build

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/                    # Reusable UI components
│   ├── ui/                        # Base primitives (Button, Card, Input, Badge, Skeleton, Textarea)
│   ├── AccessibilityProvider.tsx   # Global accessibility context (prefs, TTS, STT state, output mode)
│   ├── Layout.tsx                 # App shell with responsive sidebar, theme toggle, voice nav
│   ├── OnboardingWizard.tsx       # 4-step guided setup with focus trap & ARIA live regions
│   ├── ModalityBadges.tsx         # Interaction mode indicators (text, voice, visual, haptic)
│   ├── SpeechPlayer.tsx           # TTS playback controls (pause, seek, word highlighting)
│   ├── MeetingControls.tsx        # Recording toolbar with STT readiness indicator
│   ├── TranscriptDisplay.tsx      # Live transcript / caption mode display
│   ├── ActionItems.tsx            # Extracted action items with toggle
│   ├── ScheduleView.tsx           # Calendar event list
│   ├── EventForm.tsx              # Adaptive event form with per-field voice input
│   ├── EmailSummary.tsx           # AI-summarized email list
│   ├── DocumentScanner.tsx        # File upload + Tesseract OCR pipeline
│   ├── PromptForm.tsx             # Multimodal prompt input with voice toggle
│   └── PromptTemplates.tsx        # Quick-start AI templates (configurable count)
├── hooks/                         # Custom React hooks
│   ├── useTranscription.ts        # STT session management with readiness state
│   ├── useVoiceNavigation.ts      # Push-to-Talk voice command system
│   ├── useCalendar.ts             # Google Calendar data fetching
│   ├── useSpeechSynthesis.ts      # Browser TTS controls
│   └── useSupabase.ts             # Supabase auth state
├── lib/                           # Utilities and configuration
│   ├── profilePresets.ts          # Per-disability settings, tips, and feature rankings
│   ├── types.ts                   # Application types (DisabilityProfile, UserPreferences, etc.)
│   ├── googleAuth.ts              # Google OAuth + GAPI helpers
│   ├── supabaseClient.ts          # Supabase client initialisation
│   ├── database.types.ts          # Supabase-generated DB types
│   └── utils.ts                   # Tailwind class merge utility
├── pages/                         # Route-level page components
│   ├── Home.tsx                   # Profile-aware dashboard with reordered features and tips
│   ├── MeetingAssist.tsx          # Transcription + AI summary (profile-adaptive)
│   ├── Schedule.tsx               # Google Calendar management
│   ├── Documents.tsx              # Email + OCR (profile-adaptive)
│   ├── PromptHub.tsx              # AI prompting (profile-adaptive)
│   └── Settings.tsx               # Accessibility preferences with auto-configuration
├── services/                      # API and business logic
│   ├── aiService.ts               # Google Gemini API integration
│   ├── groqTranscriptionService.ts # Groq Whisper chunked upload STT
│   ├── transcriptionService.ts    # STT engine selection + Web Speech API
│   ├── elevenLabsTtsService.ts    # ElevenLabs TTS with pause/seek/resume
│   ├── calendarService.ts         # Google Calendar CRUD
│   └── documentService.ts         # Gmail fetch + email parsing
├── store/                         # Global state
│   └── appStore.ts                # Zustand store (voice nav state, sidebar)
├── App.tsx                        # Router + providers + onboarding gate
├── main.tsx                       # Entry point
└── index.css                      # Tailwind config + accessibility animations
```

---

## Accessibility

### Standards
- WCAG 2.1 AA–level patterns throughout
- Semantic HTML with ARIA landmarks, roles, live regions
- Skip-to-content link for keyboard navigation
- All interactive elements are keyboard navigable with visible focus rings

### Visual
- High contrast mode (root CSS class toggle)
- Configurable font sizes (normal / large / extra-large)
- Reduced motion (disables animations, respects `prefers-reduced-motion`)
- Dark / light / system theme with instant switching

### Auditory
- Text-to-speech on all content (ElevenLabs or browser)
- Advanced speech player with pause, resume, seek, and real-time word highlighting
- Auto-TTS mode reads AI responses aloud automatically
- STT readiness indicator prevents missed words

### Motor
- Voice navigation via Push-to-Talk (no mouse required)
- Voice input on all text fields
- Keyboard shortcuts (Enter to submit, Escape to close)
- Large touch targets

### Cognitive
- Simplified UI mode hides advanced options
- Step-by-step numbered guidance on key pages
- Fewer templates and choices in simplified mode
- Plain language descriptions throughout

### Multimodal
- Output mode system: voice, visual, haptic, and simplified can be combined
- Modality badges show available interaction modes per feature
- Haptic feedback via Vibration API on key events
- Every feature supports at least text + voice interaction

---

## License

MIT
