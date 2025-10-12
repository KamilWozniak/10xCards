import type { AIGenerationResult } from '~/types/commands/generation-commands'

/**
 * AI Service for flashcard generation
 *
 * Handles communication with OpenRouter API to generate flashcard proposals
 * from user-provided source text.
 */
export class AIService {
  private readonly apiKey: string
  private readonly apiUrl: string
  private readonly model: string
  private readonly timeout: number

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || ''
    this.apiUrl = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'
    this.model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
    this.timeout = 60000 // 60 seconds
  }

  /**
   * Generate flashcard proposals from source text using AI
   *
   * @param sourceText - Educational text to generate flashcards from (1000-10000 chars)
   * @returns AIGenerationResult with flashcard proposals
   * @throws AIServiceError if generation fails
   */
  async generateFlashcards(sourceText: string): Promise<AIGenerationResult> {
    // For development phase, return mock data
    // Real implementation will be added when integrating with OpenRouter
    return this.generateMockFlashcards(sourceText)
  }

  /**
   * Mock implementation for development
   * Simulates AI response without calling external API
   */
  private async generateMockFlashcards(sourceText: string): Promise<AIGenerationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate 2-5 mock flashcards based on source text length
    const count = Math.min(5, Math.max(2, Math.floor(sourceText.length / 1000)))

    const mockProposals = Array.from({ length: count }, (_, i) => ({
      front: `Mock Question ${i + 1} from provided text`,
      back: `Mock Answer ${i + 1} explaining the concept in detail`,
    }))

    return {
      proposals: mockProposals,
      count: mockProposals.length,
    }
  }

  /**
   * Get the current AI model name
   */
  getModel(): string {
    return this.model
  }
}

/**
 * Factory function to create AIService instance
 */
export function createAIService(): AIService {
  return new AIService()
}
