/**
 * Example test demonstrating @faker-js/faker usage
 * Shows how to generate realistic test data
 */

import { describe, it, expect } from 'vitest'
import { faker } from '@faker-js/faker'

describe('Faker.js Examples', () => {
  describe('Generating Test Data', () => {
    it('generates random user data', () => {
      const user = {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        avatar: faker.image.avatar(),
        createdAt: faker.date.past(),
      }

      expect(user.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
      expect(user.email).toContain('@')
      expect(user.firstName).toBeTruthy()
      expect(user.lastName).toBeTruthy()
      expect(user.createdAt).toBeInstanceOf(Date)
    })

    it('generates flashcard data', () => {
      const flashcard = {
        id: faker.string.uuid(),
        front: faker.lorem.sentence(),
        back: faker.lorem.paragraph(),
        tags: faker.helpers.arrayElements(
          ['javascript', 'vue', 'nuxt', 'testing'],
          { min: 1, max: 3 }
        ),
        difficulty: faker.helpers.arrayElement(['easy', 'medium', 'hard']),
      }

      expect(flashcard.front).toBeTruthy()
      expect(flashcard.back).toBeTruthy()
      expect(flashcard.tags.length).toBeGreaterThan(0)
      expect(['easy', 'medium', 'hard']).toContain(flashcard.difficulty)
    })
  })

  describe('Creating Test Collections', () => {
    it('generates multiple items', () => {
      const flashcards = Array.from({ length: 5 }, () => ({
        id: faker.string.uuid(),
        front: faker.lorem.sentence(),
        back: faker.lorem.paragraph(),
        createdAt: faker.date.recent({ days: 30 }),
      }))

      expect(flashcards).toHaveLength(5)
      expect(flashcards[0]).toHaveProperty('id')
      expect(flashcards[0]).toHaveProperty('front')
      expect(flashcards[0]).toHaveProperty('back')

      // Verify uniqueness
      const ids = flashcards.map((f) => f.id)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(5)
    })
  })

  describe('Faker Helpers', () => {
    it('picks random array elements', () => {
      const statuses = ['draft', 'published', 'archived']
      const status = faker.helpers.arrayElement(statuses)

      expect(statuses).toContain(status)
    })

    it('picks multiple random elements', () => {
      const tags = ['js', 'ts', 'vue', 'nuxt', 'react']
      const selectedTags = faker.helpers.arrayElements(tags, { min: 2, max: 4 })

      expect(selectedTags.length).toBeGreaterThanOrEqual(2)
      expect(selectedTags.length).toBeLessThanOrEqual(4)
      selectedTags.forEach((tag) => {
        expect(tags).toContain(tag)
      })
    })

    it('generates maybe values', () => {
      // 100% chance - for deterministic test
      const alwaysValue = faker.helpers.maybe(() => faker.lorem.word(), {
        probability: 1,
      })
      expect(typeof alwaysValue).toBe('string')

      // 0% chance - returns undefined
      const neverValue = faker.helpers.maybe(() => faker.lorem.word(), {
        probability: 0,
      })
      expect(neverValue).toBeUndefined()
    })
  })

  describe('Seeded Faker', () => {
    it('generates consistent data with seed', () => {
      // Seed for reproducible tests
      faker.seed(12345)
      const first = faker.person.firstName()

      faker.seed(12345)
      const second = faker.person.firstName()

      expect(first).toBe(second)
    })
  })
})

/**
 * Common Faker Methods for Testing:
 *
 * Strings:
 * - faker.string.uuid() - UUID
 * - faker.string.alphanumeric(10) - Random string
 *
 * Person:
 * - faker.person.firstName()
 * - faker.person.lastName()
 * - faker.person.fullName()
 *
 * Internet:
 * - faker.internet.email()
 * - faker.internet.url()
 * - faker.internet.password()
 *
 * Lorem:
 * - faker.lorem.word()
 * - faker.lorem.sentence()
 * - faker.lorem.paragraph()
 * - faker.lorem.text()
 *
 * Dates:
 * - faker.date.past()
 * - faker.date.future()
 * - faker.date.recent({ days: 30 })
 * - faker.date.between({ from: start, to: end })
 *
 * Numbers:
 * - faker.number.int({ min: 1, max: 100 })
 * - faker.number.float({ min: 0, max: 1, fractionDigits: 2 })
 *
 * Helpers:
 * - faker.helpers.arrayElement(array)
 * - faker.helpers.arrayElements(array, { min, max })
 * - faker.helpers.maybe(() => value, { probability: 0.5 })
 */
