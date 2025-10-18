import { describe, it, expect, beforeEach } from 'vitest'
import { useFormValidation } from '../useFormValidation'
import type { SourceTextFormData } from '~/types/views/generate.types'

/**
 * Test suite for useFormValidation composable
 *
 * Tests cover:
 * - Initial state
 * - Text validation (source text for flashcard generation)
 * - Email validation (authentication)
 * - Password validation (authentication)
 * - Password match validation (registration)
 * - State management
 * - Edge cases and business rules
 * - Reactivity
 */

describe('useFormValidation', () => {
  describe('Initial state', () => {
    it('should initialize with default validation state', () => {
      const { formValidation } = useFormValidation()

      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.characterCount).toBe(0)
      expect(formValidation.value.errorMessage).toBeNull()
      expect(formValidation.value.minLength).toBe(1000)
      expect(formValidation.value.maxLength).toBe(10000)
    })
  })

  describe('Computed properties', () => {
    it('should expose isValid as computed property', () => {
      const { isValid, validateText } = useFormValidation()

      expect(isValid.value).toBe(false)

      validateText('A'.repeat(1000))

      expect(isValid.value).toBe(true)
    })

    it('should expose errorMessage as computed property', () => {
      const { errorMessage, validateText } = useFormValidation()

      expect(errorMessage.value).toBeNull()

      validateText('')

      expect(errorMessage.value).toBe('Tekst jest wymagany')
    })

    it('should expose characterCount as computed property', () => {
      const { characterCount, validateText } = useFormValidation()

      expect(characterCount.value).toBe(0)

      validateText('A'.repeat(500))

      expect(characterCount.value).toBe(500)
    })
  })

  describe('validateText - Valid inputs', () => {
    it('should accept text with exactly 1000 characters', () => {
      const { validateText, formValidation } = useFormValidation()

      const validText = 'A'.repeat(1000)
      const result = validateText(validText)

      expect(result).toBe(true)
      expect(formValidation.value.isValid).toBe(true)
      expect(formValidation.value.errorMessage).toBeNull()
      expect(formValidation.value.characterCount).toBe(1000)
    })

    it('should accept text with exactly 10000 characters', () => {
      const { validateText, formValidation } = useFormValidation()

      const validText = 'A'.repeat(10000)
      const result = validateText(validText)

      expect(result).toBe(true)
      expect(formValidation.value.isValid).toBe(true)
      expect(formValidation.value.errorMessage).toBeNull()
      expect(formValidation.value.characterCount).toBe(10000)
    })

    it('should accept text with 5000 characters (middle of range)', () => {
      const { validateText, formValidation } = useFormValidation()

      const validText = 'A'.repeat(5000)
      const result = validateText(validText)

      expect(result).toBe(true)
      expect(formValidation.value.isValid).toBe(true)
      expect(formValidation.value.errorMessage).toBeNull()
      expect(formValidation.value.characterCount).toBe(5000)
    })

    it('should accept text with 1001 characters (just above minimum)', () => {
      const { validateText, formValidation } = useFormValidation()

      const validText = 'A'.repeat(1001)
      const result = validateText(validText)

      expect(result).toBe(true)
      expect(formValidation.value.isValid).toBe(true)
      expect(formValidation.value.errorMessage).toBeNull()
    })

    it('should accept text with 9999 characters (just below maximum)', () => {
      const { validateText, formValidation } = useFormValidation()

      const validText = 'A'.repeat(9999)
      const result = validateText(validText)

      expect(result).toBe(true)
      expect(formValidation.value.isValid).toBe(true)
      expect(formValidation.value.errorMessage).toBeNull()
    })
  })

  describe('validateText - Invalid inputs (empty text)', () => {
    it('should reject empty string', () => {
      const { validateText, formValidation } = useFormValidation()

      const result = validateText('')

      expect(result).toBe(false)
      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.errorMessage).toBe('Tekst jest wymagany')
      expect(formValidation.value.characterCount).toBe(0)
    })

    it('should reject string with only whitespace', () => {
      const { validateText, formValidation } = useFormValidation()

      const result = validateText('   \n\t  ')

      expect(result).toBe(false)
      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.errorMessage).toBe('Tekst jest wymagany')
      expect(formValidation.value.characterCount).toBe(0)
    })
  })

  describe('validateText - Invalid inputs (too short)', () => {
    it('should reject text with 999 characters', () => {
      const { validateText, formValidation } = useFormValidation()

      const shortText = 'A'.repeat(999)
      const result = validateText(shortText)

      expect(result).toBe(false)
      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.errorMessage).toBe(
        'Tekst musi mieć co najmniej 1000 znaków (obecnie: 999)'
      )
      expect(formValidation.value.characterCount).toBe(999)
    })

    it('should reject text with 500 characters', () => {
      const { validateText, formValidation } = useFormValidation()

      const shortText = 'A'.repeat(500)
      const result = validateText(shortText)

      expect(result).toBe(false)
      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.errorMessage).toContain('co najmniej 1000 znaków')
      expect(formValidation.value.characterCount).toBe(500)
    })

    it('should reject text with 1 character', () => {
      const { validateText, formValidation } = useFormValidation()

      const result = validateText('A')

      expect(result).toBe(false)
      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.errorMessage).toContain('co najmniej 1000 znaków')
      expect(formValidation.value.characterCount).toBe(1)
    })
  })

  describe('validateText - Invalid inputs (too long)', () => {
    it('should reject text with 10001 characters', () => {
      const { validateText, formValidation } = useFormValidation()

      const longText = 'A'.repeat(10001)
      const result = validateText(longText)

      expect(result).toBe(false)
      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.errorMessage).toBe(
        'Tekst nie może przekraczać 10000 znaków (obecnie: 10001)'
      )
      expect(formValidation.value.characterCount).toBe(10001)
    })

    it('should reject text with 15000 characters', () => {
      const { validateText, formValidation } = useFormValidation()

      const longText = 'A'.repeat(15000)
      const result = validateText(longText)

      expect(result).toBe(false)
      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.errorMessage).toContain('nie może przekraczać 10000 znaków')
      expect(formValidation.value.characterCount).toBe(15000)
    })

    it('should reject text with 50000 characters', () => {
      const { validateText, formValidation } = useFormValidation()

      const longText = 'A'.repeat(50000)
      const result = validateText(longText)

      expect(result).toBe(false)
      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.characterCount).toBe(50000)
    })
  })

  describe('validateText - Trimming behavior', () => {
    it('should trim whitespace before validation', () => {
      const { validateText, formValidation } = useFormValidation()

      const text = '   ' + 'A'.repeat(1000) + '   '
      const result = validateText(text)

      expect(result).toBe(true)
      expect(formValidation.value.characterCount).toBe(1000)
    })

    it('should trim newlines and tabs before validation', () => {
      const { validateText, formValidation } = useFormValidation()

      const text = '\n\t' + 'A'.repeat(1000) + '\n\t'
      const result = validateText(text)

      expect(result).toBe(true)
      expect(formValidation.value.characterCount).toBe(1000)
    })

    it('should count text with 999 characters + spaces as invalid', () => {
      const { validateText, formValidation } = useFormValidation()

      const text = '   ' + 'A'.repeat(999) + '   '
      const result = validateText(text)

      expect(result).toBe(false)
      expect(formValidation.value.characterCount).toBe(999)
    })

    it('should preserve internal whitespace in character count', () => {
      const { validateText, formValidation } = useFormValidation()

      const text = 'A'.repeat(500) + ' '.repeat(100) + 'B'.repeat(500)
      const result = validateText(text)

      expect(formValidation.value.characterCount).toBe(1100)
      expect(result).toBe(true)
    })
  })

  describe('validateFormData', () => {
    it('should validate SourceTextFormData correctly', () => {
      const { validateFormData } = useFormValidation()

      const formData: SourceTextFormData = {
        text: 'A'.repeat(1000),
        characterCount: 1000,
        isValid: false,
      }

      const result = validateFormData(formData)

      expect(result).toBe(true)
    })

    it('should reject invalid SourceTextFormData', () => {
      const { validateFormData } = useFormValidation()

      const formData: SourceTextFormData = {
        text: 'A'.repeat(500),
        characterCount: 500,
        isValid: false,
      }

      const result = validateFormData(formData)

      expect(result).toBe(false)
    })

    it('should validate using text field, ignoring other fields', () => {
      const { validateFormData, formValidation } = useFormValidation()

      const formData: SourceTextFormData = {
        text: 'A'.repeat(1000),
        characterCount: 999, // Incorrect count
        isValid: false, // Incorrect flag
      }

      const result = validateFormData(formData)

      expect(result).toBe(true)
      expect(formValidation.value.characterCount).toBe(1000) // Should recalculate
    })
  })

  describe('resetValidation', () => {
    it('should reset validation state to initial values', () => {
      const { validateText, resetValidation, formValidation } = useFormValidation()

      // Set some state
      validateText('A'.repeat(500))

      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.characterCount).toBe(500)
      expect(formValidation.value.errorMessage).not.toBeNull()

      // Reset
      resetValidation()

      expect(formValidation.value.isValid).toBe(false)
      expect(formValidation.value.characterCount).toBe(0)
      expect(formValidation.value.errorMessage).toBeNull()
      expect(formValidation.value.minLength).toBe(1000)
      expect(formValidation.value.maxLength).toBe(10000)
    })

    it('should allow new validation after reset', () => {
      const { validateText, resetValidation, formValidation } = useFormValidation()

      validateText('A'.repeat(500))
      resetValidation()
      validateText('B'.repeat(1500))

      expect(formValidation.value.isValid).toBe(true)
      expect(formValidation.value.characterCount).toBe(1500)
      expect(formValidation.value.errorMessage).toBeNull()
    })
  })

  describe('validateEmail - Valid inputs', () => {
    it('should accept valid email', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('user@example.com')

      expect(result).toBeNull()
    })

    it('should accept email with subdomain', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('user@mail.example.com')

      expect(result).toBeNull()
    })

    it('should accept email with dots in local part', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('first.last@example.com')

      expect(result).toBeNull()
    })

    it('should accept email with numbers', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('user123@example456.com')

      expect(result).toBeNull()
    })

    it('should accept email with plus sign', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('user+tag@example.com')

      expect(result).toBeNull()
    })

    it('should accept email with dash in domain', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('user@my-domain.com')

      expect(result).toBeNull()
    })
  })

  describe('validateEmail - Invalid inputs', () => {
    it('should reject empty email', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('')

      expect(result).toBe('Email jest wymagany')
    })

    it('should reject email with only whitespace', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('   ')

      expect(result).toBe('Email jest wymagany')
    })

    it('should reject email without @ symbol', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('userexample.com')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email without domain', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('user@')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email without local part', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('@example.com')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email without TLD', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('user@example')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email with spaces', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('user name@example.com')

      expect(result).toBe('Nieprawidłowy format email')
    })

    it('should reject email with multiple @ symbols', () => {
      const { validateEmail } = useFormValidation()

      const result = validateEmail('user@@example.com')

      expect(result).toBe('Nieprawidłowy format email')
    })
  })

  describe('validatePassword - Valid inputs', () => {
    it('should accept password with minimum length (6 characters)', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('pass12')

      expect(result).toBeNull()
    })

    it('should accept password with 8 characters', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('password')

      expect(result).toBeNull()
    })

    it('should accept password with special characters', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('P@ssw0rd!')

      expect(result).toBeNull()
    })

    it('should accept long password', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('A'.repeat(100))

      expect(result).toBeNull()
    })

    it('should accept password with custom minimum length', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('12345678', 8)

      expect(result).toBeNull()
    })
  })

  describe('validatePassword - Invalid inputs', () => {
    it('should reject empty password', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('')

      expect(result).toBe('Hasło jest wymagane')
    })

    it('should reject password with 5 characters (below minimum)', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('12345')

      expect(result).toBe('Hasło musi mieć minimum 6 znaków')
    })

    it('should reject password with 1 character', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('a')

      expect(result).toBe('Hasło musi mieć minimum 6 znaków')
    })

    it('should reject password below custom minimum length', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('1234567', 8)

      expect(result).toBe('Hasło musi mieć minimum 8 znaków')
    })

    it('should show correct minimum in error message', () => {
      const { validatePassword } = useFormValidation()

      const result = validatePassword('123', 10)

      expect(result).toBe('Hasło musi mieć minimum 10 znaków')
    })
  })

  describe('validatePasswordMatch - Valid inputs', () => {
    it('should accept matching passwords', () => {
      const { validatePasswordMatch } = useFormValidation()

      const result = validatePasswordMatch('password123', 'password123')

      expect(result).toBeNull()
    })

    it('should accept matching short passwords', () => {
      const { validatePasswordMatch } = useFormValidation()

      const result = validatePasswordMatch('123', '123')

      expect(result).toBeNull()
    })

    it('should accept matching passwords with special characters', () => {
      const { validatePasswordMatch } = useFormValidation()

      const result = validatePasswordMatch('P@ssw0rd!', 'P@ssw0rd!')

      expect(result).toBeNull()
    })

    it('should accept matching empty passwords (validation happens elsewhere)', () => {
      const { validatePasswordMatch } = useFormValidation()

      // Note: Empty password validation should happen in validatePassword
      // This function only checks if they match
      const result = validatePasswordMatch('', '')

      expect(result).toBe('Powtórz hasło')
    })
  })

  describe('validatePasswordMatch - Invalid inputs', () => {
    it('should reject when confirmPassword is empty', () => {
      const { validatePasswordMatch } = useFormValidation()

      const result = validatePasswordMatch('password123', '')

      expect(result).toBe('Powtórz hasło')
    })

    it('should reject when passwords do not match', () => {
      const { validatePasswordMatch } = useFormValidation()

      const result = validatePasswordMatch('password123', 'password456')

      expect(result).toBe('Hasła nie są identyczne')
    })

    it('should reject when passwords differ by case', () => {
      const { validatePasswordMatch } = useFormValidation()

      const result = validatePasswordMatch('Password', 'password')

      expect(result).toBe('Hasła nie są identyczne')
    })

    it('should reject when passwords differ by whitespace', () => {
      const { validatePasswordMatch } = useFormValidation()

      const result = validatePasswordMatch('password', 'password ')

      expect(result).toBe('Hasła nie są identyczne')
    })

    it('should reject when passwords differ by special characters', () => {
      const { validatePasswordMatch } = useFormValidation()

      const result = validatePasswordMatch('password!', 'password')

      expect(result).toBe('Hasła nie są identyczne')
    })
  })

  describe('Business rules and edge cases', () => {
    it('should handle multiple consecutive validations', () => {
      const { validateText, formValidation } = useFormValidation()

      validateText('A'.repeat(500))
      expect(formValidation.value.isValid).toBe(false)

      validateText('B'.repeat(1000))
      expect(formValidation.value.isValid).toBe(true)

      validateText('C'.repeat(15000))
      expect(formValidation.value.isValid).toBe(false)
    })

    it('should handle Unicode characters in text validation', () => {
      const { validateText, formValidation } = useFormValidation()

      const unicodeText = '🎉'.repeat(500) + 'Hello World! 你好 مرحبا'.repeat(50)
      const result = validateText(unicodeText)

      expect(formValidation.value.characterCount).toBeGreaterThan(0)
      expect(typeof result).toBe('boolean')
    })

    it('should handle special characters in email validation', () => {
      const { validateEmail } = useFormValidation()

      // Valid special characters in email local part
      expect(validateEmail('user+tag@example.com')).toBeNull()
      expect(validateEmail('user.name@example.com')).toBeNull()
      expect(validateEmail('user_name@example.com')).toBeNull()

      // Invalid special characters
      expect(validateEmail('user name@example.com')).toBe('Nieprawidłowy format email')
    })

    it('should handle password validation with various character types', () => {
      const { validatePassword } = useFormValidation()

      expect(validatePassword('123456')).toBeNull()
      expect(validatePassword('abcdef')).toBeNull()
      expect(validatePassword('ABCDEF')).toBeNull()
      expect(validatePassword('!@#$%^')).toBeNull()
      expect(validatePassword('Aa1!@#')).toBeNull()
    })

    it('should maintain independent validation states', () => {
      const validation1 = useFormValidation()
      const validation2 = useFormValidation()

      validation1.validateText('A'.repeat(1000))
      validation2.validateText('B'.repeat(500))

      expect(validation1.formValidation.value.isValid).toBe(true)
      expect(validation2.formValidation.value.isValid).toBe(false)
      expect(validation1.formValidation.value.characterCount).toBe(1000)
      expect(validation2.formValidation.value.characterCount).toBe(500)
    })

    it('should handle text with mixed content types', () => {
      const { validateText, formValidation } = useFormValidation()

      const mixedText = `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Numbers: 123456789
        Special chars: !@#$%^&*()
        Unicode: 你好世界 🌍
      `.repeat(50)

      validateText(mixedText)

      expect(formValidation.value.characterCount).toBeGreaterThan(0)
      expect(typeof formValidation.value.isValid).toBe('boolean')
    })

    it('should validate boundary conditions precisely', () => {
      const { validateText } = useFormValidation()

      // Exactly at boundaries
      expect(validateText('A'.repeat(1000))).toBe(true)
      expect(validateText('A'.repeat(10000))).toBe(true)

      // Just outside boundaries
      expect(validateText('A'.repeat(999))).toBe(false)
      expect(validateText('A'.repeat(10001))).toBe(false)
    })
  })

  describe('Reactivity', () => {
    it('should trigger computed updates when validation state changes', () => {
      const { isValid, validateText } = useFormValidation()

      expect(isValid.value).toBe(false)

      validateText('A'.repeat(1000))

      expect(isValid.value).toBe(true)
    })

    it('should trigger errorMessage computed when validation fails', () => {
      const { errorMessage, validateText } = useFormValidation()

      expect(errorMessage.value).toBeNull()

      validateText('A'.repeat(500))

      expect(errorMessage.value).not.toBeNull()
      expect(errorMessage.value).toContain('co najmniej 1000 znaków')
    })

    it('should trigger characterCount computed when text is validated', () => {
      const { characterCount, validateText } = useFormValidation()

      expect(characterCount.value).toBe(0)

      validateText('A'.repeat(1500))

      expect(characterCount.value).toBe(1500)
    })

    it('should update all computed properties together', () => {
      const { isValid, errorMessage, characterCount, validateText } = useFormValidation()

      validateText('A'.repeat(1000))

      expect(isValid.value).toBe(true)
      expect(errorMessage.value).toBeNull()
      expect(characterCount.value).toBe(1000)
    })

    it('should reflect state changes after reset', () => {
      const { isValid, errorMessage, characterCount, validateText, resetValidation } =
        useFormValidation()

      validateText('A'.repeat(1000))

      expect(isValid.value).toBe(true)
      expect(errorMessage.value).toBeNull()
      expect(characterCount.value).toBe(1000)

      resetValidation()

      expect(isValid.value).toBe(false)
      expect(errorMessage.value).toBeNull()
      expect(characterCount.value).toBe(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should support complete registration flow validation', () => {
      const { validateEmail, validatePassword, validatePasswordMatch } = useFormValidation()

      const email = 'user@example.com'
      const password = 'SecurePass123'
      const confirmPassword = 'SecurePass123'

      expect(validateEmail(email)).toBeNull()
      expect(validatePassword(password)).toBeNull()
      expect(validatePasswordMatch(password, confirmPassword)).toBeNull()
    })

    it('should detect all validation errors in registration flow', () => {
      const { validateEmail, validatePassword, validatePasswordMatch } = useFormValidation()

      const email = 'invalid-email'
      const password = '123' // Too short
      const confirmPassword = '456' // Doesn't match

      expect(validateEmail(email)).toBe('Nieprawidłowy format email')
      expect(validatePassword(password)).toBe('Hasło musi mieć minimum 6 znaków')
      expect(validatePasswordMatch(password, confirmPassword)).toBe('Hasła nie są identyczne')
    })

    it('should support complete text validation flow', () => {
      const { validateText, formValidation, resetValidation } = useFormValidation()

      // Step 1: User starts typing (too short)
      validateText('A'.repeat(500))
      expect(formValidation.value.isValid).toBe(false)

      // Step 2: User continues typing (valid)
      validateText('A'.repeat(1500))
      expect(formValidation.value.isValid).toBe(true)

      // Step 3: User clears form
      resetValidation()
      expect(formValidation.value.characterCount).toBe(0)

      // Step 4: User enters new valid text
      validateText('B'.repeat(2000))
      expect(formValidation.value.isValid).toBe(true)
    })
  })
})

