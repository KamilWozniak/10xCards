export interface OpenRouterConfig {
  defaultModel?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
}

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterRequestOptions {
  model?: string
  messages: OpenRouterMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  response_format?: {
    type: 'json_object'
    schema?: Record<string, unknown>
  }
}

export interface OpenRouterResponse<T = unknown> {
  id: string
  choices: Array<{
    message: {
      role: 'assistant'
      content: string
    }
    finish_reason: string
  }>
  model: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface OpenRouterError {
  error: {
    message: string
    type: string
    code?: string
    param?: string
  }
}

export type OpenRouterState = {
  isLoading: boolean
  error: OpenRouterError | null
  config: OpenRouterConfig
}
