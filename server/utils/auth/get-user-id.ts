/**
 * Get user ID for the current request
 *
 * DEVELOPMENT MODE: Returns DEFAULT_USER_ID from useSupabase composable
 *
 * In production, this will be replaced with proper Supabase Auth token verification
 *
 * @returns user_id string
 */
export function getUserId(): string {
  // For development, use the default user ID
  // In production, this will extract user_id from Supabase Auth token
  const DEFAULT_USER_ID = '1b80fade-ccb5-43e8-ba09-c2e07bd3ddf9'

  return DEFAULT_USER_ID
}
