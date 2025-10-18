import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useGenerationState } from '../useGenerationState'
import type {
  CreateGenerationResponseDTO,
  FlashcardProposalDTO,
  CreateFlashcardsRequestDTO,
} from '~/types/dto/types'
import type { FlashcardProposalViewModel } from '~/types/views/generate.types'

/**
 * Test suite for useGenerationState composable
 *
 * Tests cover:
 * - Initial state
 * - State management methods
 * - Computed properties
 * - API integration (generateFlashcards)
 * - Saving flashcards
 * - Error handling
 * - Edge cases and business rules
 */

describe('useGenerationState', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Mock $fetch before each test
    mockFetch = vi.fn()
    vi.stubGlobal('$fetch', mockFetch)

    // Mock console.error to avoid noise in test output
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('Initial state', () => {
    it('should initialize with default state values', () => {
      const { generationState } = useGenerationState()

      expect(generationState.value.isLoading).toBe(false)
      expect(generationState.value.error).toBeNull()
      expect(generationState.value.proposals).toEqual([])
      expect(generationState.value.generationId).toBeNull()
    })
  })

  describe('Computed properties', () => {
    it('should calculate hasProposals correctly when proposals exist', () => {
      const { generationState, hasProposals } = useGenerationState()

      generationState.value.proposals = [
        {
          id: 'test-1',
          front: 'Front',
          back: 'Back',
          source: 'ai-full',
          isAccepted: false,
          isRejected: false,
          isEdited: false,
        },
      ]

      expect(hasProposals.value).toBe(true)
    })

    it('should calculate hasProposals correctly when proposals are empty', () => {
      const { hasProposals } = useGenerationState()

      expect(hasProposals.value).toBe(false)
    })

    it('should calculate hasError correctly when error exists', () => {
      const { generationState, hasError } = useGenerationState()

      generationState.value.error = 'Test error'

      expect(hasError.value).toBe(true)
    })

    it('should calculate hasError correctly when error is null', () => {
      const { hasError } = useGenerationState()

      expect(hasError.value).toBe(false)
    })

    it('should calculate isGenerating correctly when loading', () => {
      const { generationState, isGenerating } = useGenerationState()

      generationState.value.isLoading = true

      expect(isGenerating.value).toBe(true)
    })

    it('should calculate isGenerating correctly when not loading', () => {
      const { isGenerating } = useGenerationState()

      expect(isGenerating.value).toBe(false)
    })
  })

  describe('State management methods', () => {
    it('should clear error', () => {
      const { generationState, clearError } = useGenerationState()

      generationState.value.error = 'Test error'
      clearError()

      expect(generationState.value.error).toBeNull()
    })

    it('should reset state to initial values', () => {
      const { generationState, resetState } = useGenerationState()

      // Modify state
      generationState.value.isLoading = true
      generationState.value.error = 'Test error'
      generationState.value.proposals = [
        {
          id: 'test-1',
          front: 'Front',
          back: 'Back',
          source: 'ai-full',
          isAccepted: false,
          isRejected: false,
          isEdited: false,
        },
      ]
      generationState.value.generationId = 123

      // Reset
      resetState()

      expect(generationState.value.isLoading).toBe(false)
      expect(generationState.value.error).toBeNull()
      expect(generationState.value.proposals).toEqual([])
      expect(generationState.value.generationId).toBeNull()
    })
  })

  describe('generateFlashcards - Success scenarios', () => {
    it('should generate flashcards successfully and transform DTOs to ViewModels', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      const mockResponse: CreateGenerationResponseDTO = {
        generation_id: 42,
        flashcards_proposals: [
          { front: 'Question 1', back: 'Answer 1', source: 'ai-full' },
          { front: 'Question 2', back: 'Answer 2', source: 'ai-full' },
        ],
        generated_count: 2,
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const sourceText = 'A'.repeat(1000)
      await generateFlashcards(sourceText)

      // Verify state updates
      expect(generationState.value.isLoading).toBe(false)
      expect(generationState.value.error).toBeNull()
      expect(generationState.value.generationId).toBe(42)
      expect(generationState.value.proposals).toHaveLength(2)

      // Verify proposal structure
      const proposal1 = generationState.value.proposals[0]
      expect(proposal1.front).toBe('Question 1')
      expect(proposal1.back).toBe('Answer 1')
      expect(proposal1.source).toBe('ai-full')
      expect(proposal1.isAccepted).toBe(false)
      expect(proposal1.isRejected).toBe(false)
      expect(proposal1.isEdited).toBe(false)
      expect(proposal1.id).toMatch(/^proposal-0-\d+$/)
    })

    it('should send correct request payload to API', async () => {
      const { generateFlashcards } = useGenerationState()

      const mockResponse: CreateGenerationResponseDTO = {
        generation_id: 1,
        flashcards_proposals: [],
        generated_count: 0,
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      const sourceText = 'A'.repeat(1500)
      await generateFlashcards(sourceText)

      expect(mockFetch).toHaveBeenCalledWith('/api/generations', {
        method: 'POST',
        body: {
          source_text: sourceText,
        },
      })
    })

    it('should handle empty proposals array from API', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      const mockResponse: CreateGenerationResponseDTO = {
        generation_id: 99,
        flashcards_proposals: [],
        generated_count: 0,
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      await generateFlashcards('A'.repeat(1000))

      expect(generationState.value.proposals).toEqual([])
      expect(generationState.value.generationId).toBe(99)
      expect(generationState.value.error).toBeNull()
    })

    it('should clear previous error before generating new flashcards', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      // Set initial error
      generationState.value.error = 'Previous error'

      const mockResponse: CreateGenerationResponseDTO = {
        generation_id: 1,
        flashcards_proposals: [],
        generated_count: 0,
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      await generateFlashcards('A'.repeat(1000))

      expect(generationState.value.error).toBeNull()
    })

    it('should generate unique IDs for each proposal', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      const mockResponse: CreateGenerationResponseDTO = {
        generation_id: 1,
        flashcards_proposals: [
          { front: 'Q1', back: 'A1', source: 'ai-full' },
          { front: 'Q2', back: 'A2', source: 'ai-full' },
          { front: 'Q3', back: 'A3', source: 'ai-full' },
        ],
        generated_count: 3,
      }

      mockFetch.mockResolvedValueOnce(mockResponse)

      await generateFlashcards('A'.repeat(1000))

      const ids = generationState.value.proposals.map(p => p.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(3)
      expect(ids).toHaveLength(3)
    })
  })

  describe('generateFlashcards - Loading state management', () => {
    it('should set loading to true during API call', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      let loadingDuringCall = false

      mockFetch.mockImplementationOnce(async () => {
        loadingDuringCall = generationState.value.isLoading
        return {
          generation_id: 1,
          flashcards_proposals: [],
          generated_count: 0,
        }
      })

      await generateFlashcards('A'.repeat(1000))

      expect(loadingDuringCall).toBe(true)
      expect(generationState.value.isLoading).toBe(false)
    })

    it('should set loading to false after successful generation', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      mockFetch.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [],
        generated_count: 0,
      })

      await generateFlashcards('A'.repeat(1000))

      expect(generationState.value.isLoading).toBe(false)
    })

    it('should set loading to false after error', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      await generateFlashcards('A'.repeat(1000))

      expect(generationState.value.isLoading).toBe(false)
    })
  })

  describe('generateFlashcards - Error handling', () => {
    it('should handle API error with error.data.error', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      const apiError = {
        data: { error: 'API rate limit exceeded' },
        message: 'Fetch failed',
      }

      mockFetch.mockRejectedValueOnce(apiError)

      await generateFlashcards('A'.repeat(1000))

      expect(generationState.value.error).toBe('API rate limit exceeded')
      expect(generationState.value.proposals).toEqual([])
      expect(generationState.value.generationId).toBeNull()
    })

    it('should handle API error with error.message', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      const error = new Error('Network timeout')

      mockFetch.mockRejectedValueOnce(error)

      await generateFlashcards('A'.repeat(1000))

      expect(generationState.value.error).toBe('Network timeout')
    })

    it('should handle error without message or data', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      mockFetch.mockRejectedValueOnce({})

      await generateFlashcards('A'.repeat(1000))

      expect(generationState.value.error).toBe('Wystąpił błąd podczas generowania fiszek')
    })

    it('should preserve proposals from previous successful generation after error', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      // First successful generation
      mockFetch.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ front: 'Q1', back: 'A1', source: 'ai-full' }],
        generated_count: 1,
      })

      await generateFlashcards('A'.repeat(1000))
      const previousProposals = [...generationState.value.proposals]

      // Second generation fails
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      await generateFlashcards('A'.repeat(1000))

      // Proposals should remain from first generation
      expect(generationState.value.proposals).toEqual(previousProposals)
    })
  })

  describe('saveFlashcards - Success scenarios', () => {
    it('should save selected flashcards successfully', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      const proposals: FlashcardProposalViewModel[] = [
        {
          id: 'test-1',
          front: 'Question 1',
          back: 'Answer 1',
          source: 'ai-full',
          isAccepted: true,
          isRejected: false,
          isEdited: false,
        },
        {
          id: 'test-2',
          front: 'Question 2',
          back: 'Answer 2',
          source: 'ai-edited',
          isAccepted: true,
          isRejected: false,
          isEdited: true,
        },
      ]

      mockFetch.mockResolvedValueOnce({ flashcards: [] })

      await saveFlashcards(proposals, 42)

      expect(generationState.value.isLoading).toBe(false)
      expect(generationState.value.error).toBeNull()
    })

    it('should send correct request payload to API', async () => {
      const { saveFlashcards } = useGenerationState()

      const proposals: FlashcardProposalViewModel[] = [
        {
          id: 'test-1',
          front: 'Front 1',
          back: 'Back 1',
          source: 'ai-full',
          isAccepted: true,
          isRejected: false,
          isEdited: false,
        },
      ]

      mockFetch.mockResolvedValueOnce({ flashcards: [] })

      await saveFlashcards(proposals, 99)

      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards', {
        method: 'POST',
        body: {
          flashcards: [
            {
              front: 'Front 1',
              back: 'Back 1',
              source: 'ai-full',
              generation_id: 99,
            },
          ],
        },
      })
    })

    it('should transform ViewModels to DTOs correctly', async () => {
      const { saveFlashcards } = useGenerationState()

      const proposals: FlashcardProposalViewModel[] = [
        {
          id: 'test-1',
          front: 'Q1',
          back: 'A1',
          source: 'ai-full',
          isAccepted: true,
          isRejected: false,
          isEdited: false,
        },
        {
          id: 'test-2',
          front: 'Q2',
          back: 'A2',
          source: 'ai-edited',
          isAccepted: false,
          isRejected: false,
          isEdited: true,
        },
      ]

      mockFetch.mockResolvedValueOnce({ flashcards: [] })

      await saveFlashcards(proposals, 123)

      const callArgs = mockFetch.mock.calls[0]
      const requestBody = callArgs[1]?.body as CreateFlashcardsRequestDTO

      expect(requestBody.flashcards).toHaveLength(2)
      expect(requestBody.flashcards[0]).toEqual({
        front: 'Q1',
        back: 'A1',
        source: 'ai-full',
        generation_id: 123,
      })
      expect(requestBody.flashcards[1]).toEqual({
        front: 'Q2',
        back: 'A2',
        source: 'ai-edited',
        generation_id: 123,
      })
    })

    it('should reset state after successful save', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      // Set up initial state
      generationState.value.proposals = [
        {
          id: 'test-1',
          front: 'Q1',
          back: 'A1',
          source: 'ai-full',
          isAccepted: true,
          isRejected: false,
          isEdited: false,
        },
      ]
      generationState.value.generationId = 42
      generationState.value.error = null

      mockFetch.mockResolvedValueOnce({ flashcards: [] })

      await saveFlashcards(generationState.value.proposals, 42)

      // Verify state was reset
      expect(generationState.value.isLoading).toBe(false)
      expect(generationState.value.error).toBeNull()
      expect(generationState.value.proposals).toEqual([])
      expect(generationState.value.generationId).toBeNull()
    })

    it('should handle saving empty array of proposals', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      mockFetch.mockResolvedValueOnce({ flashcards: [] })

      await saveFlashcards([], 42)

      expect(mockFetch).toHaveBeenCalledWith('/api/flashcards', {
        method: 'POST',
        body: {
          flashcards: [],
        },
      })
      expect(generationState.value.error).toBeNull()
    })

    it('should clear previous error before saving', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      generationState.value.error = 'Previous error'

      mockFetch.mockResolvedValueOnce({ flashcards: [] })

      await saveFlashcards([], 42)

      expect(generationState.value.error).toBeNull()
    })
  })

  describe('saveFlashcards - Loading state management', () => {
    it('should set loading to true during API call', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      let loadingDuringCall = false

      mockFetch.mockImplementationOnce(async () => {
        loadingDuringCall = generationState.value.isLoading
        return { flashcards: [] }
      })

      await saveFlashcards([], 42)

      expect(loadingDuringCall).toBe(true)
      expect(generationState.value.isLoading).toBe(false)
    })

    it('should set loading to false after successful save', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      mockFetch.mockResolvedValueOnce({ flashcards: [] })

      await saveFlashcards([], 42)

      expect(generationState.value.isLoading).toBe(false)
    })

    it('should set loading to false after error', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      await saveFlashcards([], 42)

      expect(generationState.value.isLoading).toBe(false)
    })
  })

  describe('saveFlashcards - Error handling', () => {
    it('should handle API error with error.data.error', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      const apiError = {
        data: { error: 'Database connection failed' },
        message: 'Fetch failed',
      }

      mockFetch.mockRejectedValueOnce(apiError)

      await saveFlashcards([], 42)

      expect(generationState.value.error).toBe('Database connection failed')
    })

    it('should handle API error with error.message', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      const error = new Error('Network error')

      mockFetch.mockRejectedValueOnce(error)

      await saveFlashcards([], 42)

      expect(generationState.value.error).toBe('Network error')
    })

    it('should handle error without message or data', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      mockFetch.mockRejectedValueOnce({})

      await saveFlashcards([], 42)

      expect(generationState.value.error).toBe('Wystąpił błąd podczas zapisywania fiszek')
    })

    it('should not reset state after failed save', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      // Set up initial state
      const initialProposals = [
        {
          id: 'test-1',
          front: 'Q1',
          back: 'A1',
          source: 'ai-full' as const,
          isAccepted: true,
          isRejected: false,
          isEdited: false,
        },
      ]

      generationState.value.proposals = initialProposals
      generationState.value.generationId = 42

      mockFetch.mockRejectedValueOnce(new Error('Save failed'))

      await saveFlashcards(initialProposals, 42)

      // Verify state was NOT reset (except for loading and error)
      expect(generationState.value.proposals).toEqual(initialProposals)
      expect(generationState.value.generationId).toBe(42)
      expect(generationState.value.error).toBe('Save failed')
    })
  })

  describe('Business rules and edge cases', () => {
    it('should handle multiple generate calls in sequence', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      // First generation
      mockFetch.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ front: 'Q1', back: 'A1', source: 'ai-full' }],
        generated_count: 1,
      })

      await generateFlashcards('A'.repeat(1000))
      expect(generationState.value.generationId).toBe(1)
      expect(generationState.value.proposals).toHaveLength(1)

      // Second generation (should replace first)
      mockFetch.mockResolvedValueOnce({
        generation_id: 2,
        flashcards_proposals: [
          { front: 'Q2', back: 'A2', source: 'ai-full' },
          { front: 'Q3', back: 'A3', source: 'ai-full' },
        ],
        generated_count: 2,
      })

      await generateFlashcards('B'.repeat(1000))
      expect(generationState.value.generationId).toBe(2)
      expect(generationState.value.proposals).toHaveLength(2)
      expect(generationState.value.proposals[0].front).toBe('Q2')
    })

    it('should handle large number of proposals', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      const proposals: FlashcardProposalDTO[] = Array.from({ length: 100 }, (_, i) => ({
        front: `Question ${i + 1}`,
        back: `Answer ${i + 1}`,
        source: 'ai-full' as const,
      }))

      mockFetch.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: proposals,
        generated_count: 100,
      })

      await generateFlashcards('A'.repeat(10000))

      expect(generationState.value.proposals).toHaveLength(100)
      expect(generationState.value.proposals[0].front).toBe('Question 1')
      expect(generationState.value.proposals[99].front).toBe('Question 100')
    })

    it('should maintain proposal order from API response', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      const proposals: FlashcardProposalDTO[] = [
        { front: 'First', back: 'A1', source: 'ai-full' },
        { front: 'Second', back: 'A2', source: 'ai-full' },
        { front: 'Third', back: 'A3', source: 'ai-full' },
      ]

      mockFetch.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: proposals,
        generated_count: 3,
      })

      await generateFlashcards('A'.repeat(1000))

      expect(generationState.value.proposals[0].front).toBe('First')
      expect(generationState.value.proposals[1].front).toBe('Second')
      expect(generationState.value.proposals[2].front).toBe('Third')
    })

    it('should handle special characters in flashcard content', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      const specialContent = {
        front: 'What is 2 + 2? <script>alert("xss")</script>',
        back: 'Answer: "4" & \'four\' \n\t special chars: é ñ ü',
      }

      mockFetch.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ ...specialContent, source: 'ai-full' }],
        generated_count: 1,
      })

      await generateFlashcards('A'.repeat(1000))

      expect(generationState.value.proposals[0].front).toBe(specialContent.front)
      expect(generationState.value.proposals[0].back).toBe(specialContent.back)
    })

    it('should handle concurrent save operations gracefully', async () => {
      const { saveFlashcards, generationState } = useGenerationState()

      const proposals: FlashcardProposalViewModel[] = [
        {
          id: 'test-1',
          front: 'Q1',
          back: 'A1',
          source: 'ai-full',
          isAccepted: true,
          isRejected: false,
          isEdited: false,
        },
      ]

      // Mock delayed response
      mockFetch.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ flashcards: [] }), 100))
      )

      // Start two save operations
      const save1 = saveFlashcards(proposals, 42)
      const save2 = saveFlashcards(proposals, 42)

      await Promise.all([save1, save2])

      // Both should complete without error
      expect(generationState.value.error).toBeNull()
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should preserve type safety for source field', async () => {
      const { generateFlashcards, generationState } = useGenerationState()

      mockFetch.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ front: 'Q1', back: 'A1', source: 'ai-full' }],
        generated_count: 1,
      })

      await generateFlashcards('A'.repeat(1000))

      const proposal = generationState.value.proposals[0]

      // TypeScript should ensure source is only 'ai-full' or 'ai-edited'
      expect(proposal.source).toBe('ai-full')

      // This ensures the type constraint is maintained
      const validSources: ('ai-full' | 'ai-edited')[] = ['ai-full', 'ai-edited']
      expect(validSources).toContain(proposal.source)
    })
  })

  describe('Reactivity', () => {
    it('should trigger computed updates when proposals change', async () => {
      const { generateFlashcards, hasProposals } = useGenerationState()

      expect(hasProposals.value).toBe(false)

      mockFetch.mockResolvedValueOnce({
        generation_id: 1,
        flashcards_proposals: [{ front: 'Q1', back: 'A1', source: 'ai-full' }],
        generated_count: 1,
      })

      await generateFlashcards('A'.repeat(1000))

      expect(hasProposals.value).toBe(true)
    })

    it('should trigger computed updates when error changes', () => {
      const { generationState, hasError } = useGenerationState()

      expect(hasError.value).toBe(false)

      generationState.value.error = 'Test error'

      expect(hasError.value).toBe(true)
    })

    it('should trigger computed updates when loading changes', () => {
      const { generationState, isGenerating } = useGenerationState()

      expect(isGenerating.value).toBe(false)

      generationState.value.isLoading = true

      expect(isGenerating.value).toBe(true)
    })
  })
})
