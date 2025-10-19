import { describe, it, expect } from 'vitest'
import { validateCreateGenerationRequest } from '../generation-validator'
import { ValidationError } from '../../errors/custom-errors'
import type { CreateGenerationRequestDTO } from '~/types/dto/types'

/**
 * Test suite for generation-validator
 *
 * Tests cover:
 * - Request body validation (structure, required fields)
 * - Source text validation (length constraints, type checking)
 * - Length boundary conditions (1000-10000 characters)
 * - Error message accuracy and details
 * - Edge cases and special characters
 * - Business rules enforcement
 * - Performance considerations
 */

describe('generation-validator', () => {
  describe('validateCreateGenerationRequest - Valid requests', () => {
    it('should accept valid request with exactly 1000 characters', () => {
      const validRequest = {
        source_text: 'A'.repeat(1000),
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result).toEqual({
        source_text: 'A'.repeat(1000),
      })
    })

    it('should accept valid request with exactly 10000 characters', () => {
      const validRequest = {
        source_text: 'B'.repeat(10000),
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result).toEqual({
        source_text: 'B'.repeat(10000),
      })
    })

    it('should accept valid request with 5000 characters (middle of range)', () => {
      const validRequest = {
        source_text: 'C'.repeat(5000),
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toHaveLength(5000)
    })

    it('should accept valid request with 1001 characters (just above minimum)', () => {
      const validRequest = {
        source_text: 'D'.repeat(1001),
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toHaveLength(1001)
    })

    it('should accept valid request with 9999 characters (just below maximum)', () => {
      const validRequest = {
        source_text: 'E'.repeat(9999),
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toHaveLength(9999)
    })

    it('should accept text with mixed content types', () => {
      const mixedText = `
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        Numbers: 123456789
        Special chars: !@#$%^&*()
        Unicode: 你好世界 🌍
        Newlines and tabs are preserved.
      `.repeat(50) // Make it long enough

      const validRequest = {
        source_text: mixedText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(mixedText)
      expect(result.source_text.length).toBeGreaterThanOrEqual(1000)
    })

    it('should preserve original text content without modification', () => {
      const originalText = `
        This is a test text with various formatting:
        - Bullet points
        - Multiple   spaces
        - Tabs	and	newlines
        
        Special characters: àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ
        Emojis: 🚀 🎉 🔥 💯
        Math symbols: ∑ ∆ π ∞ ≈ ≠ ≤ ≥
      `.repeat(20)

      const validRequest = {
        source_text: originalText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(originalText)
    })
  })

  describe('validateCreateGenerationRequest - Request body validation', () => {
    it('should reject null request body', () => {
      expect(() => validateCreateGenerationRequest(null)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(null)).toThrow('Invalid request format')
    })

    it('should reject undefined request body', () => {
      expect(() => validateCreateGenerationRequest(undefined)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(undefined)).toThrow('Invalid request format')
    })

    it('should reject non-object request body', () => {
      expect(() => validateCreateGenerationRequest('string')).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(123)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest([])).toThrow(ValidationError)
    })

    it('should reject empty object request body', () => {
      const invalidRequest = {}

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject request body without source_text field', () => {
      const invalidRequest = { otherField: 'value' }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should provide detailed error message for invalid request format', () => {
      try {
        validateCreateGenerationRequest(null)
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).message).toBe('Invalid request format')
        expect((error as ValidationError).details).toBe('Request body must be a valid JSON object')
      }
    })

    it('should provide detailed error message for missing source_text', () => {
      try {
        validateCreateGenerationRequest({})
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).message).toBe('Invalid input')
        expect((error as ValidationError).details).toBe('source_text field is required')
      }
    })
  })

  describe('Source text type validation', () => {
    it('should reject non-string source_text', () => {
      const invalidRequest = {
        source_text: 123,
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject array source_text', () => {
      const invalidRequest = {
        source_text: ['array', 'of', 'strings'],
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject object source_text', () => {
      const invalidRequest = {
        source_text: { text: 'object with text' },
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject boolean source_text', () => {
      const invalidRequest = {
        source_text: true,
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject null source_text', () => {
      const invalidRequest = {
        source_text: null,
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should provide detailed error message for type validation', () => {
      try {
        validateCreateGenerationRequest({ source_text: 123 })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).message).toBe('Invalid input')
        expect((error as ValidationError).details).toBe('source_text must be a string')
      }
    })
  })

  describe('Source text length validation - Too short', () => {
    it('should reject empty string', () => {
      const invalidRequest = {
        source_text: '',
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject text with 999 characters', () => {
      const invalidRequest = {
        source_text: 'A'.repeat(999),
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject text with 500 characters', () => {
      const invalidRequest = {
        source_text: 'B'.repeat(500),
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject text with 1 character', () => {
      const invalidRequest = {
        source_text: 'C',
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should provide detailed error message for too short text', () => {
      try {
        validateCreateGenerationRequest({ source_text: 'A'.repeat(800) })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).message).toBe('Invalid input')
        expect((error as ValidationError).details).toBe(
          'source_text must be between 1000 and 10000 characters. Received: 800 characters'
        )
      }
    })
  })

  describe('Source text length validation - Too long', () => {
    it('should reject text with 10001 characters', () => {
      const invalidRequest = {
        source_text: 'A'.repeat(10001),
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject text with 15000 characters', () => {
      const invalidRequest = {
        source_text: 'B'.repeat(15000),
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should reject text with 50000 characters', () => {
      const invalidRequest = {
        source_text: 'C'.repeat(50000),
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow('Invalid input')
    })

    it('should provide detailed error message for too long text', () => {
      try {
        validateCreateGenerationRequest({ source_text: 'A'.repeat(12000) })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)
        expect((error as ValidationError).message).toBe('Invalid input')
        expect((error as ValidationError).details).toBe(
          'source_text must be between 1000 and 10000 characters. Received: 12000 characters'
        )
      }
    })
  })

  describe('Boundary conditions', () => {
    it('should accept exactly 1000 characters (minimum boundary)', () => {
      const validRequest = {
        source_text: 'A'.repeat(1000),
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toHaveLength(1000)
    })

    it('should accept exactly 10000 characters (maximum boundary)', () => {
      const validRequest = {
        source_text: 'B'.repeat(10000),
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toHaveLength(10000)
    })

    it('should reject 999 characters (just below minimum)', () => {
      const invalidRequest = {
        source_text: 'A'.repeat(999),
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
    })

    it('should reject 10001 characters (just above maximum)', () => {
      const invalidRequest = {
        source_text: 'A'.repeat(10001),
      }

      expect(() => validateCreateGenerationRequest(invalidRequest)).toThrow(ValidationError)
    })

    it('should handle boundary conditions consistently', () => {
      const testCases = [
        { length: 999, shouldPass: false },
        { length: 1000, shouldPass: true },
        { length: 1001, shouldPass: true },
        { length: 9999, shouldPass: true },
        { length: 10000, shouldPass: true },
        { length: 10001, shouldPass: false },
      ]

      testCases.forEach(({ length, shouldPass }) => {
        const request = { source_text: 'A'.repeat(length) }

        if (shouldPass) {
          expect(() => validateCreateGenerationRequest(request)).not.toThrow()
        } else {
          expect(() => validateCreateGenerationRequest(request)).toThrow(ValidationError)
        }
      })
    })
  })

  describe('Edge cases and special content', () => {
    it('should handle text with only whitespace characters', () => {
      const whitespaceText = ' \n\t\r'.repeat(300) // 1200 characters of whitespace

      const validRequest = {
        source_text: whitespaceText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(whitespaceText)
      expect(result.source_text.length).toBe(1200)
    })

    it('should handle text with Unicode characters', () => {
      const unicodeText = '你好世界🌍'.repeat(200) // Each character might be multiple bytes

      const validRequest = {
        source_text: unicodeText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(unicodeText)
      expect(result.source_text.length).toBeGreaterThanOrEqual(1000)
    })

    it('should handle text with emojis and special symbols', () => {
      const emojiText = '🚀🎉🔥💯⭐️🌟✨🎯🏆🎊'.repeat(190) // Approximately 1900 characters

      const validRequest = {
        source_text: emojiText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(emojiText)
      expect(result.source_text.length).toBeGreaterThan(1000)
    })

    it('should handle text with HTML/XML-like content', () => {
      const htmlLikeText = `
        <div class="content">
          <h1>Title</h1>
          <p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
          <ul>
            <li>Item 1</li>
            <li>Item 2</li>
          </ul>
        </div>
      `.repeat(20) // Ensure it's within the valid range

      const validRequest = {
        source_text: htmlLikeText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(htmlLikeText)
    })

    it('should handle text with code-like content', () => {
      const codeText = `
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
        
        const result = fibonacci(10);
        console.log('Fibonacci of 10 is:', result);
      `.repeat(30)

      const validRequest = {
        source_text: codeText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(codeText)
    })

    it('should handle text with JSON-like content', () => {
      const jsonText = `
        {
          "name": "John Doe",
          "age": 30,
          "address": {
            "street": "123 Main St",
            "city": "Anytown",
            "country": "USA"
          },
          "hobbies": ["reading", "swimming", "coding"]
        }
      `.repeat(20)

      const validRequest = {
        source_text: jsonText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(jsonText)
    })

    it('should handle text with mathematical notation', () => {
      const mathText = `
        The quadratic formula is: x = (-b ± √(b² - 4ac)) / 2a
        
        For the equation ax² + bx + c = 0, where a ≠ 0:
        - If b² - 4ac > 0, there are two real solutions
        - If b² - 4ac = 0, there is one real solution
        - If b² - 4ac < 0, there are no real solutions
        
        Example: 2x² + 5x - 3 = 0
        a = 2, b = 5, c = -3
        Discriminant = 5² - 4(2)(-3) = 25 + 24 = 49
        x = (-5 ± √49) / 4 = (-5 ± 7) / 4
        Solutions: x₁ = 1/2, x₂ = -3
      `.repeat(10)

      const validRequest = {
        source_text: mathText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(mathText)
    })
  })

  describe('Business rules and integration scenarios', () => {
    it('should support typical educational content generation', () => {
      const educationalText = `
        Photosynthesis is the process by which plants and other organisms convert light energy 
        into chemical energy that can later be released to fuel the organism's activities. 
        This chemical energy is stored in carbohydrate molecules, such as sugars, which are 
        synthesized from carbon dioxide and water.
        
        The general equation for photosynthesis is:
        6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂
        
        Photosynthesis occurs in two main stages:
        1. Light-dependent reactions (occur in the thylakoids)
        2. Light-independent reactions or Calvin cycle (occur in the stroma)
        
        The light-dependent reactions capture light energy and use it to make ATP and NADPH.
        The Calvin cycle uses ATP and NADPH to convert CO₂ into glucose.
      `.repeat(5)

      const validRequest = {
        source_text: educationalText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(educationalText)
      expect(result.source_text.length).toBeGreaterThanOrEqual(1000)
      expect(result.source_text.length).toBeLessThanOrEqual(10000)
    })

    it('should support academic paper content', () => {
      const academicText = `
        Abstract: This study investigates the impact of machine learning algorithms on 
        educational outcomes in computer science education. We analyzed data from 500 
        students across 10 universities over a period of 2 years.
        
        Introduction: The integration of artificial intelligence in education has shown 
        promising results in personalizing learning experiences. However, the specific 
        impact on computer science education remains understudied.
        
        Methodology: We employed a mixed-methods approach, combining quantitative analysis 
        of student performance data with qualitative interviews. The study used a 
        randomized controlled trial design with treatment and control groups.
        
        Results: Students in the AI-enhanced learning group showed a 23% improvement in 
        problem-solving skills and a 18% increase in course completion rates compared 
        to the traditional learning group.
        
        Discussion: These findings suggest that AI-powered educational tools can 
        significantly enhance learning outcomes in technical subjects.
      `.repeat(3)

      const validRequest = {
        source_text: academicText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(academicText)
    })

    it('should support technical documentation content', () => {
      const technicalText = `
        API Documentation: User Authentication Endpoint
        
        POST /api/auth/login
        
        Description: Authenticates a user and returns a JWT token for subsequent requests.
        
        Request Headers:
        - Content-Type: application/json
        - Accept: application/json
        
        Request Body:
        {
          "email": "user@example.com",
          "password": "securepassword"
        }
        
        Response (200 OK):
        {
          "success": true,
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          "user": {
            "id": 123,
            "email": "user@example.com",
            "name": "John Doe"
          }
        }
        
        Error Responses:
        - 400 Bad Request: Invalid request format
        - 401 Unauthorized: Invalid credentials
        - 429 Too Many Requests: Rate limit exceeded
        - 500 Internal Server Error: Server error
        
        Rate Limiting: 5 requests per minute per IP address
        Token Expiry: 24 hours from issuance
      `.repeat(2)

      const validRequest = {
        source_text: technicalText,
      }

      const result = validateCreateGenerationRequest(validRequest)

      expect(result.source_text).toBe(technicalText)
    })

    it('should maintain data integrity during validation', () => {
      const originalText = 'A'.repeat(5000)
      const originalRequest = { source_text: originalText }

      const result = validateCreateGenerationRequest(originalRequest)

      // Original request should not be modified
      expect(originalRequest.source_text).toBe(originalText)
      expect(originalRequest.source_text).toHaveLength(5000)

      // Result should be identical to input
      expect(result.source_text).toBe(originalText)
      expect(result.source_text).toHaveLength(5000)
    })

    it('should provide consistent error messages for different invalid inputs', () => {
      const testCases = [
        {
          input: { source_text: 'A'.repeat(500) },
          expectedMessage: 'Invalid input',
          expectedDetails:
            'source_text must be between 1000 and 10000 characters. Received: 500 characters',
        },
        {
          input: { source_text: 'A'.repeat(15000) },
          expectedMessage: 'Invalid input',
          expectedDetails:
            'source_text must be between 1000 and 10000 characters. Received: 15000 characters',
        },
        {
          input: { source_text: 123 },
          expectedMessage: 'Invalid input',
          expectedDetails: 'source_text must be a string',
        },
        {
          input: {},
          expectedMessage: 'Invalid input',
          expectedDetails: 'source_text field is required',
        },
      ]

      testCases.forEach(({ input, expectedMessage, expectedDetails }, index) => {
        try {
          validateCreateGenerationRequest(input)
          expect.fail(`Test case ${index} should have thrown an error`)
        } catch (error) {
          expect(error).toBeInstanceOf(ValidationError)
          expect((error as ValidationError).message).toBe(expectedMessage)
          expect((error as ValidationError).details).toBe(expectedDetails)
        }
      })
    })
  })

  describe('Performance and memory considerations', () => {
    it('should handle maximum length text efficiently', () => {
      const maxLengthText = 'A'.repeat(10000)
      const validRequest = { source_text: maxLengthText }

      const startTime = Date.now()
      const result = validateCreateGenerationRequest(validRequest)
      const endTime = Date.now()

      expect(result.source_text).toHaveLength(10000)
      expect(endTime - startTime).toBeLessThan(50) // Should complete within 50ms
    })

    it('should handle complex Unicode text efficiently', () => {
      const complexText =
        '🌍🚀🎉💯⭐️🌟✨🎯🏆🎊'.repeat(100) +
        '你好世界'.repeat(100) +
        'àáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ'.repeat(50)

      const validRequest = { source_text: complexText }

      const startTime = Date.now()
      const result = validateCreateGenerationRequest(validRequest)
      const endTime = Date.now()

      expect(result.source_text).toBe(complexText)
      expect(endTime - startTime).toBeLessThan(100) // Should complete within 100ms
    })

    it('should not modify original input objects', () => {
      const originalText = 'A'.repeat(5000)
      const originalRequest = { source_text: originalText }

      validateCreateGenerationRequest(originalRequest)

      // Original objects should remain unchanged
      expect(originalRequest.source_text).toBe(originalText)
      expect(originalRequest.source_text).toHaveLength(5000)
    })

    it('should handle rapid successive validations', () => {
      const texts = Array.from(
        { length: 10 },
        (_, i) => `Text number ${i + 1} `.repeat(200) // Each ~3000 characters
      )

      const startTime = Date.now()

      texts.forEach(text => {
        const request = { source_text: text }
        const result = validateCreateGenerationRequest(request)
        expect(result.source_text).toBe(text)
      })

      const endTime = Date.now()

      expect(endTime - startTime).toBeLessThan(200) // All 10 validations within 200ms
    })

    it('should handle memory efficiently with large valid text', () => {
      // Create a large but valid text (exactly 10000 characters)
      const baseText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '
      const repeatCount = Math.floor(10000 / baseText.length)
      const largeText = baseText.repeat(repeatCount)
      const remainingChars = 10000 - largeText.length
      const paddedText = largeText + 'A'.repeat(Math.max(0, remainingChars)) // Exactly 10000

      const validRequest = { source_text: paddedText }

      // Should not throw memory errors
      expect(() => validateCreateGenerationRequest(validRequest)).not.toThrow()

      const result = validateCreateGenerationRequest(validRequest)
      expect(result.source_text).toBe(paddedText)
      expect(result.source_text.length).toBe(10000)
    })
  })

  describe('Type safety and return value validation', () => {
    it('should return properly typed CreateGenerationRequestDTO', () => {
      const validRequest = {
        source_text: 'A'.repeat(5000),
      }

      const result: CreateGenerationRequestDTO = validateCreateGenerationRequest(validRequest)

      // TypeScript compilation ensures type safety
      expect(typeof result.source_text).toBe('string')
      expect(result.source_text).toHaveLength(5000)
    })

    it('should maintain exact structure of CreateGenerationRequestDTO', () => {
      const validRequest = {
        source_text: 'B'.repeat(3000),
        extraField: 'should be ignored', // Extra fields should not appear in result
      }

      const result = validateCreateGenerationRequest(validRequest)

      // Should only contain source_text field
      expect(Object.keys(result)).toEqual(['source_text'])
      expect(result.source_text).toBe('B'.repeat(3000))
      expect('extraField' in result).toBe(false)
    })

    it('should ensure ValidationError is properly typed', () => {
      try {
        validateCreateGenerationRequest({ source_text: 'too short' })
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError)

        const validationError = error as ValidationError
        expect(typeof validationError.message).toBe('string')
        expect(typeof validationError.details).toBe('string')
        expect(validationError.message).toBeTruthy()
        expect(validationError.details).toBeTruthy()
      }
    })
  })
})
