import { toast } from 'vue-sonner'

/**
 * Global notification composable using Sonner toast
 * Provides methods to show success, error, and info notifications
 */
export const useNotification = () => {
  const showSuccess = (message: string, duration = 4000) => {
    toast.success(message, {
      duration,
    })
  }

  const showError = (message: string, duration = 5000) => {
    toast.error(message, {
      duration,
    })
  }

  const showInfo = (message: string, duration = 4000) => {
    toast.info(message, {
      duration,
    })
  }

  return {
    showSuccess,
    showError,
    showInfo,
  }
}
