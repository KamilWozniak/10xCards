import type { AIGenerationResult } from '~/types/commands/generation-commands'
import { createOpenRouterService } from '~/services/openrouter/OpenRouterService'

const AI_MODEL = 'openai/gpt-4o-mini'

/**
 * System prompt for flashcard generation
 */
const FLASHCARD_GENERATION_SYSTEM_PROMPT = `Jesteś ekspertem w tworzeniu edukacyjnych fiszek do nauki metodą spaced repetition.

Twoim zadaniem jest przeanalizowanie dostarczonego tekstu edukacyjnego i wygenerowanie wysokiej jakości fiszek z pytaniami i odpowiedziami.

Wytyczne:
- Stwórz 2-5 fiszek w zależności od bogactwa treści
- Skup się na kluczowych konceptach, definicjach i ważnych faktach
- Pytania powinny być jasne, konkretne i sprawdzać zrozumienie
- Odpowiedzi powinny być zwięzłe ale kompletne
- Unikaj pytań tak/nie - preferuj pytania "co", "jak", "dlaczego"
- Każda fiszka powinna sprawdzać jeden koncept
- WAŻNE: Wszystkie pytania i odpowiedzi muszą być w języku polskim

Zwróć odpowiedź jako obiekt JSON o dokładnie takiej strukturze:
{
  "flashcards": [
    {"front": "treść pytania", "back": "treść odpowiedzi"}
  ]
}`

/**
 * JSON Schema for flashcard generation response
 * Follows JSON Schema specification for OpenAI structured outputs
 */
const FLASHCARD_SCHEMA = {
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
}

interface FlashcardGenerationResponse {
  flashcards: Array<{
    front: string
    back: string
  }>
}

/**
 * AI Service for flashcard generation
 *
 * Handles communication with OpenRouter API to generate flashcard proposals
 * from user-provided source text.
 */
export function createAIService() {
  const openRouterService = createOpenRouterService({
    defaultModel: AI_MODEL,
    temperature: 0.7,
    maxTokens: 2000,
  })

  return {
    /**
     * Generate flashcard proposals from source text using AI
     *
     * @param sourceText - Educational text to generate flashcards from (1000-10000 chars)
     * @returns AIGenerationResult with flashcard proposals
     * @throws Error if generation fails
     */
    generateFlashcards: async (sourceText: string): Promise<AIGenerationResult> => {
      const messages = [
        {
          role: 'system' as const,
          content: FLASHCARD_GENERATION_SYSTEM_PROMPT,
        },
        {
          role: 'user' as const,
          content: `Generate flashcards from the following educational text:\n\n${sourceText}`,
        },
      ]

      const response = await openRouterService.generateStructuredResponse<FlashcardGenerationResponse>(
        messages,
        'flashcard_generation',
        FLASHCARD_SCHEMA
      )

      return {
        proposals: response.flashcards,
        count: response.flashcards.length,
      }
    },

    /**
     * Get the current AI model name
     */
    getModel: (): string => openRouterService.getModel(),
  }
}
