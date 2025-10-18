import { describe, it, expect } from 'vitest'
import { useAuthErrors, mapSupabaseAuthError } from '../useAuthErrors'

/**
 * Test suite for useAuthErrors composable
 *
 * Tests cover:
 * - Error mapping function (mapSupabaseAuthError)
 * - Known error codes and messages
 * - HTTP status code handling
 * - Edge cases and fallback behavior
 * - Composable hook functionality
 * - Polish error message localization
 * - Various error object structures
 */

describe('useAuthErrors', () => {
  describe('mapSupabaseAuthError - Known error codes', () => {
    it('should map invalid_credentials to Polish message', () => {
      const error = { code: 'invalid_credentials' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should map invalid_grant to Polish message', () => {
      const error = { code: 'invalid_grant' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should map email_exists to Polish message', () => {
      const error = { code: 'email_exists' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Użytkownik z tym adresem email już istnieje')
    })

    it('should map user_already_exists to Polish message', () => {
      const error = { code: 'user_already_exists' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Użytkownik z tym adresem email już istnieje')
    })

    it('should map weak_password to Polish message', () => {
      const error = { code: 'weak_password' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Hasło jest za słabe. Użyj minimum 6 znaków')
    })

    it('should map invalid_email to Polish message', () => {
      const error = { code: 'invalid_email' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy format adresu email')
    })

    it('should map user_not_found to Polish message', () => {
      const error = { code: 'user_not_found' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nie znaleziono użytkownika z tym adresem email')
    })

    it('should map email_not_confirmed to Polish message', () => {
      const error = { code: 'email_not_confirmed' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową')
    })

    it('should map over_email_send_rate_limit to Polish message', () => {
      const error = { code: 'over_email_send_rate_limit' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wysłano zbyt wiele emaili. Spróbuj ponownie później')
    })

    it('should map too_many_requests to Polish message', () => {
      const error = { code: 'too_many_requests' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Zbyt wiele prób. Spróbuj ponownie później')
    })

    it('should map network_error to Polish message', () => {
      const error = { code: 'network_error' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Błąd połączenia. Sprawdź połączenie z internetem')
    })

    it('should map server_error to Polish message', () => {
      const error = { code: 'server_error' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Błąd serwera. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - Error code field variations', () => {
    it('should handle error_code field (alternative to code)', () => {
      const error = { error_code: 'invalid_credentials' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should prioritize code field over error_code field', () => {
      const error = { 
        code: 'weak_password',
        error_code: 'invalid_credentials'
      }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Hasło jest za słabe. Użyj minimum 6 znaków')
    })

    it('should handle unknown error codes gracefully', () => {
      const error = { code: 'unknown_error_code' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - Message field parsing', () => {
    it('should parse error message containing "invalid credentials"', () => {
      const error = { message: 'Authentication failed: invalid credentials provided' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should parse error message containing "weak password"', () => {
      const error = { message: 'Password validation failed: weak password detected' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Hasło jest za słabe. Użyj minimum 6 znaków')
    })

    it('should parse error message containing "email exists"', () => {
      const error = { message: 'Registration failed: email exists in system' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Użytkownik z tym adresem email już istnieje')
    })

    it('should parse error message containing "user not_found"', () => {
      const error = { message: 'Login failed: user not_found in database' }
      const result = mapSupabaseAuthError(error)
      
      // The implementation looks for "user not_found" (only first underscore replaced with space)
      expect(result).toBe('Nie znaleziono użytkownika z tym adresem email')
    })

    it('should handle message parsing with underscores converted to spaces', () => {
      const error = { message: 'Error: too many_requests detected' }
      const result = mapSupabaseAuthError(error)
      
      // The implementation looks for "too many_requests" (only first underscore replaced)
      expect(result).toBe('Zbyt wiele prób. Spróbuj ponownie później')
    })

    it('should handle case insensitive message parsing', () => {
      const error = { message: 'INVALID CREDENTIALS PROVIDED' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should return default message for unrecognized message content', () => {
      const error = { message: 'Some unknown error occurred' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - HTTP status codes', () => {
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
      
      expect(result).toBe('Brak dostępu. Sprawdź swoje uprawnienia')
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

    it('should handle unknown HTTP status codes', () => {
      const error = { status: 418 } // I'm a teapot
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - Priority and precedence', () => {
    it('should prioritize message parsing over status code', () => {
      const error = { 
        message: 'Authentication failed: invalid credentials',
        status: 500
      }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should prioritize message parsing over code field', () => {
      const error = { 
        code: 'weak_password',
        message: 'Authentication failed: invalid credentials'
      }
      const result = mapSupabaseAuthError(error)
      
      // Message parsing happens first, so "invalid credentials" is found first
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should use status code when message parsing fails', () => {
      const error = { 
        message: 'Unknown authentication error',
        status: 401
      }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should handle complex error object with all fields', () => {
      const error = { 
        code: 'invalid_credentials',
        error_code: 'weak_password',
        message: 'Some other error message',
        status: 500
      }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })
  })

  describe('mapSupabaseAuthError - Edge cases and null handling', () => {
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

    it('should handle error with empty string message', () => {
      const error = { message: '' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle error with null message', () => {
      const error = { message: null }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle error with empty string code', () => {
      const error = { code: '' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle error with zero status', () => {
      const error = { status: 0 }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle string error (not object)', () => {
      const result = mapSupabaseAuthError('Some error string')
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle number error (not object)', () => {
      const result = mapSupabaseAuthError(404)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - Real-world Supabase error scenarios', () => {
    it('should handle typical Supabase AuthError structure', () => {
      const error = {
        name: 'AuthError',
        message: 'Invalid login credentials',
        status: 400
      }
      const result = mapSupabaseAuthError(error)
      
      // Message parsing fails (no exact match), so falls back to status 400
      expect(result).toBe('Nieprawidłowe dane. Sprawdź formularz i spróbuj ponownie')
    })

    it('should handle Supabase signup error with weak password', () => {
      const error = {
        message: 'Password should be at least 6 characters: weak password',
        status: 422
      }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Hasło jest za słabe. Użyj minimum 6 znaków')
    })

    it('should handle Supabase email already registered error', () => {
      const error = {
        message: 'User already registered',
        status: 422
      }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle network timeout error', () => {
      const error = {
        name: 'TypeError',
        message: 'Failed to fetch',
        cause: { code: 'NETWORK_ERROR' }
      }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle rate limiting error from Supabase', () => {
      const error = {
        message: 'For security purposes, you can only request this once every 60 seconds',
        status: 429
      }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Zbyt wiele prób. Spróbuj ponownie później')
    })
  })

  describe('mapSupabaseAuthError - Message parsing edge cases', () => {
    it('should handle message with multiple matching patterns', () => {
      const error = { message: 'invalid credentials and weak password detected' }
      const result = mapSupabaseAuthError(error)
      
      // Should match the first pattern found (invalid credentials)
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should handle message with partial matches', () => {
      const error = { message: 'credential validation failed' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Wystąpił błąd. Spróbuj ponownie później')
    })

    it('should handle message with special characters', () => {
      const error = { message: 'Error: invalid credentials (auth/failed)' }
      const result = mapSupabaseAuthError(error)
      
      // The message contains "invalid credentials" which matches the pattern
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should handle message with Unicode characters', () => {
      const error = { message: 'Błąd: invalid credentials 🔒' }
      const result = mapSupabaseAuthError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
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
      
      const error = { code: 'invalid_credentials' }
      const result = mapError(error)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should maintain function behavior across multiple composable calls', () => {
      const auth1 = useAuthErrors()
      const auth2 = useAuthErrors()
      
      const error = { code: 'weak_password' }
      
      expect(auth1.mapError(error)).toBe(auth2.mapError(error))
      expect(auth1.mapError(error)).toBe('Hasło jest za słabe. Użyj minimum 6 znaków')
    })
  })

  describe('Business rules and integration scenarios', () => {
    it('should handle authentication flow errors consistently', () => {
      const { mapError } = useAuthErrors()
      
      // Login scenario
      const loginError = { status: 401 }
      expect(mapError(loginError)).toBe('Nieprawidłowy email lub hasło')
      
      // Registration scenario
      const registrationError = { code: 'email_exists' }
      expect(mapError(registrationError)).toBe('Użytkownik z tym adresem email już istnieje')
      
      // Password validation scenario
      const passwordError = { code: 'weak_password' }
      expect(mapError(passwordError)).toBe('Hasło jest za słabe. Użyj minimum 6 znaków')
    })

    it('should provide user-friendly messages for all error types', () => {
      const testCases = [
        { error: { code: 'invalid_credentials' }, expectsUserFriendly: true },
        { error: { code: 'email_exists' }, expectsUserFriendly: true },
        { error: { status: 500 }, expectsUserFriendly: true },
        { error: { message: 'Network error' }, expectsUserFriendly: true },
        { error: {}, expectsUserFriendly: true },
      ]
      
      testCases.forEach(({ error, expectsUserFriendly }) => {
        const result = mapSupabaseAuthError(error)
        
        if (expectsUserFriendly) {
          expect(result).not.toContain('Error')
          expect(result).not.toContain('error')
          expect(result).not.toContain('failed')
          expect(result).not.toContain('invalid')
          expect(typeof result).toBe('string')
          expect(result.length).toBeGreaterThan(0)
        }
      })
    })

    it('should handle errors from different authentication providers', () => {
      // Supabase-style error
      const supabaseError = { message: 'Authentication failed: invalid credentials' }
      expect(mapSupabaseAuthError(supabaseError)).toBe('Nieprawidłowy email lub hasło')
      
      // Generic HTTP error
      const httpError = { status: 401 }
      expect(mapSupabaseAuthError(httpError)).toBe('Nieprawidłowy email lub hasło')
      
      // Custom error code
      const customError = { code: 'user_not_found' }
      expect(mapSupabaseAuthError(customError)).toBe('Nie znaleziono użytkownika z tym adresem email')
    })

    it('should maintain consistency across error mapping calls', () => {
      const error = { code: 'invalid_credentials' }
      
      // Multiple calls should return the same result
      const result1 = mapSupabaseAuthError(error)
      const result2 = mapSupabaseAuthError(error)
      const result3 = mapSupabaseAuthError(error)
      
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
      expect(result1).toBe('Nieprawidłowy email lub hasło')
    })
  })

  describe('Performance and memory considerations', () => {
    it('should handle large error objects efficiently', () => {
      const largeError = {
        code: 'invalid_credentials',
        message: 'A'.repeat(10000), // Large message
        stack: 'B'.repeat(5000),    // Large stack trace
        details: { data: 'C'.repeat(1000) },
        timestamp: Date.now(),
        requestId: 'req-' + 'D'.repeat(100)
      }
      
      const result = mapSupabaseAuthError(largeError)
      
      expect(result).toBe('Nieprawidłowy email lub hasło')
    })

    it('should handle rapid successive error mapping calls', () => {
      const errors = Array.from({ length: 100 }, (_, i) => ({
        code: i % 2 === 0 ? 'invalid_credentials' : 'weak_password'
      }))
      
      const results = errors.map(error => mapSupabaseAuthError(error))
      
      results.forEach((result, index) => {
        if (index % 2 === 0) {
          expect(result).toBe('Nieprawidłowy email lub hasło')
        } else {
          expect(result).toBe('Hasło jest za słabe. Użyj minimum 6 znaków')
        }
      })
    })

    it('should not modify the original error object', () => {
      const originalError = { 
        code: 'invalid_credentials',
        message: 'Original message',
        status: 401
      }
      const errorCopy = { ...originalError }
      
      mapSupabaseAuthError(originalError)
      
      expect(originalError).toEqual(errorCopy)
    })
  })
})
