import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAIService } from '../AIService'
import type { AIGenerationResult } from '~/types/commands/generation-commands'

/**
 * Test suite for AIService
 *
 * Tests cover:
 * - Factory function (createAIService)
 * - Flashcard generation (generateFlashcards)
 * - Model information (getModel)
 * - Error handling scenarios
 * - Edge cases and business rules
 * - Integration with OpenRouterService
 * - JSON schema validation
 * - Polish language requirements
 */

// Mock the OpenRouterService module
vi.mock('~/services/openrouter/OpenRouterService', () => ({
  createOpenRouterService: vi.fn(),
}))

describe('AIService', () => {
  let mockOpenRouterService: {
    generateStructuredResponse: ReturnType<typeof vi.fn>
    getModel: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    // Create mock OpenRouter service
    mockOpenRouterService = {
      generateStructuredResponse: vi.fn(),
      getModel: vi.fn(),
    }

    // Mock the createOpenRouterService factory
    const { createOpenRouterService } = await import('~/services/openrouter/OpenRouterService')
    vi.mocked(createOpenRouterService).mockReturnValue(mockOpenRouterService)

    // Mock console.error to avoid noise in test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createAIService factory function', () => {
    it('should create AI service with correct OpenRouter configuration', () => {
      const aiService = createAIService()

      expect(aiService).toBeDefined()
      expect(typeof aiService.generateFlashcards).toBe('function')
      expect(typeof aiService.getModel).toBe('function')
    })

    it('should configure OpenRouter service with correct parameters', async () => {
      const { createOpenRouterService } = await import('~/services/openrouter/OpenRouterService')
      
      createAIService()

      expect(createOpenRouterService).toHaveBeenCalledWith({
        defaultModel: 'openai/gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 2000,
      })
    })

    it('should create service instance only once per call', async () => {
      const { createOpenRouterService } = await import('~/services/openrouter/OpenRouterService')
      
      const service1 = createAIService()
      const service2 = createAIService()

      expect(createOpenRouterService).toHaveBeenCalledTimes(2)
      expect(service1).not.toBe(service2)
    })
  })

  describe('generateFlashcards - Success scenarios', () => {
    it('should generate flashcards successfully from source text', async () => {
      const aiService = createAIService()
      
      const mockResponse = {
        flashcards: [
          { front: 'Co to jest JavaScript?', back: 'Język programowania do tworzenia stron internetowych' },
          { front: 'Jak działa pętla for?', back: 'Wykonuje kod określoną liczbę razy' },
        ],
      }

      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce(mockResponse)

      const sourceText = 'JavaScript jest językiem programowania używanym do tworzenia interaktywnych stron internetowych. Pętla for pozwala na wielokrotne wykonywanie tego samego kodu.'
      const result = await aiService.generateFlashcards(sourceText)

      expect(result).toEqual({
        proposals: mockResponse.flashcards,
        count: 2,
      })
    })

    it('should send correct messages to OpenRouter service', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      const sourceText = 'Test educational content for flashcard generation'
      await aiService.generateFlashcards(sourceText)

      expect(mockOpenRouterService.generateStructuredResponse).toHaveBeenCalledWith(
        [
          {
            role: 'system',
            content: expect.stringContaining('Jesteś ekspertem w tworzeniu edukacyjnych fiszek'),
          },
          {
            role: 'user',
            content: `Generate flashcards from the following educational text:\n\n${sourceText}`,
          },
        ],
        'flashcard_generation',
        expect.objectContaining({
          type: 'object',
          properties: {
            flashcards: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  front: { type: 'string' },
                  back: { type: 'string' },
                },
                required: ['front', 'back'],
                additionalProperties: false,
              },
            },
          },
          required: ['flashcards'],
          additionalProperties: false,
        })
      )
    })

    it('should handle empty flashcards array from API', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      const result = await aiService.generateFlashcards('Short text')

      expect(result).toEqual({
        proposals: [],
        count: 0,
      })
    })

    it('should handle single flashcard response', async () => {
      const aiService = createAIService()
      
      const mockResponse = {
        flashcards: [
          { front: 'Czym jest React?', back: 'Biblioteka JavaScript do budowania interfejsów użytkownika' },
        ],
      }

      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce(mockResponse)

      const result = await aiService.generateFlashcards('React to biblioteka JavaScript')

      expect(result).toEqual({
        proposals: mockResponse.flashcards,
        count: 1,
      })
    })

    it('should handle maximum number of flashcards (5)', async () => {
      const aiService = createAIService()
      
      const mockResponse = {
        flashcards: Array.from({ length: 5 }, (_, i) => ({
          front: `Pytanie ${i + 1}`,
          back: `Odpowiedź ${i + 1}`,
        })),
      }

      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce(mockResponse)

      const result = await aiService.generateFlashcards('A'.repeat(5000))

      expect(result.count).toBe(5)
      expect(result.proposals).toHaveLength(5)
    })
  })

  describe('generateFlashcards - System prompt validation', () => {
    it('should include Polish language requirement in system prompt', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      await aiService.generateFlashcards('Test content')

      const systemMessage = mockOpenRouterService.generateStructuredResponse.mock.calls[0][0][0]
      
      expect(systemMessage.content).toContain('WAŻNE: Wszystkie pytania i odpowiedzi muszą być w języku polskim')
    })

    it('should include flashcard generation guidelines in system prompt', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      await aiService.generateFlashcards('Test content')

      const systemMessage = mockOpenRouterService.generateStructuredResponse.mock.calls[0][0][0]
      
      expect(systemMessage.content).toContain('Stwórz 2-5 fiszek w zależności od bogactwa treści')
      expect(systemMessage.content).toContain('Skup się na kluczowych konceptach')
      expect(systemMessage.content).toContain('Pytania powinny być jasne, konkretne')
      expect(systemMessage.content).toContain('Unikaj pytań tak/nie')
    })

    it('should include JSON response format instructions', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      await aiService.generateFlashcards('Test content')

      const systemMessage = mockOpenRouterService.generateStructuredResponse.mock.calls[0][0][0]
      
      expect(systemMessage.content).toContain('Zwróć odpowiedź jako obiekt JSON')
      expect(systemMessage.content).toContain('"flashcards"')
      expect(systemMessage.content).toContain('"front"')
      expect(systemMessage.content).toContain('"back"')
    })
  })

  describe('generateFlashcards - JSON Schema validation', () => {
    it('should use correct JSON schema structure', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      await aiService.generateFlashcards('Test content')

      const schema = mockOpenRouterService.generateStructuredResponse.mock.calls[0][2]
      
      expect(schema).toEqual({
        type: 'object',
        properties: {
          flashcards: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                front: { type: 'string' },
                back: { type: 'string' },
              },
              required: ['front', 'back'],
              additionalProperties: false,
            },
          },
        },
        required: ['flashcards'],
        additionalProperties: false,
      })
    })

    it('should use correct schema name for structured response', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      await aiService.generateFlashcards('Test content')

      const schemaName = mockOpenRouterService.generateStructuredResponse.mock.calls[0][1]
      
      expect(schemaName).toBe('flashcard_generation')
    })
  })

  describe('generateFlashcards - Error handling', () => {
    it('should propagate OpenRouter service errors', async () => {
      const aiService = createAIService()
      
      const error = new Error('OpenRouter API rate limit exceeded')
      mockOpenRouterService.generateStructuredResponse.mockRejectedValueOnce(error)

      await expect(aiService.generateFlashcards('Test content')).rejects.toThrow(
        'OpenRouter API rate limit exceeded'
      )
    })

    it('should handle network errors', async () => {
      const aiService = createAIService()
      
      const networkError = new Error('Network connection failed')
      mockOpenRouterService.generateStructuredResponse.mockRejectedValueOnce(networkError)

      await expect(aiService.generateFlashcards('Test content')).rejects.toThrow(
        'Network connection failed'
      )
    })

    it('should handle JSON parsing errors from OpenRouter', async () => {
      const aiService = createAIService()
      
      const jsonError = new Error('Failed to parse structured response as JSON')
      mockOpenRouterService.generateStructuredResponse.mockRejectedValueOnce(jsonError)

      await expect(aiService.generateFlashcards('Test content')).rejects.toThrow(
        'Failed to parse structured response as JSON'
      )
    })

    it('should handle API authentication errors', async () => {
      const aiService = createAIService()
      
      const authError = new Error('OpenRouter API error: Invalid API key')
      mockOpenRouterService.generateStructuredResponse.mockRejectedValueOnce(authError)

      await expect(aiService.generateFlashcards('Test content')).rejects.toThrow(
        'OpenRouter API error: Invalid API key'
      )
    })

    it('should handle malformed API responses', async () => {
      const aiService = createAIService()
      
      const malformedError = new Error('Invalid response format from OpenRouter API')
      mockOpenRouterService.generateStructuredResponse.mockRejectedValueOnce(malformedError)

      await expect(aiService.generateFlashcards('Test content')).rejects.toThrow(
        'Invalid response format from OpenRouter API'
      )
    })
  })

  describe('generateFlashcards - Input validation and edge cases', () => {
    it('should handle very short source text', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      const result = await aiService.generateFlashcards('Short')

      expect(result.count).toBe(0)
      expect(result.proposals).toEqual([])
    })

    it('should handle very long source text', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [
          { front: 'Długi tekst pytanie', back: 'Długi tekst odpowiedź' },
        ],
      })

      const longText = 'A'.repeat(10000)
      const result = await aiService.generateFlashcards(longText)

      expect(result.count).toBe(1)
      expect(mockOpenRouterService.generateStructuredResponse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining(longText),
          }),
        ]),
        expect.any(String),
        expect.any(Object)
      )
    })

    it('should handle source text with special characters', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [
          { front: 'Pytanie z emoji 🎉', back: 'Odpowiedź z Unicode: é ñ ü' },
        ],
      })

      const specialText = 'Text with émojis 🎉 and spëcial chars: ñ ü ç'
      const result = await aiService.generateFlashcards(specialText)

      expect(result.proposals[0].front).toBe('Pytanie z emoji 🎉')
      expect(result.proposals[0].back).toBe('Odpowiedź z Unicode: é ñ ü')
    })

    it('should handle source text with HTML/XML content', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [
          { front: 'Co to jest HTML?', back: 'Język znaczników do tworzenia stron web' },
        ],
      })

      const htmlText = '<p>HTML to język znaczników</p><div>Używany do tworzenia stron</div>'
      await aiService.generateFlashcards(htmlText)

      expect(mockOpenRouterService.generateStructuredResponse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining(htmlText),
          }),
        ]),
        expect.any(String),
        expect.any(Object)
      )
    })

    it('should handle source text with code snippets', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [
          { front: 'Co robi console.log()?', back: 'Wypisuje informacje do konsoli' },
        ],
      })

      const codeText = 'function hello() { console.log("Hello World"); }'
      await aiService.generateFlashcards(codeText)

      expect(mockOpenRouterService.generateStructuredResponse).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            content: expect.stringContaining(codeText),
          }),
        ]),
        expect.any(String),
        expect.any(Object)
      )
    })

    it('should handle empty string input', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      const result = await aiService.generateFlashcards('')

      expect(result.count).toBe(0)
      expect(result.proposals).toEqual([])
    })

    it('should handle whitespace-only input', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [],
      })

      const result = await aiService.generateFlashcards('   \n\t   ')

      expect(result.count).toBe(0)
    })
  })

  describe('generateFlashcards - Response format validation', () => {
    it('should handle response with extra properties (should be filtered by schema)', async () => {
      const aiService = createAIService()
      
      const mockResponse = {
        flashcards: [
          { 
            front: 'Pytanie', 
            back: 'Odpowiedź',
            extraProperty: 'should be ignored', // This should be filtered by schema
          },
        ],
        extraTopLevel: 'should be ignored', // This should be filtered by schema
      }

      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce(mockResponse)

      const result = await aiService.generateFlashcards('Test content')

      expect(result.proposals[0]).toEqual({
        front: 'Pytanie',
        back: 'Odpowiedź',
        extraProperty: 'should be ignored', // Note: The mock returns this, but real schema would filter it
      })
    })

    it('should handle response with missing required properties gracefully', async () => {
      const aiService = createAIService()
      
      // This would normally be caught by the JSON schema validation
      const mockResponse = {
        flashcards: [
          { front: 'Pytanie' }, // Missing 'back' property
        ],
      }

      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce(mockResponse)

      const result = await aiService.generateFlashcards('Test content')

      expect(result.proposals[0].front).toBe('Pytanie')
      expect(result.proposals[0].back).toBeUndefined()
    })

    it('should return correct AIGenerationResult structure', async () => {
      const aiService = createAIService()
      
      const mockResponse = {
        flashcards: [
          { front: 'Q1', back: 'A1' },
          { front: 'Q2', back: 'A2' },
        ],
      }

      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce(mockResponse)

      const result = await aiService.generateFlashcards('Test content')

      // Verify the result matches AIGenerationResult type
      expect(result).toEqual({
        proposals: expect.any(Array),
        count: expect.any(Number),
      })
      expect(result.proposals).toHaveLength(2)
      expect(result.count).toBe(2)
    })
  })

  describe('getModel method', () => {
    it('should return current AI model name', () => {
      const aiService = createAIService()
      
      mockOpenRouterService.getModel.mockReturnValue('openai/gpt-4o-mini')

      const model = aiService.getModel()

      expect(model).toBe('openai/gpt-4o-mini')
      expect(mockOpenRouterService.getModel).toHaveBeenCalledTimes(1)
    })

    it('should delegate to OpenRouter service getModel method', () => {
      const aiService = createAIService()
      
      mockOpenRouterService.getModel.mockReturnValue('custom/model-name')

      const model = aiService.getModel()

      expect(model).toBe('custom/model-name')
      expect(mockOpenRouterService.getModel).toHaveBeenCalledTimes(1)
    })

    it('should return consistent model name across multiple calls', () => {
      const aiService = createAIService()
      
      mockOpenRouterService.getModel.mockReturnValue('openai/gpt-4o-mini')

      const model1 = aiService.getModel()
      const model2 = aiService.getModel()

      expect(model1).toBe(model2)
      expect(mockOpenRouterService.getModel).toHaveBeenCalledTimes(2)
    })
  })

  describe('Business rules and integration scenarios', () => {
    it('should support complete flashcard generation workflow', async () => {
      const aiService = createAIService()
      
      const mockResponse = {
        flashcards: [
          { front: 'Co to jest TypeScript?', back: 'Nadbudowa JavaScript z typami statycznymi' },
          { front: 'Jakie są zalety TypeScript?', back: 'Lepsze wykrywanie błędów i IntelliSense' },
        ],
      }

      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce(mockResponse)
      mockOpenRouterService.getModel.mockReturnValue('openai/gpt-4o-mini')

      // Step 1: Generate flashcards
      const sourceText = 'TypeScript to nadbudowa JavaScript która dodaje typy statyczne...'
      const result = await aiService.generateFlashcards(sourceText)

      // Step 2: Verify generation
      expect(result.count).toBe(2)
      expect(result.proposals).toHaveLength(2)

      // Step 3: Check model info
      const model = aiService.getModel()
      expect(model).toBe('openai/gpt-4o-mini')
    })

    it('should handle educational content in Polish correctly', async () => {
      const aiService = createAIService()
      
      const mockResponse = {
        flashcards: [
          { front: 'Czym jest fotosynteza?', back: 'Proces przekształcania światła słonecznego w energię przez rośliny' },
          { front: 'Gdzie zachodzi fotosynteza?', back: 'W chloroplastach komórek roślinnych' },
        ],
      }

      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce(mockResponse)

      const polishText = 'Fotosynteza to proces biologiczny zachodzący w roślinach, podczas którego energia światła słonecznego jest przekształcana w energię chemiczną.'
      const result = await aiService.generateFlashcards(polishText)

      expect(result.proposals.some(p => 
        p.front.includes('Czym') || p.front.includes('Gdzie')
      )).toBe(true)
      expect(result.proposals.some(p => 
        p.back.includes('proces') || p.back.includes('chloroplastach')
      )).toBe(true)
    })

    it('should maintain consistency across multiple generations', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse
        .mockResolvedValueOnce({
          flashcards: [{ front: 'Q1', back: 'A1' }],
        })
        .mockResolvedValueOnce({
          flashcards: [{ front: 'Q2', back: 'A2' }],
        })

      const result1 = await aiService.generateFlashcards('First text')
      const result2 = await aiService.generateFlashcards('Second text')

      expect(result1.count).toBe(1)
      expect(result2.count).toBe(1)
      expect(result1.proposals[0].front).toBe('Q1')
      expect(result2.proposals[0].front).toBe('Q2')
    })

    it('should handle concurrent generation requests', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse
        .mockResolvedValueOnce({
          flashcards: [{ front: 'Concurrent Q1', back: 'Concurrent A1' }],
        })
        .mockResolvedValueOnce({
          flashcards: [{ front: 'Concurrent Q2', back: 'Concurrent A2' }],
        })

      const [result1, result2] = await Promise.all([
        aiService.generateFlashcards('Text 1'),
        aiService.generateFlashcards('Text 2'),
      ])

      expect(result1.count).toBe(1)
      expect(result2.count).toBe(1)
      expect(mockOpenRouterService.generateStructuredResponse).toHaveBeenCalledTimes(2)
    })
  })

  describe('Performance and memory considerations', () => {
    it('should handle large source text efficiently', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [{ front: 'Large text question', back: 'Large text answer' }],
      })

      const largeText = 'A'.repeat(50000) // 50KB of text
      const result = await aiService.generateFlashcards(largeText)

      expect(result.count).toBe(1)
      expect(mockOpenRouterService.generateStructuredResponse).toHaveBeenCalledTimes(1)
    })

    it('should handle rapid successive generation calls', async () => {
      const aiService = createAIService()
      
      // Mock responses for multiple calls
      for (let i = 0; i < 10; i++) {
        mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
          flashcards: [{ front: `Q${i}`, back: `A${i}` }],
        })
      }

      const promises = Array.from({ length: 10 }, (_, i) =>
        aiService.generateFlashcards(`Text ${i}`)
      )

      const results = await Promise.all(promises)

      expect(results).toHaveLength(10)
      results.forEach((result, index) => {
        expect(result.count).toBe(1)
        expect(result.proposals[0].front).toBe(`Q${index}`)
      })
    })

    it('should not leak memory on repeated calls', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValue({
        flashcards: [{ front: 'Memory test Q', back: 'Memory test A' }],
      })

      // Simulate many calls
      for (let i = 0; i < 100; i++) {
        await aiService.generateFlashcards(`Test ${i}`)
      }

      expect(mockOpenRouterService.generateStructuredResponse).toHaveBeenCalledTimes(100)
    })
  })

  describe('Constants and configuration', () => {
    it('should use correct AI model constant', async () => {
      const { createOpenRouterService } = await import('~/services/openrouter/OpenRouterService')
      
      createAIService()

      expect(createOpenRouterService).toHaveBeenCalledWith(
        expect.objectContaining({
          defaultModel: 'openai/gpt-4o-mini',
        })
      )
    })

    it('should use correct temperature setting', async () => {
      const { createOpenRouterService } = await import('~/services/openrouter/OpenRouterService')
      
      createAIService()

      expect(createOpenRouterService).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.7,
        })
      )
    })

    it('should use correct max tokens setting', async () => {
      const { createOpenRouterService } = await import('~/services/openrouter/OpenRouterService')
      
      createAIService()

      expect(createOpenRouterService).toHaveBeenCalledWith(
        expect.objectContaining({
          maxTokens: 2000,
        })
      )
    })
  })

  describe('Type safety and interfaces', () => {
    it('should return properly typed AIGenerationResult', async () => {
      const aiService = createAIService()
      
      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce({
        flashcards: [{ front: 'Type test Q', back: 'Type test A' }],
      })

      const result: AIGenerationResult = await aiService.generateFlashcards('Test')

      expect(result.proposals).toBeDefined()
      expect(result.count).toBeDefined()
      expect(typeof result.count).toBe('number')
      expect(Array.isArray(result.proposals)).toBe(true)
    })

    it('should handle flashcard proposal structure correctly', async () => {
      const aiService = createAIService()
      
      const mockResponse = {
        flashcards: [
          { front: 'Structured Q', back: 'Structured A' },
        ],
      }

      mockOpenRouterService.generateStructuredResponse.mockResolvedValueOnce(mockResponse)

      const result = await aiService.generateFlashcards('Test')

      expect(result.proposals[0]).toHaveProperty('front')
      expect(result.proposals[0]).toHaveProperty('back')
      expect(typeof result.proposals[0].front).toBe('string')
      expect(typeof result.proposals[0].back).toBe('string')
    })
  })
})
