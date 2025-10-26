/**
 * Composable for authentication form validation
 *
 * Provides validation functions for email, password, and password matching
 * used in login and registration forms.
 */

/**
 * Validate email format
 *
 * @param email - Email address to validate
 * @returns Error message if invalid, null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email || email.trim().length === 0) {
    return 'Email jest wymagany'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return 'Nieprawidłowy format email'
  }

  return null
}

/**
 * Validate password length
 *
 * @param password - Password to validate
 * @param minLength - Minimum required length (default: 6)
 * @returns Error message if invalid, null if valid
 */
export function validatePassword(password: string, minLength = 6): string | null {
  if (!password || password.length === 0) {
    return 'Hasło jest wymagane'
  }

  if (password.length < minLength) {
    return `Hasło musi mieć minimum ${minLength} znaków`
  }

  return null
}

/**
 * Validate that password and confirm password match
 *
 * @param password - Original password
 * @param confirmPassword - Password confirmation
 * @returns Error message if invalid, null if valid
 */
export function validatePasswordMatch(password: string, confirmPassword: string): string | null {
  if (!confirmPassword || confirmPassword.length === 0) {
    return 'Powtórz hasło'
  }

  if (password !== confirmPassword) {
    return 'Hasła nie są identyczne'
  }

  return null
}

/**
 * Composable hook for auth form validation
 *
 * @returns Object with validation functions
 */
export const useAuthFormValidation = () => {
  return {
    validateEmail,
    validatePassword,
    validatePasswordMatch,
  }
}
