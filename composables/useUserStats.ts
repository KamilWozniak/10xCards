/**
 * Composable for user statistics
 * Provides methods for fetching comprehensive user statistics and analytics
 */

export const useUserStats = () => {
  // eslint-disable-next-line no-undef
  const supabase = useSupabaseClient()

  /**
   * Get comprehensive user statistics
   */
  const getUserStats = async () => {
    const { data, error } = await supabase.rpc('get_user_stats')

    if (error) {
      console.error('Error fetching user stats:', error)
      throw error
    }

    return data
  }

  /**
   * Get daily flashcard creation statistics
   */
  const getDailyFlashcardStats = async (daysBack: number = 7) => {
    const { data, error } = await supabase.rpc('get_daily_flashcard_stats', {
      days_back: daysBack
    })

    if (error) {
      console.error('Error fetching daily flashcard stats:', error)
      throw error
    }

    return data
  }

  /**
   * Delete all user data (GDPR compliance)
   * WARNING: This is irreversible!
   */
  const deleteAllUserData = async () => {
    const { data, error } = await supabase.rpc('delete_all_user_data')

    if (error) {
      console.error('Error deleting user data:', error)
      throw error
    }

    return data
  }

  return {
    getUserStats,
    getDailyFlashcardStats,
    deleteAllUserData,
  }
}

