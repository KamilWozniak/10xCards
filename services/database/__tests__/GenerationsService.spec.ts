import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'
import type { CreateGenerationCommand } from '~/types/commands/generation-commands'
import type { GenerationDTO } from '~/types/dto/types'
import { GenerationsService, createGenerationsService } from '../GenerationsService'

describe('GenerationsService', () => {
  let mockSupabase: SupabaseClient<Database>
  let service: GenerationsService

  beforeEach(() => {
    // Create typed mock for Supabase client
    mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>

    service = new GenerationsService(mockSupabase)
  })

  describe('create', () => {
    it('should successfully create a generation record', async () => {
      // Arrange
      const command: CreateGenerationCommand = {
        user_id: 'test-user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123hash',
        source_text_length: 5000,
        generated_count: 10,
        generation_duration: 2500,
      }

      const expectedResult: GenerationDTO = {
        id: 1,
        user_id: 'test-user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123hash',
        source_text_length: 5000,
        generated_count: 10,
        generation_duration: 2500,
        created_at: '2025-01-15T10:30:00Z',
        updated_at: '2025-01-15T10:30:00Z',
        accepted_edited_count: null,
        accepted_unedited_count: null,
      }

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: expectedResult,
          error: null,
        }),
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      const result = await service.create(command)

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('generations')
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: command.user_id,
        model: command.model,
        source_text_hash: command.source_text_hash,
        source_text_length: command.source_text_length,
        generated_count: command.generated_count,
        generation_duration: command.generation_duration,
      })
      expect(mockSelect).toHaveBeenCalled()
      expect(result).toEqual(expectedResult)
    })

    it('should throw error when database operation fails', async () => {
      // Arrange
      const command: CreateGenerationCommand = {
        user_id: 'test-user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123hash',
        source_text_length: 5000,
        generated_count: 10,
        generation_duration: 2500,
      }

      const mockError = {
        message: 'Database connection failed',
        code: 'DB_ERROR',
      }

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: mockError,
        }),
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act & Assert
      await expect(service.create(command)).rejects.toThrow(
        'Failed to create generation: Database connection failed'
      )
    })

    it('should throw error when no data is returned', async () => {
      // Arrange
      const command: CreateGenerationCommand = {
        user_id: 'test-user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123hash',
        source_text_length: 5000,
        generated_count: 10,
        generation_duration: 2500,
      }

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act & Assert
      await expect(service.create(command)).rejects.toThrow(
        'No data returned from generation insert'
      )
    })

    it('should handle generation with minimum required fields', async () => {
      // Arrange
      const command: CreateGenerationCommand = {
        user_id: 'user-456',
        model: 'claude-3',
        source_text_hash: 'xyz789',
        source_text_length: 1000,
        generated_count: 5,
        generation_duration: 1200,
      }

      const expectedResult: GenerationDTO = {
        id: 2,
        user_id: 'user-456',
        model: 'claude-3',
        source_text_hash: 'xyz789',
        source_text_length: 1000,
        generated_count: 5,
        generation_duration: 1200,
        created_at: '2025-01-15T11:00:00Z',
        updated_at: '2025-01-15T11:00:00Z',
        accepted_edited_count: null,
        accepted_unedited_count: null,
      }

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: expectedResult,
          error: null,
        }),
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      const result = await service.create(command)

      // Assert
      expect(result).toEqual(expectedResult)
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: command.user_id,
        model: command.model,
        source_text_hash: command.source_text_hash,
        source_text_length: command.source_text_length,
        generated_count: command.generated_count,
        generation_duration: command.generation_duration,
      })
    })

    it('should preserve exact values from command object', async () => {
      // Arrange
      const command: CreateGenerationCommand = {
        user_id: 'precise-user-id',
        model: 'gpt-3.5-turbo',
        source_text_hash: 'exact-hash-12345',
        source_text_length: 7832,
        generated_count: 23,
        generation_duration: 3842,
      }

      const expectedResult: GenerationDTO = {
        id: 3,
        ...command,
        created_at: '2025-01-15T12:00:00Z',
        updated_at: '2025-01-15T12:00:00Z',
        accepted_edited_count: null,
        accepted_unedited_count: null,
      }

      const mockSelect = vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: expectedResult,
          error: null,
        }),
      })

      const mockInsert = vi.fn().mockReturnValue({
        select: mockSelect,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      const result = await service.create(command)

      // Assert
      expect(result.user_id).toBe(command.user_id)
      expect(result.model).toBe(command.model)
      expect(result.source_text_hash).toBe(command.source_text_hash)
      expect(result.source_text_length).toBe(command.source_text_length)
      expect(result.generated_count).toBe(command.generated_count)
      expect(result.generation_duration).toBe(command.generation_duration)
    })
  })
})

describe('createGenerationsService', () => {
  it('should create a GenerationsService instance', () => {
    // Arrange
    const mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>

    // Act
    const service = createGenerationsService(mockSupabase)

    // Assert
    expect(service).toBeInstanceOf(GenerationsService)
  })

  it('should create service with provided Supabase client', () => {
    // Arrange
    const mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>

    // Act
    const service = createGenerationsService(mockSupabase)

    // Assert
    expect(service).toBeDefined()
    expect(service.create).toBeDefined()
    expect(typeof service.create).toBe('function')
  })
})
