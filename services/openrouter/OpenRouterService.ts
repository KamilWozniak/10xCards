import type {
  OpenRouterRequestOptions,
  OpenRouterResponse,
  OpenRouterError,
} from '~/types/openrouter.types'

const DEFAULT_MODEL = 'openai/gpt-4o-mini'
const API_BASE_URL = 'https://openrouter.ai/api/v1'

interface OpenRouterConfig {
  apiKey?: string
  defaultModel?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Validate messages array
 */
function validateMessages(messages: OpenRouterMessage[]): void {
  if (!messages?.length) {
    throw new Error('Messages array cannot be empty')
  }

  for (const message of messages) {
    if (!message.content?.trim()) {
      throw new Error('Message content cannot be empty')
    }
    if (!['system', 'user', 'assistant'].includes(message.role)) {
      throw new Error('Invalid message role')
    }
  }
}

/**
 * Build request payload for OpenRouter API
 */
function buildRequestPayload(
  messages: OpenRouterMessage[],
  config: Required<OpenRouterConfig>,
  options: Partial<OpenRouterRequestOptions> = {}
): OpenRouterRequestOptions {
  validateMessages(messages)
  return {
    model: options.model || config.defaultModel,
    messages,
    temperature: options.temperature ?? config.temperature,
    max_tokens: options.max_tokens ?? config.maxTokens,
    top_p: options.top_p ?? config.topP,
    frequency_penalty: options.frequency_penalty ?? config.frequencyPenalty,
    presence_penalty: options.presence_penalty ?? config.presencePenalty,
    response_format: options.response_format,
  }
}

/**
 * Execute API request to OpenRouter
 */
async function executeRequest<T = unknown>(
  payload: OpenRouterRequestOptions,
  apiKey: string
): Promise<OpenRouterResponse<T>> {
  try {
    const response = await $fetch<OpenRouterResponse<T>>(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: payload,
    })

    return response
  } catch (error: unknown) {
    console.error('OpenRouter API error details:', error)
    const openRouterError = error as OpenRouterError
    throw new Error(
      `OpenRouter API error: ${openRouterError.error?.message || 'Unknown error'}`
    )
  }
}

/**
 * Parse response content from OpenRouter
 */
function parseResponse<T = unknown>(response: OpenRouterResponse<T>): string {
  if (!response.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from OpenRouter API')
  }
  return response.choices[0].message.content
}

/**
 * Create OpenRouter service with configuration
 */
export function createOpenRouterService(config: OpenRouterConfig = {}) {
  const apiKey = config.apiKey || process.env.OPENROUTER_API_KEY || ''

  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured')
  }

  const fullConfig: Required<OpenRouterConfig> = {
    apiKey,
    defaultModel: config.defaultModel || DEFAULT_MODEL,
    temperature: config.temperature ?? 0.7,
    maxTokens: config.maxTokens ?? 1000,
    topP: config.topP ?? 1,
    frequencyPenalty: config.frequencyPenalty ?? 0,
    presencePenalty: config.presencePenalty ?? 0,
  }

  return {
    /**
     * Generate a text response from OpenRouter
     */
    generateResponse: async (
      messages: OpenRouterMessage[],
      options: Partial<OpenRouterRequestOptions> = {}
    ): Promise<string> => {
      const payload = buildRequestPayload(messages, fullConfig, options)
      const response = await executeRequest(payload, apiKey)
      return parseResponse(response)
    },

    /**
     * Generate a structured JSON response from OpenRouter
     */
    generateStructuredResponse: async <T = unknown>(
      messages: OpenRouterMessage[],
      schemaName: string,
      schema: Record<string, unknown>,
      options: Partial<OpenRouterRequestOptions> = {}
    ): Promise<T> => {
      const payload = buildRequestPayload(messages, fullConfig, {
        ...options,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: schemaName,
            strict: true,
            schema,
          },
        },
      })

      const response = await executeRequest<T>(payload, apiKey)
      const jsonString = parseResponse(response)
      try {
        return JSON.parse(jsonString) as T
      } catch {
        throw new Error('Failed to parse structured response as JSON')
      }
    },

    /**
     * Get current model name
     */
    getModel: (): string => fullConfig.defaultModel,
  }
}
