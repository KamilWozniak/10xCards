import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createOpenRouterService } from '../OpenRouterService'
import type { OpenRouterResponse } from '~/types/openrouter.types'

describe('OpenRouterService', () => {
  const mockApiKey = 'test-api-key-12345'
  const originalEnv = process.env.OPENROUTER_API_KEY

  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = originalEnv
  })

  describe('createOpenRouterService', () => {
    it('should create service with provided API key', () => {
      // Arrange & Act
      const service = createOpenRouterService({ apiKey: mockApiKey })

      // Assert
      expect(service).toBeDefined()
      expect(service.generateResponse).toBeDefined()
      expect(service.generateStructuredResponse).toBeDefined()
      expect(service.getModel).toBeDefined()
    })

    it('should use API key from environment variable when not provided', () => {
      // Arrange
      process.env.OPENROUTER_API_KEY = 'env-api-key'

      // Act
      const service = createOpenRouterService()

      // Assert
      expect(service).toBeDefined()
    })

    it('should throw error when API key is not configured', () => {
      // Arrange
      process.env.OPENROUTER_API_KEY = ''

      // Act & Assert
      expect(() => createOpenRouterService()).toThrow('OpenRouter API key is not configured')
    })

    it('should use default configuration values', () => {
      // Arrange & Act
      const service = createOpenRouterService({ apiKey: mockApiKey })

      // Assert
      expect(service.getModel()).toBe('openai/gpt-4o-mini')
    })

    it('should use custom model when provided', () => {
      // Arrange & Act
      const service = createOpenRouterService({
        apiKey: mockApiKey,
        defaultModel: 'anthropic/claude-3-opus',
      })

      // Assert
      expect(service.getModel()).toBe('anthropic/claude-3-opus')
    })

    it('should use custom configuration parameters', () => {
      // Arrange & Act
      const service = createOpenRouterService({
        apiKey: mockApiKey,
        defaultModel: 'custom-model',
        temperature: 0.5,
        maxTokens: 2000,
        topP: 0.9,
        frequencyPenalty: 0.5,
        presencePenalty: 0.3,
      })

      // Assert
      expect(service).toBeDefined()
      expect(service.getModel()).toBe('custom-model')
    })
  })

  describe('getModel', () => {
    it('should return default model when no custom model is provided', () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })

      // Act
      const model = service.getModel()

      // Assert
      expect(model).toBe('openai/gpt-4o-mini')
    })

    it('should return custom model when provided', () => {
      // Arrange
      const customModel = 'openai/gpt-4-turbo'
      const service = createOpenRouterService({
        apiKey: mockApiKey,
        defaultModel: customModel,
      })

      // Act
      const model = service.getModel()

      // Assert
      expect(model).toBe(customModel)
    })
  })

  describe('generateResponse', () => {
    it('should successfully generate text response', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'system' as const, content: 'You are a helpful assistant.' },
        { role: 'user' as const, content: 'Hello!' },
      ]

      const mockResponse: OpenRouterResponse = {
        id: 'chatcmpl-123',
        model: 'openai/gpt-4o-mini',
        created: 1234567890,
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 8,
          total_tokens: 18,
        },
      }

      const mockFetch = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal('$fetch', mockFetch)

      // Act
      const result = await service.generateResponse(messages)

      // Assert
      expect(result).toBe('Hello! How can I help you today?')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json',
          }),
          body: expect.objectContaining({
            model: 'openai/gpt-4o-mini',
            messages,
          }),
        })
      )
    })

    it('should throw error when messages array is empty', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages: never[] = []

      // Act & Assert
      await expect(service.generateResponse(messages)).rejects.toThrow(
        'Messages array cannot be empty'
      )
    })

    it('should throw error when message content is empty', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'user' as const, content: '' },
      ]

      // Act & Assert
      await expect(service.generateResponse(messages)).rejects.toThrow(
        'Message content cannot be empty'
      )
    })

    it('should throw error when message has invalid role', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'invalid' as any, content: 'Hello' },
      ]

      // Act & Assert
      await expect(service.generateResponse(messages)).rejects.toThrow(
        'Invalid message role'
      )
    })

    it('should use custom options when provided', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'user' as const, content: 'Test message' },
      ]

      const mockResponse: OpenRouterResponse = {
        id: 'chatcmpl-456',
        model: 'openai/gpt-4-turbo',
        created: 1234567890,
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Response',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 3,
          total_tokens: 8,
        },
      }

      const mockFetch = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal('$fetch', mockFetch)

      // Act
      await service.generateResponse(messages, {
        model: 'openai/gpt-4-turbo',
        temperature: 0.8,
        max_tokens: 500,
      })

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.objectContaining({
            model: 'openai/gpt-4-turbo',
            temperature: 0.8,
            max_tokens: 500,
          }),
        })
      )
    })

    it('should throw error when API request fails', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'user' as const, content: 'Test' },
      ]

      const mockError = {
        error: {
          message: 'API rate limit exceeded',
          code: 'rate_limit',
        },
      }

      const mockFetch = vi.fn().mockRejectedValue(mockError)
      vi.stubGlobal('$fetch', mockFetch)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Act & Assert
      await expect(service.generateResponse(messages)).rejects.toThrow(
        'OpenRouter API error: API rate limit exceeded'
      )
      expect(consoleErrorSpy).toHaveBeenCalledWith('OpenRouter API error details:', mockError)

      consoleErrorSpy.mockRestore()
    })

    it('should throw error when response format is invalid', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'user' as const, content: 'Test' },
      ]

      const invalidResponse = {
        id: 'chatcmpl-789',
        choices: [],
      }

      const mockFetch = vi.fn().mockResolvedValue(invalidResponse)
      vi.stubGlobal('$fetch', mockFetch)

      // Act & Assert
      await expect(service.generateResponse(messages)).rejects.toThrow(
        'Invalid response format from OpenRouter API'
      )
    })

    it('should handle multiple messages in conversation', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'system' as const, content: 'You are a helpful assistant.' },
        { role: 'user' as const, content: 'What is 2+2?' },
        { role: 'assistant' as const, content: '4' },
        { role: 'user' as const, content: 'And what is 3+3?' },
      ]

      const mockResponse: OpenRouterResponse = {
        id: 'chatcmpl-999',
        model: 'openai/gpt-4o-mini',
        created: 1234567890,
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '6',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 20,
          completion_tokens: 2,
          total_tokens: 22,
        },
      }

      const mockFetch = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal('$fetch', mockFetch)

      // Act
      const result = await service.generateResponse(messages)

      // Assert
      expect(result).toBe('6')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.objectContaining({
            messages,
          }),
        })
      )
    })
  })

  describe('generateStructuredResponse', () => {
    it('should successfully generate structured JSON response', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'user' as const, content: 'Generate a flashcard' },
      ]
      const schema = {
        type: 'object',
        properties: {
          front: { type: 'string' },
          back: { type: 'string' },
        },
        required: ['front', 'back'],
      }

      const expectedData = {
        front: 'Question',
        back: 'Answer',
      }

      const mockResponse: OpenRouterResponse = {
        id: 'chatcmpl-json-1',
        model: 'openai/gpt-4o-mini',
        created: 1234567890,
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify(expectedData),
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 15,
          completion_tokens: 10,
          total_tokens: 25,
        },
      }

      const mockFetch = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal('$fetch', mockFetch)

      // Act
      const result = await service.generateStructuredResponse<typeof expectedData>(
        messages,
        'flashcard_schema',
        schema
      )

      // Assert
      expect(result).toEqual(expectedData)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.objectContaining({
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'flashcard_schema',
                strict: true,
                schema,
              },
            },
          }),
        })
      )
    })

    it('should throw error when JSON parsing fails', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'user' as const, content: 'Generate data' },
      ]
      const schema = {
        type: 'object',
        properties: { value: { type: 'string' } },
      }

      const mockResponse: OpenRouterResponse = {
        id: 'chatcmpl-json-2',
        model: 'openai/gpt-4o-mini',
        created: 1234567890,
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'invalid json{',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15,
        },
      }

      const mockFetch = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal('$fetch', mockFetch)

      // Act & Assert
      await expect(
        service.generateStructuredResponse(messages, 'test_schema', schema)
      ).rejects.toThrow('Failed to parse structured response as JSON')
    })

    it('should merge custom options with response format', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'user' as const, content: 'Test' },
      ]
      const schema = { type: 'object' }

      const mockResponse: OpenRouterResponse = {
        id: 'chatcmpl-json-3',
        model: 'openai/gpt-4-turbo',
        created: 1234567890,
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '{"test": true}',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 8,
          completion_tokens: 4,
          total_tokens: 12,
        },
      }

      const mockFetch = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal('$fetch', mockFetch)

      // Act
      await service.generateStructuredResponse(
        messages,
        'custom_schema',
        schema,
        {
          model: 'openai/gpt-4-turbo',
          temperature: 0.3,
        }
      )

      // Assert
      expect(mockFetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          body: expect.objectContaining({
            model: 'openai/gpt-4-turbo',
            temperature: 0.3,
            response_format: expect.objectContaining({
              type: 'json_schema',
            }),
          }),
        })
      )
    })

    it('should handle complex nested JSON structures', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'user' as const, content: 'Generate flashcards' },
      ]
      const schema = {
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
            },
          },
        },
      }

      const expectedData = {
        flashcards: [
          { front: 'Q1', back: 'A1' },
          { front: 'Q2', back: 'A2' },
        ],
      }

      const mockResponse: OpenRouterResponse = {
        id: 'chatcmpl-json-4',
        model: 'openai/gpt-4o-mini',
        created: 1234567890,
        object: 'chat.completion',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: JSON.stringify(expectedData),
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 20,
          completion_tokens: 15,
          total_tokens: 35,
        },
      }

      const mockFetch = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal('$fetch', mockFetch)

      // Act
      const result = await service.generateStructuredResponse<typeof expectedData>(
        messages,
        'flashcards_schema',
        schema
      )

      // Assert
      expect(result).toEqual(expectedData)
      expect(result.flashcards).toHaveLength(2)
      expect(result.flashcards[0].front).toBe('Q1')
    })

    it('should validate messages before making structured request', async () => {
      // Arrange
      const service = createOpenRouterService({ apiKey: mockApiKey })
      const messages = [
        { role: 'user' as const, content: '   ' },
      ]
      const schema = { type: 'object' }

      // Act & Assert
      await expect(
        service.generateStructuredResponse(messages, 'schema', schema)
      ).rejects.toThrow('Message content cannot be empty')
    })
  })
})
