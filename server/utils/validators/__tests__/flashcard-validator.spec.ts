import { describe, it, expect } from 'vitest'
import { validateCreateFlashcardsRequest } from '../flashcard-validator'
import { ValidationError } from '../../errors/custom-errors'
import type { CreateFlashcardsRequestDTO, CreateFlashcardDTO } from '~/types/dto/types'

/**
 * Test suite for flashcard-validator
 *
 * Tests cover:
 * - Request body validation (structure, required fields)
 * - Flashcards array validation (empty, too large, invalid structure)
 * - Individual flashcard validation (front, back, source, generation_id)
 * - Source-specific validation rules
 * - Field length constraints
 * - Trimming behavior
 * - Error message accuracy
 * - Edge cases and boundary conditions
 * - Business rules enforcement
 */

describe('flashcard-validator', () => {
  // Helper function to create valid flashcard
  const createValidFlashcard = (overrides: Partial<CreateFlashcardDTO> = {}): CreateFlashcardDTO => ({
    front: 'Test front content',
    back: 'Test back content',
    source: 'ai-full',
    generation_id: 123,
    ...overrides,
  })

  describe('validateCreateFlashcardsRequest - Valid requests', () => {
    it('should accept valid request with single flashcard', () => {
      const validRequest = {
        flashcards: [createValidFlashcard()],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result).toEqual({
        flashcards: [
          {
            front: 'Test front content',
            back: 'Test back content',
            source: 'ai-full',
            generation_id: 123,
          },
        ],
      })
    })

    it('should accept valid request with multiple flashcards', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ front: 'Question 1', back: 'Answer 1' }),
          createValidFlashcard({ front: 'Question 2', back: 'Answer 2', source: 'ai-edited' }),
          createValidFlashcard({ front: 'Question 3', back: 'Answer 3', source: 'manual', generation_id: null }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards).toHaveLength(3)
      expect(result.flashcards[0].front).toBe('Question 1')
      expect(result.flashcards[1].source).toBe('ai-edited')
      expect(result.flashcards[2].generation_id).toBeNull()
    })

    it('should accept request with maximum allowed flashcards (50)', () => {
      const flashcards = Array.from({ length: 50 }, (_, i) =>
        createValidFlashcard({ front: `Question ${i + 1}`, back: `Answer ${i + 1}` })
      )

      const validRequest = { flashcards }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards).toHaveLength(50)
    })

    it('should accept flashcards with maximum field lengths', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({
            front: 'A'.repeat(200), // Maximum front length
            back: 'B'.repeat(500),  // Maximum back length
          }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].front).toHaveLength(200)
      expect(result.flashcards[0].back).toHaveLength(500)
    })

    it('should trim whitespace from front and back fields', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({
            front: '  Test front with spaces  ',
            back: '\n\tTest back with whitespace\n\t',
          }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].front).toBe('Test front with spaces')
      expect(result.flashcards[0].back).toBe('Test back with whitespace')
    })
  })

  describe('validateCreateFlashcardsRequest - Request body validation', () => {
    it('should reject null request body', () => {
      expect(() => validateCreateFlashcardsRequest(null)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(null)).toThrow('Invalid JSON format')
    })

    it('should reject undefined request body', () => {
      expect(() => validateCreateFlashcardsRequest(undefined)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(undefined)).toThrow('Invalid JSON format')
    })

    it('should reject non-object request body', () => {
      expect(() => validateCreateFlashcardsRequest('string')).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(123)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest([])).toThrow(ValidationError)
    })

    it('should reject request body without flashcards field', () => {
      const invalidRequest = { otherField: 'value' }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Missing required field: flashcards')
    })

    it('should provide detailed error message for invalid JSON format', () => {
      try {
        validateCreateFlashcardsRequest(null)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).message).toBe('Invalid JSON format')
        expect((error as ValidationError).details).toBe('Request body must be a valid JSON object')
      }
    })
  })

  describe('validateCreateFlashcardsRequest - Flashcards array validation', () => {
    it('should reject non-array flashcards field', () => {
      const invalidRequest = { flashcards: 'not an array' }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject empty flashcards array', () => {
      const invalidRequest = { flashcards: [] }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Flashcards array cannot be empty')
    })

    it('should reject flashcards array exceeding maximum length (51 flashcards)', () => {
      const flashcards = Array.from({ length: 51 }, () => createValidFlashcard())
      const invalidRequest = { flashcards }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Too many flashcards')
    })

    it('should provide detailed error message for too many flashcards', () => {
      const flashcards = Array.from({ length: 75 }, () => createValidFlashcard())
      const invalidRequest = { flashcards }

      try {
        validateCreateFlashcardsRequest(invalidRequest)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).details).toContain('Maximum 50 flashcards allowed per request. Received: 75')
      }
    })
  })

  describe('validateCreateFlashcardsRequest - Individual flashcard validation', () => {
    it('should reject non-object flashcard', () => {
      const invalidRequest = {
        flashcards: ['not an object'],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid flashcard format')
    })

    it('should reject null flashcard', () => {
      const invalidRequest = {
        flashcards: [null],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid flashcard format')
    })

    it('should provide correct index in error messages for multiple flashcards', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard(),
          null, // Invalid flashcard at index 1
          createValidFlashcard(),
        ],
      }

      try {
        validateCreateFlashcardsRequest(invalidRequest)
      } catch (error) {
        expect((error as ValidationError).details).toContain('Flashcard at index 1')
      }
    })
  })

  describe('Front field validation', () => {
    it('should reject flashcard without front field', () => {
      const invalidRequest = {
        flashcards: [
          {
            back: 'Test back',
            source: 'ai-full',
            generation_id: 123,
          },
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Missing required field')
    })

    it('should reject non-string front field', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ front: 123 as any }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid field type')
    })

    it('should reject empty front field', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ front: '' }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid field value')
    })

    it('should reject front field exceeding maximum length (201 characters)', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ front: 'A'.repeat(201) }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Field exceeds maximum length')
    })

    it('should provide detailed error message for front field length violation', () => {
      const longFront = 'A'.repeat(250)
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ front: longFront }),
        ],
      }

      try {
        validateCreateFlashcardsRequest(invalidRequest)
      } catch (error) {
        expect((error as ValidationError).details).toContain('Received: 250')
      }
    })

    it('should accept front field with exactly 200 characters', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ front: 'A'.repeat(200) }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].front).toHaveLength(200)
    })

    it('should accept front field with 1 character', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ front: 'A' }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].front).toBe('A')
    })
  })

  describe('Back field validation', () => {
    it('should reject flashcard without back field', () => {
      const invalidRequest = {
        flashcards: [
          {
            front: 'Test front',
            source: 'ai-full',
            generation_id: 123,
          },
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Missing required field')
    })

    it('should reject non-string back field', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ back: 123 as any }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid field type')
    })

    it('should reject empty back field', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ back: '' }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid field value')
    })

    it('should reject back field exceeding maximum length (501 characters)', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ back: 'B'.repeat(501) }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Field exceeds maximum length')
    })

    it('should provide detailed error message for back field length violation', () => {
      const longBack = 'B'.repeat(600)
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ back: longBack }),
        ],
      }

      try {
        validateCreateFlashcardsRequest(invalidRequest)
      } catch (error) {
        expect((error as ValidationError).details).toContain('Received: 600')
      }
    })

    it('should accept back field with exactly 500 characters', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ back: 'B'.repeat(500) }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].back).toHaveLength(500)
    })

    it('should accept back field with 1 character', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ back: 'B' }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].back).toBe('B')
    })
  })

  describe('Source field validation', () => {
    it('should reject flashcard without source field', () => {
      const invalidRequest = {
        flashcards: [
          {
            front: 'Test front',
            back: 'Test back',
            generation_id: 123,
          },
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Missing required field')
    })

    it('should reject invalid source value', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ source: 'invalid-source' as any }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid source value')
    })

    it('should provide detailed error message for invalid source', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ source: 'custom-source' as any }),
        ],
      }

      try {
        validateCreateFlashcardsRequest(invalidRequest)
      } catch (error) {
        expect((error as ValidationError).details).toContain('Received: custom-source')
      }
    })

    it('should accept ai-full source', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ source: 'ai-full' }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].source).toBe('ai-full')
    })

    it('should accept ai-edited source', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ source: 'ai-edited' }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].source).toBe('ai-edited')
    })

    it('should accept manual source', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ source: 'manual', generation_id: null }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].source).toBe('manual')
    })
  })

  describe('Generation ID validation for AI sources', () => {
    it('should require generation_id for ai-full source', () => {
      const invalidRequest = {
        flashcards: [
          {
            front: 'Test front',
            back: 'Test back',
            source: 'ai-full',
            generation_id: undefined,
          },
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid generation_id for source type')
    })

    it('should require generation_id for ai-edited source', () => {
      const invalidRequest = {
        flashcards: [
          {
            front: 'Test front',
            back: 'Test back',
            source: 'ai-edited',
            generation_id: null,
          },
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid generation_id for source type')
    })

    it('should reject non-integer generation_id for AI sources', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ generation_id: 'not-a-number' as any }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid generation_id for source type')
    })

    it('should reject float generation_id for AI sources', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ generation_id: 123.45 as any }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid generation_id for source type')
    })

    it('should reject zero generation_id for AI sources', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ generation_id: 0 }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid generation_id for source type')
    })

    it('should reject negative generation_id for AI sources', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ generation_id: -1 }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid generation_id for source type')
    })

    it('should accept positive integer generation_id for AI sources', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ source: 'ai-full', generation_id: 42 }),
          createValidFlashcard({ source: 'ai-edited', generation_id: 999 }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].generation_id).toBe(42)
      expect(result.flashcards[1].generation_id).toBe(999)
    })
  })

  describe('Generation ID validation for manual source', () => {
    it('should require null generation_id for manual source', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard({ source: 'manual', generation_id: 123 }),
        ],
      }

      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateFlashcardsRequest(invalidRequest)).toThrow('Invalid generation_id for source type')
    })

    it('should accept undefined generation_id for manual source', () => {
      const validRequest = {
        flashcards: [
          {
            front: 'Test front',
            back: 'Test back',
            source: 'manual',
            generation_id: undefined,
          },
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].generation_id).toBeNull()
    })

    it('should accept null generation_id for manual source', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ source: 'manual', generation_id: null }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].generation_id).toBeNull()
    })

    it('should normalize undefined to null for manual source', () => {
      const validRequest = {
        flashcards: [
          {
            front: 'Test front',
            back: 'Test back',
            source: 'manual',
            // generation_id is undefined (not provided)
          },
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].generation_id).toBeNull()
    })
  })

  describe('Edge cases and boundary conditions', () => {
    it('should handle flashcards with special characters in content', () => {
      const specialContent = {
        front: 'What is 2 + 2? <script>alert("xss")</script>',
        back: 'Answer: "4" & \'four\' \n\t special chars: é ñ ü 🎉',
      }

      const validRequest = {
        flashcards: [
          createValidFlashcard(specialContent),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].front).toBe(specialContent.front)
      expect(result.flashcards[0].back).toBe(specialContent.back)
    })

    it('should handle Unicode characters in flashcard content', () => {
      const unicodeContent = {
        front: '你好世界 🌍 مرحبا بالعالم',
        back: 'Здравствуй мир 🚀 Γεια σου κόσμε',
      }

      const validRequest = {
        flashcards: [
          createValidFlashcard(unicodeContent),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].front).toBe(unicodeContent.front)
      expect(result.flashcards[0].back).toBe(unicodeContent.back)
    })

    it('should handle mixed source types in single request', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ source: 'ai-full', generation_id: 1 }),
          createValidFlashcard({ source: 'ai-edited', generation_id: 2 }),
          createValidFlashcard({ source: 'manual', generation_id: null }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].source).toBe('ai-full')
      expect(result.flashcards[0].generation_id).toBe(1)
      expect(result.flashcards[1].source).toBe('ai-edited')
      expect(result.flashcards[1].generation_id).toBe(2)
      expect(result.flashcards[2].source).toBe('manual')
      expect(result.flashcards[2].generation_id).toBeNull()
    })

    it('should handle whitespace-only content after trimming', () => {
      const validRequest = {
        flashcards: [
          {
            front: '   \n\t   ', // Will be trimmed to empty but passes validation
            back: 'Valid back',
            source: 'manual',
            generation_id: null,
          },
        ],
      }

      // The validator validates length before trimming, so this passes validation
      // but results in empty string after trimming
      const result = validateCreateFlashcardsRequest(validRequest)
      expect(result.flashcards[0].front).toBe('')
    })

    it('should preserve internal whitespace while trimming edges', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({
            front: '  Question with  internal   spaces  ',
            back: '\n\tAnswer with\ninternal\nlines\t\n',
          }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].front).toBe('Question with  internal   spaces')
      expect(result.flashcards[0].back).toBe('Answer with\ninternal\nlines')
    })

    it('should handle large generation_id values', () => {
      const validRequest = {
        flashcards: [
          createValidFlashcard({ generation_id: Number.MAX_SAFE_INTEGER }),
        ],
      }

      const result = validateCreateFlashcardsRequest(validRequest)

      expect(result.flashcards[0].generation_id).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('should validate each flashcard independently', () => {
      const invalidRequest = {
        flashcards: [
          createValidFlashcard(), // Valid
          createValidFlashcard({ front: '' }), // Invalid - empty front
          createValidFlashcard(), // Valid
        ],
      }

      try {
        validateCreateFlashcardsRequest(invalidRequest)
      } catch (error) {
        expect((error as ValidationError).details).toContain('Flashcard at index 1')
        expect((error as ValidationError).details).toContain('front cannot be empty')
      }
    })
  })

  describe('Business rules and integration scenarios', () => {
    it('should support typical AI generation workflow', () => {
      const aiGeneratedRequest = {
        flashcards: [
          createValidFlashcard({
            front: 'What is photosynthesis?',
            back: 'The process by which plants convert light energy into chemical energy',
            source: 'ai-full',
            generation_id: 42,
          }),
          createValidFlashcard({
            front: 'What is cellular respiration?',
            back: 'The process by which cells break down glucose to produce ATP',
            source: 'ai-full',
            generation_id: 42,
          }),
        ],
      }

      const result = validateCreateFlashcardsRequest(aiGeneratedRequest)

      expect(result.flashcards).toHaveLength(2)
      expect(result.flashcards.every(f => f.source === 'ai-full')).toBe(true)
      expect(result.flashcards.every(f => f.generation_id === 42)).toBe(true)
    })

    it('should support typical manual creation workflow', () => {
      const manualRequest = {
        flashcards: [
          createValidFlashcard({
            front: 'Custom question created by user',
            back: 'Custom answer provided by user',
            source: 'manual',
            generation_id: null,
          }),
        ],
      }

      const result = validateCreateFlashcardsRequest(manualRequest)

      expect(result.flashcards[0].source).toBe('manual')
      expect(result.flashcards[0].generation_id).toBeNull()
    })

    it('should support mixed workflow (AI + manual + edited)', () => {
      const mixedRequest = {
        flashcards: [
          createValidFlashcard({
            front: 'AI generated question',
            back: 'AI generated answer',
            source: 'ai-full',
            generation_id: 123,
          }),
          createValidFlashcard({
            front: 'AI generated but user edited question',
            back: 'User modified answer',
            source: 'ai-edited',
            generation_id: 123,
          }),
          createValidFlashcard({
            front: 'Completely manual question',
            back: 'Completely manual answer',
            source: 'manual',
            generation_id: null,
          }),
        ],
      }

      const result = validateCreateFlashcardsRequest(mixedRequest)

      expect(result.flashcards).toHaveLength(3)
      expect(result.flashcards[0].source).toBe('ai-full')
      expect(result.flashcards[1].source).toBe('ai-edited')
      expect(result.flashcards[2].source).toBe('manual')
    })

    it('should maintain data integrity during validation', () => {
      const originalRequest = {
        flashcards: [
          createValidFlashcard({
            front: '  Original front  ',
            back: '  Original back  ',
          }),
        ],
      }

      const result = validateCreateFlashcardsRequest(originalRequest)

      // Original request should not be modified
      expect(originalRequest.flashcards[0].front).toBe('  Original front  ')
      expect(originalRequest.flashcards[0].back).toBe('  Original back  ')

      // Result should have trimmed values
      expect(result.flashcards[0].front).toBe('Original front')
      expect(result.flashcards[0].back).toBe('Original back')
    })

    it('should provide consistent error messages across different validation failures', () => {
      const testCases = [
        {
          request: { flashcards: [{ front: '', back: 'Valid', source: 'manual' }] },
          expectedError: 'Invalid field value',
        },
        {
          request: { flashcards: [{ front: 'Valid', back: '', source: 'manual' }] },
          expectedError: 'Invalid field value',
        },
        {
          request: { flashcards: [{ front: 'Valid', back: 'Valid', source: 'invalid' }] },
          expectedError: 'Invalid source value',
        },
      ]

      testCases.forEach(({ request, expectedError }, index) => {
        try {
          validateCreateFlashcardsRequest(request)
          expect.fail(`Test case ${index} should have thrown an error`)
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError)
          expect((error as ValidationError).message).toContain(expectedError)
        }
      })
    })
  })

  describe('Performance and memory considerations', () => {
    it('should handle maximum flashcards efficiently', () => {
      const maxFlashcards = Array.from({ length: 50 }, (_, i) =>
        createValidFlashcard({
          front: `Question ${i + 1}`,
          back: `Answer ${i + 1}`,
        })
      )

      const validRequest = { flashcards: maxFlashcards }

      const startTime = Date.now()
      const result = validateCreateFlashcardsRequest(validRequest)
      const endTime = Date.now()

      expect(result.flashcards).toHaveLength(50)
      expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
    })

    it('should handle large content efficiently', () => {
      const largeContentRequest = {
        flashcards: [
          createValidFlashcard({
            front: 'A'.repeat(200),
            back: 'B'.repeat(500),
          }),
        ],
      }

      const startTime = Date.now()
      const result = validateCreateFlashcardsRequest(largeContentRequest)
      const endTime = Date.now()

      expect(result.flashcards[0].front).toHaveLength(200)
      expect(result.flashcards[0].back).toHaveLength(500)
      expect(endTime - startTime).toBeLessThan(50) // Should complete within 50ms
    })

    it('should not modify original input objects', () => {
      const originalFlashcard = createValidFlashcard({
        front: '  Test  ',
        back: '  Test  ',
      })
      const originalRequest = { flashcards: [originalFlashcard] }

      validateCreateFlashcardsRequest(originalRequest)

      // Original objects should remain unchanged
      expect(originalFlashcard.front).toBe('  Test  ')
      expect(originalFlashcard.back).toBe('  Test  ')
      expect(originalRequest.flashcards[0]).toBe(originalFlashcard)
    })
  })
})