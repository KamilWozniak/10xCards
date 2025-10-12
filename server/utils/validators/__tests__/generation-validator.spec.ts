import { describe, it, expect } from 'vitest'
import { validateCreateGenerationRequest } from '../generation-validator'
import { ValidationError } from '../../errors/custom-errors'

describe('validateCreateGenerationRequest', () => {
  describe('Valid inputs', () => {
    it('should accept valid input with exactly 1000 characters', () => {
      const validText = 'A'.repeat(1000)
      const result = validateCreateGenerationRequest({ source_text: validText })

      expect(result).toEqual({ source_text: validText })
    })

    it('should accept valid input with exactly 10000 characters', () => {
      const validText = 'A'.repeat(10000)
      const result = validateCreateGenerationRequest({ source_text: validText })

      expect(result).toEqual({ source_text: validText })
    })

    it('should accept valid input with 5000 characters', () => {
      const validText = 'A'.repeat(5000)
      const result = validateCreateGenerationRequest({ source_text: validText })

      expect(result).toEqual({ source_text: validText })
    })
  })

  describe('Invalid inputs - Missing or invalid body', () => {
    it('should throw ValidationError when body is null', () => {
      expect(() => validateCreateGenerationRequest(null)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(null)).toThrow('Invalid request format')
    })

    it('should throw ValidationError when body is undefined', () => {
      expect(() => validateCreateGenerationRequest(undefined)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(undefined)).toThrow('Invalid request format')
    })

    it('should throw ValidationError when body is not an object', () => {
      expect(() => validateCreateGenerationRequest('string')).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest('string')).toThrow('Invalid request format')
    })
  })

  describe('Invalid inputs - Missing source_text', () => {
    it('should throw ValidationError when source_text is missing', () => {
      expect(() => validateCreateGenerationRequest({})).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest({})).toThrow('Invalid input')
    })

    it('should throw ValidationError when source_text is missing with other fields present', () => {
      expect(() => validateCreateGenerationRequest({ other_field: 'value' })).toThrow(
        ValidationError
      )
    })
  })

  describe('Invalid inputs - Wrong type', () => {
    it('should throw ValidationError when source_text is a number', () => {
      expect(() => validateCreateGenerationRequest({ source_text: 12345 })).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest({ source_text: 12345 })).toThrow('Invalid input')
    })

    it('should throw ValidationError when source_text is an object', () => {
      expect(() => validateCreateGenerationRequest({ source_text: { text: 'value' } })).toThrow(
        ValidationError
      )
    })

    it('should throw ValidationError when source_text is an array', () => {
      expect(() => validateCreateGenerationRequest({ source_text: ['text'] })).toThrow(
        ValidationError
      )
    })

    it('should throw ValidationError when source_text is null', () => {
      expect(() => validateCreateGenerationRequest({ source_text: null })).toThrow(ValidationError)
    })
  })

  describe('Invalid inputs - Length constraints', () => {
    it('should throw ValidationError when source_text is too short (999 characters)', () => {
      const shortText = 'A'.repeat(999)

      expect(() => validateCreateGenerationRequest({ source_text: shortText })).toThrow(
        ValidationError
      )
      expect(() => validateCreateGenerationRequest({ source_text: shortText })).toThrow(
        'Invalid input'
      )
    })

    it('should throw ValidationError when source_text is too short (500 characters)', () => {
      const shortText = 'A'.repeat(500)

      expect(() => validateCreateGenerationRequest({ source_text: shortText })).toThrow(
        ValidationError
      )
      expect(() => validateCreateGenerationRequest({ source_text: shortText })).toThrow(
        'Invalid input'
      )
    })

    it('should throw ValidationError when source_text is empty', () => {
      expect(() => validateCreateGenerationRequest({ source_text: '' })).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest({ source_text: '' })).toThrow('Invalid input')
    })

    it('should throw ValidationError when source_text is too long (10001 characters)', () => {
      const longText = 'A'.repeat(10001)

      expect(() => validateCreateGenerationRequest({ source_text: longText })).toThrow(
        ValidationError
      )
      expect(() => validateCreateGenerationRequest({ source_text: longText })).toThrow(
        'Invalid input'
      )
    })

    it('should throw ValidationError when source_text is too long (15000 characters)', () => {
      const longText = 'A'.repeat(15000)

      expect(() => validateCreateGenerationRequest({ source_text: longText })).toThrow(
        ValidationError
      )
      expect(() => validateCreateGenerationRequest({ source_text: longText })).toThrow(
        'Invalid input'
      )
    })
  })

  describe('Error details', () => {
    it('should include detailed error message for too short text', () => {
      const shortText = 'A'.repeat(500)

      try {
        validateCreateGenerationRequest({ source_text: shortText })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        if (error instanceof ValidationError) {
          expect(error.message).toBe('Invalid input')
          expect(error.details).toContain('source_text must be between 1000 and 10000 characters')
          expect(error.details).toContain('Received: 500 characters')
          expect(error.statusCode).toBe(400)
        }
      }
    })

    it('should include detailed error message for too long text', () => {
      const longText = 'A'.repeat(10001)

      try {
        validateCreateGenerationRequest({ source_text: longText })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        if (error instanceof ValidationError) {
          expect(error.message).toBe('Invalid input')
          expect(error.details).toContain('source_text must be between 1000 and 10000 characters')
          expect(error.details).toContain('Received: 10001 characters')
          expect(error.statusCode).toBe(400)
        }
      }
    })
  })
})
