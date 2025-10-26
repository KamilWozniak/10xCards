import { describe, it, expect, beforeEach, vi } from 'vitest'
import { FlashcardsService } from '../FlashcardsService'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'
import type {
  FlashcardCreateData,
  FlashcardDTO,
  FlashcardListQueryDTO,
  PaginatedFlashcardsResponseDTO,
} from '~/types/dto/types'

/**
 * Test suite for FlashcardsService
 *
 * Tests cover:
 * - Creating single and multiple flashcards
 * - Validating generation ownership
 * - Retrieving flashcards by user ID
 * - Retrieving a single flashcard by ID
 * - Retrieving paginated flashcards
 * - Error handling for all operations
 */

describe('FlashcardsService', () => {
  // Mock data
  const mockUserId = 'user-123'
  const mockFlashcardData: FlashcardCreateData = {
    front: 'Test Front',
    back: 'Test Back',
    source: 'manual',
    generation_id: 1,
  }
  const mockFlashcardDTO: FlashcardDTO = {
    id: 1,
    front: 'Test Front',
    back: 'Test Back',
    source: 'manual',
    generation_id: 1,
    user_id: mockUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Mock Supabase client
  let mockSupabase: any
  let service: FlashcardsService

  beforeEach(() => {
    // Create a comprehensive mock that supports method chaining and awaiting
    mockSupabase = {
      from: vi.fn(),
      insert: vi.fn(),
      select: vi.fn(),
      eq: vi.fn(),
      in: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      range: vi.fn(),
      single: vi.fn(),
      then: vi.fn(), // For Promise-like behavior
    }

    // Make all methods return the same chainable object by default
    mockSupabase.from.mockReturnValue(mockSupabase)
    mockSupabase.insert.mockReturnValue(mockSupabase)
    mockSupabase.select.mockReturnValue(mockSupabase)
    mockSupabase.eq.mockReturnValue(mockSupabase)
    mockSupabase.in.mockReturnValue(mockSupabase)
    mockSupabase.order.mockReturnValue(mockSupabase)
    mockSupabase.limit.mockReturnValue(mockSupabase)
    mockSupabase.range.mockReturnValue(mockSupabase)
    mockSupabase.single.mockReturnValue(mockSupabase)

    // Make the mock awaitable by implementing then method
    mockSupabase.then.mockImplementation((resolve: any) => {
      return Promise.resolve({ data: [mockFlashcardDTO], error: null }).then(resolve)
    })

    // Create service with mock
    service = new FlashcardsService(mockSupabase as unknown as SupabaseClient<Database>)
  })

  describe('create', () => {
    it('should create a single flashcard successfully', async () => {
      // Setup mock response
      mockSupabase.single.mockResolvedValue({ data: mockFlashcardDTO, error: null })

      // Execute method
      const result = await service.create(mockFlashcardData, mockUserId)

      // Verify result
      expect(result).toEqual(mockFlashcardDTO)

      // Verify method calls
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcards')
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        ...mockFlashcardData,
        user_id: mockUserId,
      })
      expect(mockSupabase.select).toHaveBeenCalled()
      expect(mockSupabase.single).toHaveBeenCalled()
    })

    it('should throw error when creation fails', async () => {
      // Setup mock response
      const mockError = { message: 'Database error' }
      mockSupabase.single.mockResolvedValue({ data: null, error: mockError })

      // Execute and verify
      await expect(service.create(mockFlashcardData, mockUserId)).rejects.toThrow(
        'Failed to create flashcard: Database error'
      )

      // Verify method calls
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcards')
      expect(mockSupabase.insert).toHaveBeenCalled()
    })

    it('should throw error when no data is returned', async () => {
      // Setup mock response
      mockSupabase.single.mockResolvedValue({ data: null, error: null })

      // Execute and verify
      await expect(service.create(mockFlashcardData, mockUserId)).rejects.toThrow(
        'No flashcard was created'
      )
    })
  })

  describe('createMultiple', () => {
    const mockFlashcardsData = [mockFlashcardData, mockFlashcardData]
    const mockFlashcardsDTO = [mockFlashcardDTO, mockFlashcardDTO]

    it('should create multiple flashcards successfully', async () => {
      // Setup mock response
      mockSupabase.select.mockResolvedValue({ data: mockFlashcardsDTO, error: null })

      // Execute method
      const result = await service.createMultiple(mockFlashcardsData, mockUserId)

      // Verify result
      expect(result).toEqual(mockFlashcardsDTO)

      // Verify method calls
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcards')
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        mockFlashcardsData.map(f => ({ ...f, user_id: mockUserId }))
      )
      expect(mockSupabase.select).toHaveBeenCalled()
    })

    it('should throw error when multiple creation fails', async () => {
      // Setup mock response
      const mockError = { message: 'Database error' }
      mockSupabase.select.mockResolvedValue({ data: null, error: mockError })

      // Execute and verify
      await expect(service.createMultiple(mockFlashcardsData, mockUserId)).rejects.toThrow(
        'Failed to create flashcards: Database error'
      )
    })

    it('should throw error when empty array is returned', async () => {
      // Setup mock response
      mockSupabase.select.mockResolvedValue({ data: [], error: null })

      // Execute and verify
      await expect(service.createMultiple(mockFlashcardsData, mockUserId)).rejects.toThrow(
        'No flashcards were created'
      )
    })
  })

  describe('validateGenerationOwnership', () => {
    it('should return true for valid ownership', async () => {
      // Setup mock response
      const mockGenerationData = { id: 1, user_id: mockUserId }
      mockSupabase.single.mockResolvedValue({ data: mockGenerationData, error: null })

      // Execute method
      const result = await service.validateGenerationOwnership(1, mockUserId)

      // Verify result
      expect(result).toBe(true)

      // Verify method calls
      expect(mockSupabase.from).toHaveBeenCalledWith('generations')
      expect(mockSupabase.select).toHaveBeenCalledWith('id, user_id')
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 1)
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
      expect(mockSupabase.single).toHaveBeenCalled()
    })

    it('should return false when generation not found', async () => {
      // Setup mock response
      const mockError = { code: 'PGRST116', message: 'Not found' }
      mockSupabase.single.mockResolvedValue({ data: null, error: mockError })

      // Execute method
      const result = await service.validateGenerationOwnership(999, mockUserId)

      // Verify result
      expect(result).toBe(false)
    })

    it('should throw error for other database failures', async () => {
      // Setup mock response
      const mockError = { code: 'OTHER', message: 'Database error' }
      mockSupabase.single.mockResolvedValue({ data: null, error: mockError })

      // Execute and verify
      await expect(service.validateGenerationOwnership(1, mockUserId)).rejects.toThrow(
        'Failed to validate generation ownership: Database error'
      )
    })
  })

  describe('validateMultipleGenerationOwnership', () => {
    it('should return array of valid generation ids', async () => {
      // Setup mock response
      const validGenerations = [{ id: 1 }]
      mockSupabase.eq.mockResolvedValue({ data: validGenerations, error: null })

      // Execute method
      const generationIds = [1, 2]
      const result = await service.validateMultipleGenerationOwnership(generationIds, mockUserId)

      // Verify result
      expect(result).toEqual([1])

      // Verify method calls
      expect(mockSupabase.from).toHaveBeenCalledWith('generations')
      expect(mockSupabase.select).toHaveBeenCalledWith('id')
      expect(mockSupabase.in).toHaveBeenCalledWith('id', generationIds)
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
    })

    it('should return empty array when no valid generations', async () => {
      // Setup mock response
      mockSupabase.eq.mockResolvedValue({ data: [], error: null })

      // Execute method
      const result = await service.validateMultipleGenerationOwnership([1], mockUserId)

      // Verify result
      expect(result).toEqual([])
    })

    it('should throw error when validation fails', async () => {
      // Setup mock response
      const mockError = { message: 'Database error' }
      mockSupabase.eq.mockResolvedValue({ data: null, error: mockError })

      // Execute and verify
      await expect(service.validateMultipleGenerationOwnership([1], mockUserId)).rejects.toThrow(
        'Failed to validate generation ownership: Database error'
      )
    })
  })

  describe('getByUserId', () => {
    it('should get flashcards by user id without options', async () => {
      // Setup mock response - override the default then implementation
      mockSupabase.then.mockImplementationOnce((resolve: any) => {
        return Promise.resolve({ data: [mockFlashcardDTO], error: null }).then(resolve)
      })

      // Execute method
      const result = await service.getByUserId(mockUserId)

      // Verify result
      expect(result).toEqual([mockFlashcardDTO])

      // Verify method calls
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcards')
      expect(mockSupabase.select).toHaveBeenCalledWith('*')
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false })
    })

    it('should get flashcards with source filter', async () => {
      // Setup mock response
      mockSupabase.then.mockImplementationOnce((resolve: any) => {
        return Promise.resolve({ data: [mockFlashcardDTO], error: null }).then(resolve)
      })

      // Execute method
      const options = { source: 'manual' }
      await service.getByUserId(mockUserId, options)

      // Verify method calls - should be called twice (once for user_id, once for source)
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
      expect(mockSupabase.eq).toHaveBeenCalledWith('source', 'manual')
    })

    it('should get flashcards with generationId filter', async () => {
      // Setup mock response
      mockSupabase.then.mockImplementationOnce((resolve: any) => {
        return Promise.resolve({ data: [mockFlashcardDTO], error: null }).then(resolve)
      })

      // Execute method
      const options = { generationId: 1 }
      await service.getByUserId(mockUserId, options)

      // Verify method calls
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
      expect(mockSupabase.eq).toHaveBeenCalledWith('generation_id', 1)
    })

    it('should get flashcards with limit', async () => {
      // Setup mock response
      mockSupabase.then.mockImplementationOnce((resolve: any) => {
        return Promise.resolve({ data: [mockFlashcardDTO], error: null }).then(resolve)
      })

      // Execute method
      const options = { limit: 5 }
      await service.getByUserId(mockUserId, options)

      // Verify method calls
      expect(mockSupabase.limit).toHaveBeenCalledWith(5)
    })

    it('should get flashcards with offset', async () => {
      // Setup mock response
      mockSupabase.then.mockImplementationOnce((resolve: any) => {
        return Promise.resolve({ data: [mockFlashcardDTO], error: null }).then(resolve)
      })

      // Execute method
      const options = { offset: 10, limit: 5 }
      await service.getByUserId(mockUserId, options)

      // Verify method calls
      expect(mockSupabase.range).toHaveBeenCalledWith(10, 14)
    })

    it('should throw error when fetching fails', async () => {
      // Setup mock response
      const mockError = { message: 'Database error' }
      mockSupabase.then.mockImplementationOnce((resolve: any) => {
        return Promise.resolve({ data: null, error: mockError }).then(resolve)
      })

      // Execute and verify
      await expect(service.getByUserId(mockUserId)).rejects.toThrow(
        'Failed to get flashcards: Database error'
      )
    })

    it('should return empty array when no flashcards found', async () => {
      // Setup mock response
      mockSupabase.then.mockImplementationOnce((resolve: any) => {
        return Promise.resolve({ data: null, error: null }).then(resolve)
      })

      // Execute method
      const result = await service.getByUserId(mockUserId)

      // Verify result
      expect(result).toEqual([])
    })
  })

  describe('getById', () => {
    it('should get flashcard by id successfully', async () => {
      // Setup mock response
      mockSupabase.single.mockResolvedValue({ data: mockFlashcardDTO, error: null })

      // Execute method
      const result = await service.getById(1, mockUserId)

      // Verify result
      expect(result).toEqual(mockFlashcardDTO)

      // Verify method calls
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcards')
      expect(mockSupabase.select).toHaveBeenCalledWith('*')
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 1)
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
      expect(mockSupabase.single).toHaveBeenCalled()
    })

    it('should return null when flashcard not found', async () => {
      // Setup mock response
      const mockError = { code: 'PGRST116', message: 'Not found' }
      mockSupabase.single.mockResolvedValue({ data: null, error: mockError })

      // Execute method
      const result = await service.getById(999, mockUserId)

      // Verify result
      expect(result).toBeNull()
    })

    it('should throw error for database failures', async () => {
      // Setup mock response
      const mockError = { code: 'OTHER', message: 'Database error' }
      mockSupabase.single.mockResolvedValue({ data: null, error: mockError })

      // Execute and verify
      await expect(service.getById(1, mockUserId)).rejects.toThrow(
        'Failed to get flashcard: Database error'
      )
    })
  })

  describe('getPaginatedFlashcards', () => {
    const mockFlashcards = [mockFlashcardDTO, mockFlashcardDTO]
    const mockPaginatedResponse: PaginatedFlashcardsResponseDTO = {
      data: mockFlashcards,
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
      },
    }

    it('should get paginated flashcards with default values', async () => {
      // Setup mock response
      mockSupabase.range.mockResolvedValue({
        data: mockFlashcards,
        error: null,
        count: 25,
      })

      // Execute method
      const query: FlashcardListQueryDTO = {}
      const result = await service.getPaginatedFlashcards(mockUserId, query)

      // Verify result
      expect(result).toEqual(mockPaginatedResponse)

      // Verify method calls
      expect(mockSupabase.from).toHaveBeenCalledWith('flashcards')
      expect(mockSupabase.select).toHaveBeenCalledWith('*', { count: 'exact' })
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
      expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9) // page 1, limit 10 (0-9)
    })

    it('should get paginated flashcards with custom page and limit', async () => {
      // Setup mock response
      mockSupabase.range.mockResolvedValue({
        data: mockFlashcards,
        error: null,
        count: 25,
      })

      // Execute method
      const query: FlashcardListQueryDTO = { page: 2, limit: 5 }
      const result = await service.getPaginatedFlashcards(mockUserId, query)

      // Verify result
      expect(result).toEqual({
        ...mockPaginatedResponse,
        pagination: { page: 2, limit: 5, total: 25 },
      })

      // Verify method calls
      expect(mockSupabase.range).toHaveBeenCalledWith(5, 9) // page 2, limit 5 (5-9)
    })

    it('should cap limit at 100', async () => {
      // Setup mock response
      mockSupabase.range.mockResolvedValue({
        data: mockFlashcards,
        error: null,
        count: 25,
      })

      // Execute method
      const query: FlashcardListQueryDTO = { limit: 200 }
      const result = await service.getPaginatedFlashcards(mockUserId, query)

      // Verify result
      expect(result.pagination.limit).toBe(100)

      // Verify method calls
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 99) // limit capped at 100
    })

    it('should handle null count from database', async () => {
      // Setup mock response
      mockSupabase.range.mockResolvedValue({
        data: mockFlashcards,
        error: null,
        count: null,
      })

      // Execute method
      const query: FlashcardListQueryDTO = {}
      const result = await service.getPaginatedFlashcards(mockUserId, query)

      // Verify result
      expect(result.pagination.total).toBe(0)
    })

    it('should handle empty data array', async () => {
      // Setup mock response
      mockSupabase.range.mockResolvedValue({
        data: null,
        error: null,
        count: 0,
      })

      // Execute method
      const query: FlashcardListQueryDTO = {}
      const result = await service.getPaginatedFlashcards(mockUserId, query)

      // Verify result
      expect(result.data).toEqual([])
      expect(result.pagination.total).toBe(0)
    })

    it('should throw error when database query fails', async () => {
      // Setup mock response
      const mockError = { message: 'Database error' }
      mockSupabase.range.mockResolvedValue({
        data: null,
        error: mockError,
        count: null,
      })

      // Execute and verify
      const query: FlashcardListQueryDTO = {}
      await expect(service.getPaginatedFlashcards(mockUserId, query)).rejects.toThrow(
        'Failed to get paginated flashcards: Database error'
      )
    })
  })
})
