import type { H3Event } from 'h3'
import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'
import { UnauthorizedError } from '~/server/utils/errors/custom-errors'

/**
 * Get authenticated user ID from Supabase Auth session
 *
 * Verifies JWT token from cookies and extracts user_id
 * Throws UnauthorizedError if token is missing or invalid
 *
 * @param event - H3 event object from Nuxt server context
 * @returns user_id string
 * @throws UnauthorizedError if authentication fails
 */
export async function getUserId(event: H3Event): Promise<string> {
  try {
    // Create Supabase server client (reads auth cookies)
    const supabase = createSupabaseServerClient(event)

    // Get user from session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Check for authentication errors
    if (error) {
      console.error('Auth error in getUserId:', error)
      throw new UnauthorizedError('Invalid or expired authentication token', error.message)
    }

    // Check if user exists
    if (!user || !user.id) {
      throw new UnauthorizedError('No authenticated user found')
    }

    // Return user ID
    return user.id
  } catch (error: any) {
    // Re-throw UnauthorizedError
    if (error instanceof UnauthorizedError) {
      throw error
    }

    // Handle unexpected errors
    console.error('Unexpected error in getUserId:', error)
    throw new UnauthorizedError('Authentication verification failed', error.message)
  }
}
