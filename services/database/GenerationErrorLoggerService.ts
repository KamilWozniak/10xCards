import type { CreateGenerationErrorLogCommand } from '~/types/commands/generation-commands'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'

/**
 * Service for logging generation errors to the database
 *
 * Stores AI service failures for debugging, monitoring, and analytics
 */
export class GenerationErrorLoggerService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  /**
   * Log an AI generation error to the database
   *
   * @param command - Error details to log
   * @returns void - Does not throw errors to avoid disrupting error handling flow
   */
  async log(command: CreateGenerationErrorLogCommand): Promise<void> {
    try {
      const { error } = await this.supabase.from('generation_error_logs').insert({
        user_id: command.user_id,
        model: command.model,
        source_text_hash: command.source_text_hash,
        source_text_length: command.source_text_length,
        error_code: command.error_code,
        error_message: command.error_message,
      })

      if (error) {
        // Log to console but don't throw - error logging should not disrupt main flow
        console.error('Failed to log generation error:', error.message)
      }
    } catch (err) {
      // Silently catch any errors during error logging
      console.error('Exception during error logging:', err)
    }
  }
}

/**
 * Factory function to create GenerationErrorLoggerService instance
 *
 * @param supabase - Supabase client instance
 */
export function createGenerationErrorLoggerService(
  supabase: SupabaseClient<Database>
): GenerationErrorLoggerService {
  return new GenerationErrorLoggerService(supabase)
}
