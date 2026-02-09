# AccessAdmin AI

An adaptive AI companion for people with disabilities in administrative and office roles. Built for the Beyond Binary hackathon.

## Features

- **Meeting Assist** -- Real-time speech-to-text transcription, AI-powered meeting summaries, and action item extraction with multimodal outputs (voice, visual, haptic).
- **Smart Schedule** -- Voice-controlled Google Calendar management with adaptive forms and simplified mode for cognitive accessibility.
- **Documents & Email** -- AI email summarization, document OCR scanning via Tesseract.js, and text-to-speech readout.
- **Prompt Hub** -- Accessible AI prompting with guided templates, voice input, and conversation history.
- **Accessibility Settings** -- Disability profile selection, output mode preferences, font size, high contrast, reduced motion, and simplified UI toggles.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + Radix UI primitives
- **State:** TanStack Query + Zustand
- **Backend:** Supabase (Auth, PostgreSQL, Real-time)
- **AI:** Google Gemini API (summarization, prompting)
- **Speech:** Web Speech API (transcription + TTS)
- **OCR:** Tesseract.js
- **Integrations:** Google Calendar API, Gmail API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project (free tier works)
- Google Gemini API key (free tier)
- Google Cloud OAuth client ID (for Calendar/Gmail features)

### Installation

```bash
git clone https://github.com/your-org/Beyond-Binary.git
cd Beyond-Binary
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `VITE_GEMINI_API_KEY` | Google Gemini API key |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID |

### Database Setup

1. Go to your Supabase dashboard SQL Editor
2. Run the migration file: `supabase/migrations/001_initial_schema.sql`
3. This creates the `profiles`, `meeting_notes`, and `prompt_history` tables with Row Level Security

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # Base primitives (Button, Card, Input, etc.)
│   ├── Layout.tsx       # App shell with accessible sidebar navigation
│   ├── AccessibilityProvider.tsx  # Global accessibility context
│   ├── MeetingControls.tsx        # Recording toolbar
│   ├── TranscriptDisplay.tsx      # Live caption display
│   ├── ActionItems.tsx            # Extracted action items
│   ├── ScheduleView.tsx           # Calendar event list
│   ├── EventForm.tsx              # Adaptive event creation form
│   ├── EmailSummary.tsx           # AI-summarized email list
│   ├── DocumentScanner.tsx        # File upload + OCR pipeline
│   ├── PromptForm.tsx             # Multimodal prompt input
│   └── PromptTemplates.tsx        # Quick-start templates
├── hooks/               # Custom React hooks
│   ├── useTranscription.ts        # Web Speech API wrapper
│   ├── useCalendar.ts             # Google Calendar data
│   ├── useSpeechSynthesis.ts      # TTS controls
│   └── useSupabase.ts             # Auth state
├── lib/                 # Utilities and configuration
│   ├── supabaseClient.ts          # Supabase client init
│   ├── googleAuth.ts              # Google OAuth helpers
│   ├── types.ts                   # Application types
│   ├── database.types.ts          # Supabase DB types
│   └── utils.ts                   # Tailwind merge utility
├── pages/               # Route-level page components
│   ├── Home.tsx                   # Dashboard with feature cards
│   ├── MeetingAssist.tsx          # Live transcription + AI summary
│   ├── Schedule.tsx               # Calendar management
│   ├── Documents.tsx              # Email + document handling
│   ├── PromptHub.tsx              # AI prompting interface
│   └── Settings.tsx               # Accessibility preferences
├── services/            # API and business logic
│   ├── aiService.ts               # Gemini API integration
│   ├── calendarService.ts         # Google Calendar CRUD
│   ├── documentService.ts         # Gmail + OCR
│   └── transcriptionService.ts    # Speech recognition
├── store/               # Global state (Zustand)
│   └── appStore.ts
├── App.tsx              # Router + providers
├── main.tsx             # Entry point
└── index.css            # Tailwind + accessibility styles
```

## Accessibility Features

- **Skip-to-content link** for keyboard navigation
- **ARIA landmarks** (navigation, main, role attributes)
- **ARIA live regions** for dynamic content updates
- **Keyboard navigable** sidebar and all interactive elements
- **High contrast mode** toggle
- **Large text mode** with configurable font sizes
- **Reduced motion** respects OS preference and user toggle
- **Screen reader compatible** with descriptive labels
- **Voice input** for all text fields
- **Text-to-speech** for all content
- **Haptic feedback** for mobile devices
- **Simplified UI mode** for cognitive accessibility

## License

MIT
