import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'
import type { CreateGenerationErrorLogCommand } from '~/types/commands/generation-commands'
import {
  GenerationErrorLoggerService,
  createGenerationErrorLoggerService,
} from '../GenerationErrorLoggerService'

describe('GenerationErrorLoggerService', () => {
  let mockSupabase: SupabaseClient<Database>
  let service: GenerationErrorLoggerService
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Create typed mock for Supabase client
    mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>

    service = new GenerationErrorLoggerService(mockSupabase)

    // Spy on console.error
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore console.error
    consoleErrorSpy.mockRestore()
  })

  describe('log', () => {
    it('should successfully log generation error to database', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'API rate limit exceeded',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(mockFrom).toHaveBeenCalledWith('generation_error_logs')
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: command.user_id,
        model: command.model,
        source_text_hash: command.source_text_hash,
        source_text_length: command.source_text_length,
        error_code: command.error_code,
        error_message: command.error_message,
      })
    })

    it('should not throw error when logging succeeds', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'Test error',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act & Assert
      await expect(service.log(command)).resolves.not.toThrow()
    })

    it('should log all command fields correctly', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'specific-user-id',
        model: 'claude-3-opus',
        source_text_hash: 'hash-xyz-789',
        source_text_length: 8500,
        error_code: 'TIMEOUT',
        error_message: 'Request timeout after 30 seconds',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: 'specific-user-id',
        model: 'claude-3-opus',
        source_text_hash: 'hash-xyz-789',
        source_text_length: 8500,
        error_code: 'TIMEOUT',
        error_message: 'Request timeout after 30 seconds',
      })
    })

    it('should not call console.error when logging succeeds', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'Test error',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(consoleErrorSpy).not.toHaveBeenCalled()
    })
  })

  describe('error handling - database errors', () => {
    it('should log to console when database insert fails', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'Test error',
      }

      const mockError = {
        message: 'Database connection failed',
        code: 'DB_ERROR',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: mockError,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to log generation error:',
        'Database connection failed'
      )
    })

    it('should not throw error when database insert fails', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'Test error',
      }

      const mockError = {
        message: 'Database error',
        code: 'DB_ERROR',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: mockError,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act & Assert
      await expect(service.log(command)).resolves.not.toThrow()
    })

    it('should handle database errors with different error messages', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'Test error',
      }

      const mockError = {
        message: 'Permission denied',
        code: 'PERMISSION_ERROR',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: mockError,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to log generation error:',
        'Permission denied'
      )
    })
  })

  describe('error handling - exceptions', () => {
    it('should catch and log exceptions during error logging', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'Test error',
      }

      const mockException = new Error('Network failure')

      const mockInsert = vi.fn().mockRejectedValue(mockException)

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Exception during error logging:', mockException)
    })

    it('should not throw error when exception occurs', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'Test error',
      }

      const mockException = new Error('Unexpected error')

      const mockInsert = vi.fn().mockRejectedValue(mockException)

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act & Assert
      await expect(service.log(command)).resolves.not.toThrow()
    })

    it('should handle non-Error exceptions', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'Test error',
      }

      const mockException = 'String exception'

      const mockInsert = vi.fn().mockRejectedValue(mockException)

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Exception during error logging:', mockException)
    })

    it('should handle exception when from method throws', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: 'Test error',
      }

      const mockException = new Error('From method error')

      mockSupabase.from = vi.fn().mockImplementation(() => {
        throw mockException
      })

      // Act
      await service.log(command)

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Exception during error logging:', mockException)
    })
  })

  describe('edge cases', () => {
    it('should handle very long error messages', async () => {
      // Arrange
      const longErrorMessage = 'A'.repeat(10000)
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: longErrorMessage,
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          error_message: longErrorMessage,
        })
      )
    })

    it('should handle special characters in error messages', async () => {
      // Arrange
      const specialErrorMessage = 'Error: "Test" <script>alert(\'xss\')</script>'
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'API_ERROR',
        error_message: specialErrorMessage,
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          error_message: specialErrorMessage,
        })
      )
    })

    it('should handle empty error message', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 5000,
        error_code: 'UNKNOWN',
        error_message: '',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          error_message: '',
        })
      )
    })

    it('should handle zero source text length', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 0,
        error_code: 'VALIDATION_ERROR',
        error_message: 'Text is empty',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          source_text_length: 0,
        })
      )
    })

    it('should handle very large source text length', async () => {
      // Arrange
      const command: CreateGenerationErrorLogCommand = {
        user_id: 'user-123',
        model: 'gpt-4',
        source_text_hash: 'abc123',
        source_text_length: 999999,
        error_code: 'SIZE_LIMIT',
        error_message: 'Text too large',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command)

      // Assert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          source_text_length: 999999,
        })
      )
    })
  })

  describe('multiple logging calls', () => {
    it('should handle multiple sequential log calls', async () => {
      // Arrange
      const command1: CreateGenerationErrorLogCommand = {
        user_id: 'user-1',
        model: 'gpt-4',
        source_text_hash: 'hash1',
        source_text_length: 1000,
        error_code: 'ERROR_1',
        error_message: 'First error',
      }

      const command2: CreateGenerationErrorLogCommand = {
        user_id: 'user-2',
        model: 'claude-3',
        source_text_hash: 'hash2',
        source_text_length: 2000,
        error_code: 'ERROR_2',
        error_message: 'Second error',
      }

      const mockInsert = vi.fn().mockResolvedValue({
        error: null,
      })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command1)
      await service.log(command2)

      // Assert
      expect(mockInsert).toHaveBeenCalledTimes(2)
      expect(mockInsert).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ error_code: 'ERROR_1' })
      )
      expect(mockInsert).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ error_code: 'ERROR_2' })
      )
    })

    it('should handle mixed success and failure logging', async () => {
      // Arrange
      const command1: CreateGenerationErrorLogCommand = {
        user_id: 'user-1',
        model: 'gpt-4',
        source_text_hash: 'hash1',
        source_text_length: 1000,
        error_code: 'ERROR_1',
        error_message: 'First error',
      }

      const command2: CreateGenerationErrorLogCommand = {
        user_id: 'user-2',
        model: 'claude-3',
        source_text_hash: 'hash2',
        source_text_length: 2000,
        error_code: 'ERROR_2',
        error_message: 'Second error',
      }

      const mockInsert = vi
        .fn()
        .mockResolvedValueOnce({ error: null })
        .mockResolvedValueOnce({ error: { message: 'DB error', code: 'ERR' } })

      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      })

      mockSupabase.from = mockFrom

      // Act
      await service.log(command1)
      await service.log(command2)

      // Assert
      expect(mockInsert).toHaveBeenCalledTimes(2)
      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to log generation error:', 'DB error')
    })
  })
})

describe('createGenerationErrorLoggerService', () => {
  it('should create a GenerationErrorLoggerService instance', () => {
    // Arrange
    const mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>

    // Act
    const service = createGenerationErrorLoggerService(mockSupabase)

    // Assert
    expect(service).toBeInstanceOf(GenerationErrorLoggerService)
  })

  it('should create service with provided Supabase client', () => {
    // Arrange
    const mockSupabase = {
      from: vi.fn(),
    } as unknown as SupabaseClient<Database>

    // Act
    const service = createGenerationErrorLoggerService(mockSupabase)

    // Assert
    expect(service).toBeDefined()
    expect(service.log).toBeDefined()
    expect(typeof service.log).toBe('function')
  })
})
