import { ref, readonly } from 'vue'
import type {
  OpenRouterConfig,
  OpenRouterState,
  OpenRouterMessage,
  OpenRouterRequestOptions,
  OpenRouterResponse,
  OpenRouterError,
} from '~/types/openrouter.types'

const DEFAULT_MODEL = 'openai/gpt-4-turbo-preview'
const API_BASE_URL = 'https://openrouter.ai/api/v1'

export function useOpenRouter(config: Partial<OpenRouterConfig> = {}) {
  const runtimeConfig = useRuntimeConfig()

  // Private state
  const apiKey = runtimeConfig.openRouterApiKey

  // Public reactive state
  const state = ref<OpenRouterState>({
    isLoading: false,
    error: null,
    config: {
      defaultModel: DEFAULT_MODEL,
      temperature: 0.7,
      maxTokens: 1000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      ...config,
    },
  })

  // Validate API key on initialization
  if (!apiKey) {
    state.value.error = {
      error: {
        message: 'OpenRouter API key is not configured',
        type: 'configuration_error',
      },
    }
  }

  // Private methods
  const validateMessages = (messages: OpenRouterMessage[]): void => {
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

  const buildRequestPayload = (
    messages: OpenRouterMessage[],
    options: Partial<OpenRouterRequestOptions> = {}
  ): OpenRouterRequestOptions => {
    validateMessages(messages)
    return {
      model: options.model || state.value.config.defaultModel,
      messages,
      temperature: options.temperature ?? state.value.config.temperature,
      max_tokens: options.max_tokens ?? state.value.config.maxTokens,
      top_p: options.top_p ?? state.value.config.topP,
      frequency_penalty: options.frequency_penalty ?? state.value.config.frequencyPenalty,
      presence_penalty: options.presence_penalty ?? state.value.config.presencePenalty,
      response_format: options.response_format,
    }
  }

  const executeRequest = async <T = unknown>(
    payload: OpenRouterRequestOptions
  ): Promise<OpenRouterResponse<T>> => {
    if (!apiKey) {
      throw new Error('OpenRouter API key is not configured')
    }

    try {
      state.value.isLoading = true
      state.value.error = null

      const response = await $fetch<OpenRouterResponse<T>>(`${API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window?.location?.origin || 'http://localhost:3000',
          'X-Title': '10xCards',
        },
        body: payload,
      })

      return response
    } catch (error: unknown) {
      const openRouterError = error as OpenRouterError
      state.value.error = openRouterError
      throw error
    } finally {
      state.value.isLoading = false
    }
  }

  const parseResponse = <T = unknown>(response: OpenRouterResponse<T>): string => {
    if (!response.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenRouter API')
    }
    return response.choices[0].message.content
  }

  // Public methods
  const generateResponse = async (
    messages: OpenRouterMessage[],
    options: Partial<OpenRouterRequestOptions> = {}
  ) => {
    const payload = buildRequestPayload(messages, options)
    const response = await executeRequest(payload)
    return parseResponse(response)
  }

  const generateStructuredResponse = async <T = unknown>(
    messages: OpenRouterMessage[],
    schema: Record<string, unknown>,
    options: Partial<OpenRouterRequestOptions> = {}
  ): Promise<T> => {
    const payload = buildRequestPayload(messages, {
      ...options,
      response_format: {
        type: 'json_object',
        schema,
      },
    })

    const response = await executeRequest<T>(payload)
    const jsonString = parseResponse(response)
    try {
      return JSON.parse(jsonString) as T
    } catch {
      throw new Error('Failed to parse structured response as JSON')
    }
  }

  return {
    state: readonly(state),
    generateResponse,
    generateStructuredResponse,
  }
}
