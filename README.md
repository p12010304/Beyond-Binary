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

### Authentication & User Accounts

Secure login system via Supabase Auth with email/password and Google OAuth sign-in. Every user gets an auto-provisioned profile row in the database, and all routes are protected — unauthenticated visitors are redirected to the login page. Row Level Security ensures each user can only access their own data (profiles, meeting notes, prompt history). Demo accounts are seeded for each disability profile so evaluators can experience each persona instantly.

**Why it matters:** Employers and job coaches can create accounts per employee, ensuring each individual's accessibility configuration persists across sessions and devices — critical for supported employment programs where consistency reduces cognitive load.

### Profile-Driven Adaptive UX

The app auto-configures itself to match the user's disability profile, eliminating the need to manually toggle dozens of settings. A 4-step onboarding wizard introduces the app, lets the user pick from 6 disability profiles (visual, hearing, cognitive, dyslexia, motor, multiple), previews the settings that will be applied, and provides profile-specific tips.

- **Guided onboarding wizard** — accessible modal with focus trap, ARIA live regions, keyboard navigation, and Escape-to-skip
- **6 disability profiles** with per-profile presets, persona stories, tips, and feature rankings
- **Functional output modes** — `voice`, `visual`, `haptic`, and `simplified` modes that drive real behaviour throughout the app
- **Modality badges** on every feature card showing which interaction modes are available and active

**Why it matters:** Many users with disabilities face "settings fatigue" — they abandon tools because setup is overwhelming. One-click profile selection removes that barrier, making the app immediately usable from the first visit.

### Voice Navigation

A Push-to-Talk voice command system that lets users navigate the entire app and trigger actions without a mouse or keyboard. Hold `Ctrl+Shift+V` for page navigation or `Ctrl+Shift+F` for function-level commands (e.g. "Start recording", "Summarize", "Read aloud"), speak, and release.

- Page-specific voice commands on every feature
- Automatically pauses meeting transcription to avoid conflicts
- Hands-free operation for motor disabilities and screen reader users

**Why it matters:** For individuals with motor disabilities or repetitive strain injuries, mouse and keyboard interaction can be painful or impossible. Voice navigation provides a complete hands-free alternative, enabling full productivity without physical strain.

### Meeting Assist

Real-time meeting transcription with AI-powered summarization, action item extraction, speaker diarization, and sentiment/tone analysis. Designed so that individuals with hearing, visual, or cognitive disabilities can participate fully in workplace meetings — the most common pain point reported by disabled employees in office roles.

- **Real-time transcription** via Groq Whisper (high accuracy, auto-punctuated) with Web Speech API fallback
- **Speaker diarization & tone analysis** — identifies speakers (Speaker A, Speaker B) and annotates emotional tone (Calm, Enthusiastic, Urgent, Questioning, etc.) on each transcript segment. This is a simulated preview feature (toggleable via `ENABLE_MOCK_DIARIZATION` flag) demonstrating how production diarization services (e.g. AssemblyAI, Deepgram) would integrate
- **Editable transcript** — after recording stops, the transcript becomes an editable text area so users can correct transcription errors before summarizing
- **AI-powered summaries** and action item extraction via Google Gemini
- **PDF export** — generate a formatted meeting report with executive summary, tone analysis, key topics, action items table, and full transcript
- **Speech player** — music-player-style TTS playback with pause, resume, seek, progress bar, and real-time word highlighting
- **STT readiness indicator** — "Preparing microphone..." → "Ready — speak now" so initial words are never lost
- **Profile adaptations:**
  - *Hearing:* caption mode — large, high-contrast transcript text positioned prominently
  - *Cognitive:* numbered step-by-step guidance above the controls ("Step 1: Click Record. Step 2: Speak. Step 3: Summarize.")
  - *Visual:* auto-speak summaries on generation

**Why speaker diarization helps:** Hearing-impaired users reading a caption-mode transcript need to know *who* is speaking — without labels, a meeting transcript is an undifferentiated wall of text. Speaker tags provide the conversational structure that hearing users get naturally from voice recognition.

**Why tone analysis helps:** Individuals with cognitive disabilities, autism spectrum conditions, or social communication differences often struggle to interpret emotional context in conversation. Tone annotations (Calm, Urgent, Questioning) make the emotional layer explicit, supporting better workplace social understanding and reducing misinterpretation.

