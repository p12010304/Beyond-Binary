// Supabase-generated style types (manual for now; regenerate via CLI later)
// Run: npx supabase gen types typescript --local > src/lib/database.types.ts

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          disability_profile: string | null
          preferences: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id: string
          disability_profile?: string | null
          preferences?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          disability_profile?: string | null
          preferences?: Record<string, unknown>
          created_at?: string
        }
      }
      meeting_notes: {
        Row: {
          id: string
          user_id: string
          meeting_id: string
          transcript: string
          summary: string
          action_items: Record<string, unknown>[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          meeting_id: string
          transcript?: string
          summary?: string
          action_items?: Record<string, unknown>[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          meeting_id?: string
          transcript?: string
          summary?: string
          action_items?: Record<string, unknown>[]
          created_at?: string
        }
      }
      prompt_history: {
        Row: {
          id: string
          user_id: string
          prompt: string
          response: string
          mode: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          response?: string
          mode?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          response?: string
          mode?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
