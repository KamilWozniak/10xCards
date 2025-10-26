/**
 * Composable for mapping Supabase Auth errors to user-friendly Polish messages
 */

/**
 * Error code to Polish message mapping
 * Based on auth-spec.md section 1.4.2
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  invalid_credentials: 'Nieprawidłowy email lub hasło',
  invalid_grant: 'Nieprawidłowy email lub hasło',

  // Registration errors
  email_exists: 'Użytkownik z tym adresem email już istnieje',
  user_already_exists: 'Użytkownik z tym adresem email już istnieje',

  // Password errors
  weak_password: 'Hasło jest za słabe. Użyj minimum 6 znaków',

  // Email validation
  invalid_email: 'Nieprawidłowy format adresu email',

  // User not found
  user_not_found: 'Nie znaleziono użytkownika z tym adresem email',

  // Email confirmation
  email_not_confirmed: 'Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową',

  // Rate limiting
  over_email_send_rate_limit: 'Wysłano zbyt wiele emaili. Spróbuj ponownie później',
  too_many_requests: 'Zbyt wiele prób. Spróbuj ponownie później',

  // Network/Server errors
  network_error: 'Błąd połączenia. Sprawdź połączenie z internetem',
  server_error: 'Błąd serwera. Spróbuj ponownie później',
}

/**
 * Default error message for unknown errors
 */
const DEFAULT_ERROR_MESSAGE = 'Wystąpił błąd. Spróbuj ponownie później'

/**
 * Map Supabase Auth error to user-friendly Polish message
 *
 * @param error - Supabase error object or any error
 * @returns User-friendly error message in Polish
 */
export function mapSupabaseAuthError(error: any): string {
  if (!error) {
    return DEFAULT_ERROR_MESSAGE
  }

  // Handle error.data.statusMessage (from server endpoints)
  if (error?.data?.statusMessage) {
    const statusMessage = error.data.statusMessage.toLowerCase()

    // Check for specific error messages
    if (
      statusMessage.includes('invalid login credentials') ||
      statusMessage.includes('invalid credentials')
    ) {
      return ERROR_MESSAGES.invalid_credentials
    }
    if (
      statusMessage.includes('email already exists') ||
      statusMessage.includes('user already exists')
    ) {
      return ERROR_MESSAGES.email_exists
    }
    if (statusMessage.includes('weak password')) {
      return ERROR_MESSAGES.weak_password
    }
  }

  // Handle error.statusMessage (from server endpoints)
  if (error?.statusMessage) {
    const statusMessage = error.statusMessage.toLowerCase()

    // Check for specific error messages
    if (
      statusMessage.includes('invalid login credentials') ||
      statusMessage.includes('invalid credentials')
    ) {
      return ERROR_MESSAGES.invalid_credentials
    }
    if (
      statusMessage.includes('email already exists') ||
      statusMessage.includes('user already exists')
    ) {
      return ERROR_MESSAGES.email_exists
    }
    if (statusMessage.includes('weak password')) {
      return ERROR_MESSAGES.weak_password
    }
  }

  // Handle Supabase AuthError with message field
  if (error.message) {
    const errorMessage = error.message.toLowerCase()

    // Check if error message contains known error codes
    for (const [code, message] of Object.entries(ERROR_MESSAGES)) {
      if (errorMessage.includes(code.toLowerCase().replace('_', ' '))) {
        return message
      }
    }
  }

  // Handle error with code field
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code]
  }

  // Handle error with error_code field (some Supabase errors use this)
  if (error.error_code && ERROR_MESSAGES[error.error_code]) {
    return ERROR_MESSAGES[error.error_code]
  }

  // Handle error.status for HTTP errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return 'Nieprawidłowe dane. Sprawdź formularz i spróbuj ponownie'
      case 401:
        return 'Nieprawidłowy email lub hasło'
      case 403:
        return 'Brak dostępu. Sprawdź swoje uprawnienia'
      case 429:
        return ERROR_MESSAGES.too_many_requests
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.server_error
      default:
        return DEFAULT_ERROR_MESSAGE
    }
  }

  // Return default error message
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