### Smart Schedule

Voice-controlled Google Calendar management with adaptive forms. Every form field supports microphone input, so users can create events by speaking instead of typing.

- Google Calendar integration (OAuth 2.0)
- Adaptive event creation form with per-field voice dictation
- Simplified mode reduces form complexity for cognitive profiles

**Why it matters:** Calendar management is one of the most common admin tasks, yet standard calendar UIs are complex and text-heavy. For individuals with motor disabilities, typing event details is slow and painful. For those with cognitive disabilities, navigating date pickers and multi-field forms is overwhelming. Voice-driven, simplified event creation removes both barriers.

### Documents & Email

AI-powered email summarization and document OCR scanning, turning dense text content into concise, speakable summaries. Connects to Gmail to fetch and summarize emails, and processes uploaded documents (images, PDFs) through Tesseract.js OCR.

- **Gmail integration** with AI email summarization via Gemini
- **Document OCR** scanning via Tesseract.js with TTS readout
- **Profile adaptations:**
  - *Visual:* "Read All" button that speaks every email subject and sender aloud; auto-announce subjects on load
  - *Cognitive:* fewer emails displayed (5 instead of 10), simplified labels and descriptions

**Why it matters:** Email is the backbone of office communication, but it's one of the biggest barriers for disabled employees. Visually impaired workers can't quickly scan an inbox. Dyslexic employees struggle with dense email text. Cognitively disabled individuals are overwhelmed by volume. AI summarization, voice readout, and reduced-clutter views address all three.

### Prompt Hub

An accessible AI prompting interface with guided templates for common workplace tasks — drafting emails, summarizing documents, creating meeting agendas, writing replies, and practising social scripts.

- AI prompting with guided templates, voice input, and conversation history
- **Profile adaptations:**
  - *Cognitive/Dyslexia:* only 3 templates shown (instead of 6), step-by-step instructions ("1. Pick a template. 2. Press Send. 3. Click Read Aloud."), history hidden in simplified mode
  - *Visual:* auto-focus textarea on page load, announce templates via TTS on focus

**Why it matters:** Many capable employees with cognitive disabilities or dyslexia struggle not with ideas, but with organising and expressing them clearly. The Prompt Hub removes that barrier by providing ready-made structures for common tasks — drafting an email becomes "fill in one blank and press Send" instead of starting from a blank page. This enables clearer communication, greater confidence, and stronger workplace inclusion.

### Accessibility Settings

A comprehensive settings page where users can fine-tune every aspect of the app's accessibility behaviour, with instant auto-configuration when a disability profile is selected.

- Disability profile selection with auto-configuration and confirmation toast
- Output mode preferences (voice, visual, haptic, simplified)
- Theme (light / dark / system) with instant preview
- Font size, high contrast, reduced motion, haptic feedback, simplified UI toggles
- ElevenLabs voice picker with preview
- STT/TTS engine status indicators
- "Re-run Setup Wizard" button to redo onboarding

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + TypeScript + Vite 7 |
| **Styling** | Tailwind CSS v4 + Radix UI primitives (Dialog, Tooltip, Toast, Tabs, Dropdown) |
| **State** | Zustand (global app state) + TanStack React Query (async data) |
| **Backend** | Supabase (Auth, PostgreSQL, Storage, Row Level Security) |
| **AI** | Google Gemini API — meeting summarization, email summarization, AI prompting |
| **Speech-to-Text** | Groq Whisper API (primary, chunked `MediaRecorder` upload) · Web Speech API (fallback) |
| **Text-to-Speech** | ElevenLabs API (primary, natural voices, pause/seek/resume) · Browser `SpeechSynthesis` (fallback) |
| **OCR** | Tesseract.js v7 |
| **PDF** | jsPDF + jspdf-autotable (meeting report export) |
| **Calendar/Email** | Google Calendar API + Gmail API via `gapi` + Google Identity Services |
| **Routing** | React Router v7 |

### API Keys & Services

