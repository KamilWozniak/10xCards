/**
 * Database types for 10x-cards application
 * Generated based on PostgreSQL schema
 * 
 * Note: These types should be kept in sync with the database schema.
 * Consider using Supabase CLI to auto-generate these types:
 * supabase gen types typescript --local > types/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      flashcards: {
        Row: {
          id: number
          user_id: string
          generation_id: number | null
          front: string
          back: string
          source: 'ai-full' | 'ai-edited' | 'manual'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          generation_id?: number | null
          front: string
          back: string
          source: 'ai-full' | 'ai-edited' | 'manual'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          generation_id?: number | null
          front?: string
          back?: string
          source?: 'ai-full' | 'ai-edited' | 'manual'
          created_at?: string
          updated_at?: string
        }
      }
      generations: {
        Row: {
          id: number
          user_id: string
          model: string
          generated_count: number
          accepted_unedited_count: number
          accepted_edited_count: number
          source_text_hash: string
          source_text_length: number
          generation_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          model: string
          generated_count?: number
          accepted_unedited_count?: number
          accepted_edited_count?: number
          source_text_hash: string
          source_text_length: number
          generation_time: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          model?: string
          generated_count?: number
          accepted_unedited_count?: number
          accepted_edited_count?: number
          source_text_hash?: string
          source_text_length?: number
          generation_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      generation_error_logs: {
        Row: {
          id: number
          user_id: string
          model: string
          source_text_hash: string
          source_text_length: number
          error_code: string
          error_message: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          model: string
          source_text_hash: string
          source_text_length: number
          error_code: string
          error_message: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          model?: string
          source_text_hash?: string
          source_text_length?: number
          error_code?: string
          error_message?: string
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Helper types for easier use in application
export type Flashcard = Database['public']['Tables']['flashcards']['Row']
export type FlashcardInsert = Database['public']['Tables']['flashcards']['Insert']
export type FlashcardUpdate = Database['public']['Tables']['flashcards']['Update']

export type Generation = Database['public']['Tables']['generations']['Row']
export type GenerationInsert = Database['public']['Tables']['generations']['Insert']
export type GenerationUpdate = Database['public']['Tables']['generations']['Update']

export type GenerationErrorLog = Database['public']['Tables']['generation_error_logs']['Row']
export type GenerationErrorLogInsert = Database['public']['Tables']['generation_error_logs']['Insert']
export type GenerationErrorLogUpdate = Database['public']['Tables']['generation_error_logs']['Update']

// Union types for specific fields
export type FlashcardSource = 'ai-full' | 'ai-edited' | 'manual'

// DTOs (Data Transfer Objects) for API responses
export interface FlashcardWithGeneration extends Flashcard {
  generation?: Generation | null
}

export interface GenerationWithFlashcards extends Generation {
  flashcards?: Flashcard[]
}

export interface GenerationStats {
  total_generations: number
  total_flashcards_generated: number
  total_flashcards_accepted: number
  acceptance_rate: number
  ai_edited_rate: number
}

