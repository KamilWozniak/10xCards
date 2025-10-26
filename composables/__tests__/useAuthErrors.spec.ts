import { describe, it, expect } from 'vitest'
import { useAuthErrors, mapSupabaseAuthError } from '../useAuthErrors'

/**
 * Test suite for useAuthErrors composable
 *
 * Tests the simplified error mapping implementation that:
 * - Maps English error messages from server endpoints to Polish
 * - Handles Supabase SDK error messages
 * - Falls back to HTTP status codes
 * - Returns user-friendly default messages
 */

describe('useAuthErrors', () => {
  describe('mapSupabaseAuthError - Server endpoint errors (error.data.statusMessage)', () => {
    it('should map "Email and password are required" to Polish', () => {
      const error = { data: { statusMessage: 'Email and password are required' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Email i hasło są wymagane')
    })

    it('should map "Invalid email format" to Polish', () => {
      const error = { data: { statusMessage: 'Invalid email format' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should map "Password is required" to Polish', () => {
      const error = { data: { statusMessage: 'Password is required' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Hasło jest wymagane')
    })

    it('should map "Invalid email or password" to Polish', () => {
      const error = { data: { statusMessage: 'Invalid email or password' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should map "An error occurred during login" to Polish', () => {
      const error = { data: { statusMessage: 'An error occurred during login' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd podczas logowania')
    })

    it('should map "Email, password and confirm password are required" to Polish', () => {
      const error = {
        data: { statusMessage: 'Email, password and confirm password are required' },
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Email, hasło i potwierdzenie hasła są wymagane')
    })

    it('should map "Password must be at least 6 characters" to Polish', () => {
      const error = { data: { statusMessage: 'Password must be at least 6 characters' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Hasło musi mieć minimum 6 znaków')
    })

    it('should map "Passwords do not match" to Polish', () => {
      const error = { data: { statusMessage: 'Passwords do not match' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Hasła nie są identyczne')
    })

    it('should map "Password is too weak. Use at least 6 characters" to Polish', () => {
      const error = {
        data: { statusMessage: 'Password is too weak. Use at least 6 characters' },
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Hasło jest za słabe. Użyj minimum 6 znaków')
    })

    it('should map "Failed to create account" to Polish', () => {
      const error = { data: { statusMessage: 'Failed to create account' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nie udało się utworzyć konta')
    })

    it('should map "Failed to create account. Please try again" to Polish', () => {
      const error = {
        data: { statusMessage: 'Failed to create account. Please try again' },
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nie udało się utworzyć konta. Spróbuj ponownie')
    })

    it('should map "An error occurred during registration" to Polish', () => {
      const error = { data: { statusMessage: 'An error occurred during registration' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd podczas rejestracji')
    })

    it('should map "Logged out successfully" to Polish', () => {
      const error = { data: { statusMessage: 'Logged out successfully' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wylogowano pomyślnie')
    })

    it('should map "An error occurred during logout" to Polish', () => {
      const error = { data: { statusMessage: 'An error occurred during logout' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd podczas wylogowania')
    })

    it('should map "Service temporarily unavailable. Please try again later" to Polish', () => {
      const error = {
        data: { statusMessage: 'Service temporarily unavailable. Please try again later' },
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Usługa tymczasowo niedostępna. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - Fallback to error.statusMessage', () => {
    it('should use error.statusMessage if error.data.statusMessage is not present', () => {
      const error = { statusMessage: 'Invalid email or password' }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should prioritize error.data.statusMessage over error.statusMessage', () => {
      const error = {
        data: { statusMessage: 'Invalid email format' },
        statusMessage: 'Password is required',
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy format email')
    })
  })

  describe('mapSupabaseAuthError - Supabase SDK error messages', () => {
    it('should map "Invalid login credentials" to Polish', () => {
      const error = { message: 'Invalid login credentials' }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should map "Email not confirmed" to Polish', () => {
      const error = { message: 'Email not confirmed' }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Email nie został potwierdzony')
    })

    it('should map "User already registered" to generic error (enumeration attack prevention)', () => {
      const error = { message: 'User already registered' }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle partial match for "invalid login credentials" (case insensitive)', () => {
      const error = { message: 'Authentication failed: Invalid Login Credentials' }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should handle partial match for "email not confirmed"', () => {
      const error = { message: 'Email Not Confirmed, please check your inbox' }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Email nie został potwierdzony')
    })

    it('should handle partial match for "user already registered" (enumeration attack prevention)', () => {
      const error = { message: 'User Already Registered in system' }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle partial match for "already exists" (enumeration attack prevention)', () => {
      const error = { message: 'Email already exists in database' }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - HTTP status code fallback', () => {
    it('should handle 400 Bad Request status', () => {
      const error = { status: 400 }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowe dane. Sprawdź formularz i spróbuj ponownie')
    })

    it('should handle 401 Unauthorized status', () => {
      const error = { status: 401 }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should handle 403 Forbidden status', () => {
      const error = { status: 403 }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Brak dostępu')
    })

    it('should handle 429 Too Many Requests status', () => {
      const error = { status: 429 }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Zbyt wiele prób. Spróbuj ponownie później')
    })

    it('should handle 500 Internal Server Error status', () => {
      const error = { status: 500 }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Błąd serwera. Spróbuj ponownie później')
    })

    it('should handle 502 Bad Gateway status', () => {
      const error = { status: 502 }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Błąd serwera. Spróbuj ponownie później')
    })

    it('should handle 503 Service Unavailable status', () => {
      const error = { status: 503 }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Błąd serwera. Spróbuj ponownie później')
    })

    it('should handle 503 from error.data.statusCode', () => {
      const error = { data: { statusCode: 503 } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Błąd serwera. Spróbuj ponownie później')
    })

    it('should use status from error.data.statusCode', () => {
      const error = { data: { statusCode: 401 } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should use status from error.statusCode', () => {
      const error = { statusCode: 429 }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Zbyt wiele prób. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - Priority and precedence', () => {
    it('should prioritize statusMessage over message', () => {
      const error = {
        data: { statusMessage: 'Invalid email format' },
        message: 'Invalid login credentials',
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should prioritize message over status code', () => {
      const error = {
        message: 'Invalid login credentials',
        status: 500,
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should use status code when statusMessage and message are not mapped', () => {
      const error = {
        data: { statusMessage: 'Unknown error' },
        message: 'Some unknown error',
        status: 401,
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })
  })

  describe('mapSupabaseAuthError - Edge cases', () => {
    it('should handle null error', () => {
      const result = mapSupabaseAuthError(null)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle undefined error', () => {
      const result = mapSupabaseAuthError(undefined)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle empty object error', () => {
      const result = mapSupabaseAuthError({})

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle error with unknown statusMessage', () => {
      const error = { data: { statusMessage: 'Some unknown error' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle error with unknown message', () => {
      const error = { message: 'Some unknown error' }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle error with unknown status code', () => {
      const error = { status: 418 } // I'm a teapot
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle string error (not object)', () => {
      const result = mapSupabaseAuthError('Some error string')

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle error with empty string statusMessage', () => {
      const error = { data: { statusMessage: '' } }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - Real-world scenarios', () => {
    it('should handle typical $fetch error from login endpoint', () => {
      const error = {
        data: {
          statusCode: 401,
          statusMessage: 'Invalid email or password',
        },
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should handle typical $fetch error from register endpoint', () => {
      const error = {
        data: {
          statusCode: 400,
          statusMessage: 'Passwords do not match',
        },
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Hasła nie są identyczne')
    })

    it('should handle Supabase auth.signInWithPassword error', () => {
      const error = {
        message: 'Invalid login credentials',
        status: 400,
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should handle Supabase auth.signUp error for existing user (enumeration attack prevention)', () => {
      const error = {
        message: 'User already registered',
        status: 422,
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle network error', () => {
      const error = {
        message: 'Failed to fetch',
        cause: { code: 'NETWORK_ERROR' },
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle rate limiting', () => {
      const error = {
        data: {
          statusCode: 429,
          statusMessage: 'Too many requests',
        },
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Zbyt wiele prób. Spróbuj ponownie później')
    })

    it('should handle service unavailable (database connection error)', () => {
      const error = {
        data: {
          statusCode: 503,
          statusMessage: 'Service temporarily unavailable. Please try again later',
        },
      }
      const result = mapSupabaseAuthError(error)

      expect(result).toBe('Usługa tymczasowo niedostępna. Spróbuj ponownie później')
    })
  })

  describe('useAuthErrors composable hook', () => {
    it('should return an object with mapError function', () => {
      const { mapError } = useAuthErrors()

      expect(typeof mapError).toBe('function')
    })

    it('should return the same function as mapSupabaseAuthError', () => {
      const { mapError } = useAuthErrors()

      expect(mapError).toBe(mapSupabaseAuthError)
    })

    it('should work correctly when called through composable', () => {
      const { mapError } = useAuthErrors()

      const error = { data: { statusMessage: 'Invalid email format' } }
      const result = mapError(error)

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should maintain function behavior across multiple composable calls', () => {
      const auth1 = useAuthErrors()
      const auth2 = useAuthErrors()

      const error = { message: 'Invalid login credentials' }

      expect(auth1.mapError(error)).toBe(auth2.mapError(error))
      expect(auth1.mapError(error)).toBe('Nieprawidłowy email lub hasło')
    })
  })

  describe('Consistency and immutability', () => {
    it('should not modify the original error object', () => {
      const originalError = {
        data: { statusMessage: 'Invalid email format' },
        message: 'Original message',
        status: 401,
      }
      const errorCopy = { ...originalError }

      mapSupabaseAuthError(originalError)

      expect(originalError).toEqual(errorCopy)
    })

    it('should return consistent results for the same error', () => {
      const error = { data: { statusMessage: 'Invalid email or password' } }

      const result1 = mapSupabaseAuthError(error)
      const result2 = mapSupabaseAuthError(error)
      const result3 = mapSupabaseAuthError(error)

      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
      expect(result1).toBe('Nieprawidłowy email lub hasło')
    })

    it('should always return a string', () => {
      const testCases = [
        { data: { statusMessage: 'Invalid email format' } },
        { message: 'Invalid login credentials' },
        { status: 401 },
        {},
        null,
        undefined,
        'string error',
      ]

      testCases.forEach(error => {
        const result = mapSupabaseAuthError(error)
        expect(typeof result).toBe('string')
        expect(result.length).toBeGreaterThan(0)
      })
    })
  })
})
