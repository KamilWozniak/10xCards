import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'

export const useSupabase = () => {
  // Use Nuxt's useState to create a shared singleton instance
  // This persists across component rerenders and HMR
  const supabase = useState<SupabaseClient<Database>>('supabase-client', () => {
    const config = useRuntimeConfig()

    const supabaseUrl = config.public.supabaseUrl as string
    const supabaseKey = config.public.supabaseKey as string

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing. Please check your .env file.')
    }

    // Create client using standard createClient (stores session in localStorage)
    // This is simpler for client-side and works better with setSession/getUser
    return createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  })

  return { supabase: supabase.value }
}
