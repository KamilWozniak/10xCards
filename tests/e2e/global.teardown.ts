import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database/database.types'

async function globalTeardown() {
  const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NUXT_PUBLIC_SUPABASE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '⚠️  Skipping E2E test data cleanup: Missing NUXT_PUBLIC_SUPABASE_URL or NUXT_PUBLIC_SUPABASE_KEY environment variables'
    )
    return
  }

  const userId = process.env.E2E_USERNAME_ID

  if (!userId) {
    console.warn('⚠️  Skipping E2E test data cleanup: Missing E2E_USERNAME_ID environment variable')
    return
  }

  try {
    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    console.log('🧹 Starting E2E test data cleanup...')

    // Delete in correct order to respect foreign key constraints
    await supabase.from('flashcards').delete().eq('user_id', userId)

    await supabase.from('generations').delete().eq('user_id', userId)

    await supabase.from('generation_error_logs').delete().eq('user_id', userId)

    console.log('✅ E2E test data cleaned up successfully')
  } catch (error) {
    console.error('❌ Error during E2E test data cleanup:', error)
    // Don't throw - teardown errors shouldn't fail the test run
  }
}

export default globalTeardown
