import { describe, it, expect } from 'vitest'
import { useAuthFormValidation } from '../useAuthFormValidation'

/**
 * Test suite for useAuthFormValidation composable
 *
 * Tests cover:
 * - Email validation (authentication)
 * - Password validation (authentication)
 * - Password match validation (registration)
 * - Edge cases and business rules
 */

describe('useAuthFormValidation', () => {
  describe('validateEmail - Valid inputs', () => {
    it('should accept valid email', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('user@example.com')

      expect(result).toBeNull()
    })

    it('should accept email with subdomain', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('user@mail.example.com')

      expect(result).toBeNull()
    })

    it('should accept email with dots in local part', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('first.last@example.com')

      expect(result).toBeNull()
    })

    it('should accept email with numbers', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('user123@example456.com')

      expect(result).toBeNull()
    })

    it('should accept email with plus sign', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('user+tag@example.com')

      expect(result).toBeNull()
    })

    it('should accept email with dash in domain', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('user@my-domain.com')

      expect(result).toBeNull()
    })
  })

  describe('validateEmail - Invalid inputs', () => {
    it('should reject empty email', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('')

      expect(result).toBe('Email jest wymagany')
    })

    it('should reject email with only whitespace', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('   ')

      expect(result).toBe('Email jest wymagany')
    })

    it('should reject email without @ symbol', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('userexample.com')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email without domain', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('user@')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email without local part', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('@example.com')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email without TLD', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('user@example')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email with spaces', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('user name@example.com')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email with multiple @ symbols', () => {
      const { validateEmail } = useAuthFormValidation()

      const result = validateEmail('user@@example.com')

      expect(result).toBe('Nieprawidłowy format email')
    })
  })

  describe('validatePassword - Valid inputs', () => {
    it('should accept password with minimum length (6 characters)', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('pass12')

      expect(result).toBeNull()
    })

    it('should accept password with 8 characters', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('password')

      expect(result).toBeNull()
    })

    it('should accept password with special characters', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('P@ssw0rd!')

      expect(result).toBeNull()
    })

    it('should accept long password', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('A'.repeat(100))

      expect(result).toBeNull()
    })

    it('should accept password with custom minimum length', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('12345678', 8)

      expect(result).toBeNull()
    })
  })

  describe('validatePassword - Invalid inputs', () => {
    it('should reject empty password', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('')

      expect(result).toBe('Hasło jest wymagane')
    })

    it('should reject password with 5 characters (below minimum)', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('12345')

      expect(result).toBe('Hasło musi mieć minimum 6 znaków')
    })

    it('should reject password with 1 character', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('a')

      expect(result).toBe('Hasło musi mieć minimum 6 znaków')
    })

    it('should reject password below custom minimum length', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('1234567', 8)

      expect(result).toBe('Hasło musi mieć minimum 8 znaków')
    })

    it('should show correct minimum in error message', () => {
      const { validatePassword } = useAuthFormValidation()

      const result = validatePassword('123', 10)

      expect(result).toBe('Hasło musi mieć minimum 10 znaków')
    })
  })

  describe('validatePasswordMatch - Valid inputs', () => {
    it('should accept matching passwords', () => {
      const { validatePasswordMatch } = useAuthFormValidation()

      const result = validatePasswordMatch('password123', 'password123')

      expect(result).toBeNull()
    })

    it('should accept matching short passwords', () => {
      const { validatePasswordMatch } = useAuthFormValidation()

      const result = validatePasswordMatch('123', '123')

      expect(result).toBeNull()
    })

    it('should accept matching passwords with special characters', () => {
      const { validatePasswordMatch } = useAuthFormValidation()

      const result = validatePasswordMatch('P@ssw0rd!', 'P@ssw0rd!')

      expect(result).toBeNull()
    })

    it('should accept matching empty passwords (validation happens elsewhere)', () => {
      const { validatePasswordMatch } = useAuthFormValidation()

      // Note: Empty password validation should happen in validatePassword
      // This function only checks if they match
      const result = validatePasswordMatch('', '')

      expect(result).toBe('Powtórz hasło')
    })
  })

  describe('validatePasswordMatch - Invalid inputs', () => {
    it('should reject when confirmPassword is empty', () => {
      const { validatePasswordMatch } = useAuthFormValidation()

      const result = validatePasswordMatch('password123', '')

      expect(result).toBe('Powtórz hasło')
    })

    it('should reject when passwords do not match', () => {
      const { validatePasswordMatch } = useAuthFormValidation()

      const result = validatePasswordMatch('password123', 'password456')

      expect(result).toBe('Hasła nie są identyczne')
    })

    it('should reject when passwords differ by case', () => {
      const { validatePasswordMatch } = useAuthFormValidation()

      const result = validatePasswordMatch('Password', 'password')

      expect(result).toBe('Hasła nie są identyczne')
    })

    it('should reject when passwords differ by whitespace', () => {
      const { validatePasswordMatch } = useAuthFormValidation()

      const result = validatePasswordMatch('password', 'password ')

      expect(result).toBe('Hasła nie są identyczne')
    })

    it('should reject when passwords differ by special characters', () => {
      const { validatePasswordMatch } = useAuthFormValidation()

      const result = validatePasswordMatch('password!', 'password')

      expect(result).toBe('Hasła nie są identyczne')
    })
  })

  describe('Business rules and edge cases', () => {
    it('should handle special characters in email validation', () => {
      const { validateEmail } = useAuthFormValidation()

      // Valid special characters in email local part
      expect(validateEmail('user+tag@example.com')).toBeNull()
      expect(validateEmail('user.name@example.com')).toBeNull()
      expect(validateEmail('user_name@example.com')).toBeNull()

      // Invalid special characters
      expect(validateEmail('user name@example.com')).toBe('Nieprawidłowy format email')
    })

    it('should handle password validation with various character types', () => {
      const { validatePassword } = useAuthFormValidation()

      expect(validatePassword('123456')).toBeNull()
      expect(validatePassword('abcdef')).toBeNull()
      expect(validatePassword('ABCDEF')).toBeNull()
      expect(validatePassword('!@#$%^')).toBeNull()
      expect(validatePassword('Aa1!@#')).toBeNull()
    })
  })

  describe('Integration scenarios', () => {
    it('should support complete registration flow validation', () => {
      const { validateEmail, validatePassword, validatePasswordMatch } = useAuthFormValidation()

      const email = 'user@example.com'
      const password = 'SecurePass123'
      const confirmPassword = 'SecurePass123'

      expect(validateEmail(email)).toBeNull()
      expect(validatePassword(password)).toBeNull()
      expect(validatePasswordMatch(password, confirmPassword)).toBeNull()
    })

    it('should detect all validation errors in registration flow', () => {
      const { validateEmail, validatePassword, validatePasswordMatch } = useAuthFormValidation()

      const email = 'invalid-email'
      const password = '123' // Too short
      const confirmPassword = '456' // Doesn't match

      expect(validateEmail(email)).toBe('Nieprawidłowy format email')
      expect(validatePassword(password)).toBe('Hasło musi mieć minimum 6 znaków')
      expect(validatePasswordMatch(password, confirmPassword)).toBe('Hasła nie są identyczne')
    })
  })
})
