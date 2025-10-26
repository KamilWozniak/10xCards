/**
 * Composable for mapping auth error messages to Polish
 * Handles errors from server endpoints which return English messages
 */

/**
 * English to Polish message mapping
 * Contains all error messages used in auth endpoints
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Login endpoint errors
  'Email and password are required': 'Email i hasło są wymagane',
  'Invalid email format': 'Nieprawidłowy format email',
  'Password is required': 'Hasło jest wymagane',
  'Invalid email or password': 'Nieprawidłowy email lub hasło',
  'An error occurred during login': 'Wystąpił błąd podczas logowania',

  // Register endpoint errors
  'Email, password and confirm password are required':
    'Email, hasło i potwierdzenie hasła są wymagane',
  'Password must be at least 6 characters': 'Hasło musi mieć minimum 6 znaków',
  'Passwords do not match': 'Hasła nie są identyczne',
  'Password is too weak. Use at least 6 characters': 'Hasło jest za słabe. Użyj minimum 6 znaków',
  'Failed to create account': 'Nie udało się utworzyć konta',
  'Failed to create account. Please try again': 'Nie udało się utworzyć konta. Spróbuj ponownie',
  'An error occurred during registration': 'Wystąpił błąd podczas rejestracji',

  // Logout endpoint messages
  'Logged out successfully': 'Wylogowano pomyślnie',
  'An error occurred during logout': 'Wystąpił błąd podczas wylogowania',

  // Network/Connection errors
  'Service temporarily unavailable. Please try again later':
    'Usługa tymczasowo niedostępna. Spróbuj ponownie później',

  // Supabase Auth error messages (may come through error.message)
  'Invalid login credentials': 'Nieprawidłowy email lub hasło',
  'Email not confirmed': 'Email nie został potwierdzony',
  'Something went wrong': 'Wystąpił błąd. Spróbuj ponownie później',
}

/**
 * Default error message for unknown errors
 */
const DEFAULT_ERROR_MESSAGE = 'Wystąpił błąd. Spróbuj ponownie później'

/**
 * HTTP status code fallbacks
 */
const STATUS_CODE_MESSAGES: Record<number, string> = {
  400: 'Nieprawidłowe dane. Sprawdź formularz i spróbuj ponownie',
  401: 'Nieprawidłowy email lub hasło',
  403: 'Brak dostępu',
  429: 'Zbyt wiele prób. Spróbuj ponownie później',
  500: 'Błąd serwera. Spróbuj ponownie później',
  502: 'Błąd serwera. Spróbuj ponownie później',
  503: 'Błąd serwera. Spróbuj ponownie później',
}

/**
 * Map auth error to Polish message
 *
 * @param error - Error object from API call
 * @returns User-friendly error message in Polish
 */
export function mapSupabaseAuthError(error: any): string {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE
  }

  // 1. Check error.data.statusMessage (most common for H3 errors)
  const statusMessage = error?.data?.statusMessage || error?.statusMessage
  if (statusMessage && ERROR_MESSAGES[statusMessage]) {
    return ERROR_MESSAGES[statusMessage]
  }

  // 2. Check error.message (for Supabase SDK errors)
  if (error?.message && ERROR_MESSAGES[error.message]) {
    return ERROR_MESSAGES[error.message]
  }

  // 3. Check for partial matches in error.message (for Supabase errors)
  if (error?.message) {
    const message = error.message.toLowerCase()
    if (message.includes('invalid login credentials')) {
      return ERROR_MESSAGES['Invalid login credentials']
    }
    if (message.includes('email not confirmed')) {
      return ERROR_MESSAGES['Email not confirmed']
    }
  }

  // 4. Fallback to HTTP status code
  const statusCode = error?.data?.statusCode || error?.statusCode || error?.status
  if (statusCode && STATUS_CODE_MESSAGES[statusCode]) {
    return STATUS_CODE_MESSAGES[statusCode]
  }

  // 5. Return default error message
  return DEFAULT_ERROR_MESSAGE
}

/**
 * Composable hook for auth error handling
 *
 * @returns Object with mapError function
 */
export const useAuthErrors = () => {
  return {
    mapError: mapSupabaseAuthError,
  }
}
