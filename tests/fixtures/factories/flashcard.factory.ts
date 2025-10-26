/**
 * Flashcard test data factory
 * Uses @faker-js/faker to generate realistic test data
 */

import { faker } from '@faker-js/faker'
import type { Database } from '~/types/database/database.types'

type Flashcard = Database['public']['Tables']['flashcards']['Row']

export interface FlashcardFactoryOptions {
  front?: string
  back?: string
  source?: 'manual' | 'ai_generated'
  user_id?: string
  generation_id?: number | null
  created_at?: string
  updated_at?: string
}

/**
 * Creates a mock flashcard with realistic data
 *
 * @example
 * ```typescript
 * const flashcard = createMockFlashcard()
 * const customFlashcard = createMockFlashcard({
 *   front: 'Custom question',
 *   back: 'Custom answer'
 * })
 * ```
 */
export function createMockFlashcard(overrides: FlashcardFactoryOptions = {}): Flashcard {
  const now = new Date().toISOString()

  return {
    id: faker.number.int({ min: 1, max: 999999 }),
    front: faker.lorem.sentence({ min: 5, max: 15 }),
    back: faker.lorem.paragraph({ min: 1, max: 3 }),
    source: faker.helpers.arrayElement(['manual', 'ai_generated']),
    user_id: faker.string.uuid(),
    generation_id: null,
    created_at: faker.date.recent({ days: 30 }).toISOString(),
    updated_at: now,
    ...overrides,
  }
}

/**
 * Creates multiple mock flashcards
 *
 * @example
 * ```typescript
 * const flashcards = createMockFlashcards(5)
 * const customFlashcards = createMockFlashcards(3, { source: 'manual' })
 * ```
 */
export function createMockFlashcards(
  count: number,
  overrides: FlashcardFactoryOptions = {}
): Flashcard[] {
  return Array.from({ length: count }, () => createMockFlashcard(overrides))
}

/**
 * Creates a mock flashcard with AI generation data
 *
 * @example
 * ```typescript
 * const aiFlashcard = createMockAIFlashcard()
 * ```
 */
export function createMockAIFlashcard(overrides: FlashcardFactoryOptions = {}): Flashcard {
  return createMockFlashcard({
    source: 'ai_generated',
    generation_id: faker.number.int({ min: 1, max: 999999 }),
    ...overrides,
  })
}
