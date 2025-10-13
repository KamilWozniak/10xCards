import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'

export const useSupabase = () => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseKey = config.public.supabaseKey as string

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase configuration is missing. Please check your .env file.')
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  return { supabase }
}