| Service | Purpose | Required? |
|---------|---------|-----------|
| Supabase | Auth, database, file storage | Yes |
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
2. Run the migrations in order:
   - `supabase/migrations/001_initial_schema.sql` — creates `profiles`, `meeting_notes`, `prompt_history` tables with RLS
   - `supabase/migrations/002_storage_buckets.sql` — creates `meeting-recordings` and `user-documents` storage buckets with RLS
   - `supabase/migrations/003_disability_profiles_array.sql` — schema updates for multi-profile support
3. *(Optional)* Run `supabase/seed.sql` to create 6 demo users with pre-configured disability profiles

### Demo Accounts

After running the seed, these accounts are available (password: `Demo1234!`):

| Email | Profile | Persona |
|-------|---------|---------|
| `alex.visual@demo.accessadmin.app` | Visual | Alex |
| `jamie.hearing@demo.accessadmin.app` | Hearing | Jamie |
| `taylor.cognitive@demo.accessadmin.app` | Cognitive | Taylor |
| `taylor.dyslexia@demo.accessadmin.app` | Dyslexia | Taylor |
| `alex.motor@demo.accessadmin.app` | Motor | Alex |
| `sam.multiple@demo.accessadmin.app` | Multiple | Sam |

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
│   ├── ProtectedRoute.tsx         # Auth guard — redirects to /login if unauthenticated
│   ├── OnboardingGate.tsx         # Shows onboarding wizard on first visit after login
│   ├── OnboardingWizard.tsx       # 4-step guided setup with focus trap & ARIA live regions
│   ├── ModalityBadges.tsx         # Interaction mode indicators (text, voice, visual, haptic)
│   ├── SpeechPlayer.tsx           # TTS playback controls (pause, seek, word highlighting)
│   ├── MeetingControls.tsx        # Recording toolbar with STT readiness indicator
│   ├── TranscriptDisplay.tsx      # Live transcript / caption mode / editable post-recording
│   ├── ActionItems.tsx            # Extracted action items with toggle
│   ├── ScheduleView.tsx           # Calendar event list
│   ├── EventForm.tsx              # Adaptive event form with per-field voice input
│   ├── EmailSummary.tsx           # AI-summarized email list
│   ├── DocumentScanner.tsx        # File upload + Tesseract OCR pipeline
│   ├── PromptForm.tsx             # Multimodal prompt input with voice toggle
│   └── PromptTemplates.tsx        # Quick-start AI templates (configurable count)
├── hooks/                         # Custom React hooks
│   ├── useTranscription.ts        # STT session management with readiness state + diarization toggle
│   ├── useVoiceNavigation.ts      # Push-to-Talk voice command system
│   ├── useCalendar.ts             # Google Calendar data fetching
│   ├── useSpeechSynthesis.ts      # Browser TTS controls
│   └── useSupabase.ts             # Supabase auth (signIn, signUp, signOut, Google OAuth)
├── lib/                           # Utilities and configuration
│   ├── profilePresets.ts          # Per-disability settings, tips, and feature rankings
│   ├── pdfGenerator.ts            # Meeting summary PDF export (jsPDF + autotable)
│   ├── types.ts                   # Application types (DisabilityProfile, UserPreferences, etc.)
│   ├── googleAuth.ts              # Google OAuth + GAPI helpers
│   ├── googleAccessToken.ts       # Google access token management
│   ├── supabaseClient.ts          # Supabase client initialisation
│   ├── database.types.ts          # Supabase-generated DB types
│   └── utils.ts                   # Tailwind class merge utility
├── pages/                         # Route-level page components
│   ├── Login.tsx                  # Email/password + Google OAuth login page
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
├── App.tsx                        # Router + providers + auth gate + onboarding gate
├── main.tsx                       # Entry point
└── index.css                      # Tailwind config + accessibility animations
```

---

## Accessibility

### Standards
- WCAG 2.1 AA-level patterns throughout
- Semantic HTML with ARIA landmarks, roles, live regions
- Skip-to-content link for keyboard navigation
- All interactive elements are keyboard navigable with visible focus rings
- Focus traps on modal dialogs (onboarding wizard)

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
- Speaker tone annotations make emotional context explicit

### Multimodal
- Output mode system: voice, visual, haptic, and simplified can be combined
- Modality badges show available interaction modes per feature
- Haptic feedback via Vibration API on key events
- Every feature supports at least text + voice interaction

---

## License

MIT
