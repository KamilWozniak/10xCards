/**
 * Type declarations for Nuxt 3 auto-imports
 * This file provides type definitions for functions that are auto-imported by Nuxt
 */

import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Ref } from 'vue'
import type { Database } from './database.types'

declare global {
  /**
   * Get Supabase client instance
   * Auto-imported by @nuxtjs/supabase module
   */
  function useSupabaseClient(): SupabaseClient<Database>

  /**
   * Get current Supabase user
   * Auto-imported by @nuxtjs/supabase module
   */
  function useSupabaseUser(): Ref<User | null>
}

export {}

