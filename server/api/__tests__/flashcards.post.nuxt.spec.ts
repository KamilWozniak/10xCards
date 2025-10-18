// import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
// import type { CreateFlashcardsResponseDTO, ApiErrorResponseDTO } from '~/types/dto/types'

// /**
//  * Test suite for POST /api/flashcards endpoint
//  *
//  * Tests cover:
//  * - Authentication validation
//  * - Request body parsing and validation
//  * - Generation ownership validation for AI-generated flashcards
//  * - Creating flashcards in database
//  * - Error handling for all scenarios
//  */

// // Define global mocks before any imports
// globalThis.defineEventHandler = ((handler: any) => handler) as any

// // Mock dependencies first
// const mockGetUserId = vi.fn()
// const mockValidateCreateFlashcardsRequest = vi.fn()
// const mockCreateFlashcardsService = vi.fn()
// const mockCreateSupabaseServerClient = vi.fn()
// const mockReadBody = vi.fn()
// const mockSetResponseStatus = vi.fn()

// // Add global mocks for h3 functions that will be called
// globalThis.readBody = mockReadBody as any
// globalThis.setResponseStatus = mockSetResponseStatus as any

// vi.mock('~/server/utils/auth/get-user-id', () => ({
//   getUserId: mockGetUserId,
// }))

// vi.mock('~/server/utils/validators/flashcard-validator', () => ({
//   validateCreateFlashcardsRequest: mockValidateCreateFlashcardsRequest,
// }))

// vi.mock('~/services/database/FlashcardsService', () => ({
//   createFlashcardsService: mockCreateFlashcardsService,
// }))

// vi.mock('~/server/utils/supabase/server-client', () => ({
//   createSupabaseServerClient: mockCreateSupabaseServerClient,
// }))

// vi.mock('h3', async () => {
//   const actual = await vi.importActual<typeof import('h3')>('h3')
//   return {
//     ...actual,
//     readBody: mockReadBody,
//     setResponseStatus: mockSetResponseStatus,
//     defineEventHandler: (handler: any) => handler,
//   }
// })

// describe('POST /api/flashcards', () => {
//   // Mock data
//   const mockUserId = 'user-123'
//   const mockGenerationId = 1
//   const mockFlashcardData = {
//     front: 'Test Front',
//     back: 'Test Back',
//     source: 'manual' as const,
//     generation_id: null,
//   }
//   const mockCreatedFlashcard = {
//     id: 1,
//     front: 'Test Front',
//     back: 'Test Back',
//     source: 'manual',
//     generation_id: null,
//     user_id: mockUserId,
//     created_at: '2024-01-01T00:00:00Z',
//     updated_at: '2024-01-01T00:00:00Z',
//   }

//   let consoleErrorSpy: ReturnType<typeof vi.spyOn>

//   // Mock event helper
//   const createMockEvent = () => ({
//     node: {
//       req: {},
//       res: { statusCode: 200 },
//     },
//   })

//   beforeEach(() => {
//     vi.clearAllMocks()

//     // Setup default mock implementations
//     mockCreateSupabaseServerClient.mockReturnValue({})
//     mockSetResponseStatus.mockImplementation((event: any, code: number) => {
//       if (event?.node?.res) {
//         event.node.res.statusCode = code
//       }
//     })

//     // Ensure global mock is updated
//     globalThis.setResponseStatus = mockSetResponseStatus as any

//     consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
//   })

//   afterEach(() => {
//     consoleErrorSpy.mockRestore()
//   })

//   describe('Authentication', () => {
//     it('should return 401 when user is not authenticated', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const { UnauthorizedError } = await import('~/server/utils/errors/custom-errors')
//       mockGetUserId.mockRejectedValue(new UnauthorizedError('No token provided'))

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as ApiErrorResponseDTO

//       // Assert
//       expect(result.error).toBe('Unauthorized')
//       expect(result.details).toContain('No token provided')
//       expect(mockEvent.node.res.statusCode).toBe(401)
//     })

//     it('should return 401 with default message when UnauthorizedError has no message', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const { UnauthorizedError } = await import('~/server/utils/errors/custom-errors')
//       const error = new UnauthorizedError()
//       error.message = ''
//       mockGetUserId.mockRejectedValue(error)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as ApiErrorResponseDTO

//       // Assert
//       expect(result.error).toBe('Unauthorized')
//       expect(result.details).toBe('Authentication token is required')
//       expect(mockEvent.node.res.statusCode).toBe(401)
//     })

//     it('should re-throw non-UnauthorizedError from getUserId', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       mockGetUserId.mockRejectedValue(new Error('Unexpected error'))

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act & Assert
//       await expect(handler(mockEvent as any)).rejects.toThrow('Unexpected error')
//     })
//   })

//   describe('Request body parsing', () => {
//     it('should return 400 when request body is not valid JSON', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockRejectedValue(new Error('Invalid JSON'))

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as ApiErrorResponseDTO

//       // Assert
//       expect(result.error).toBe('Invalid JSON format')
//       expect(result.details).toBe('Request body must be valid JSON')
//       expect(mockEvent.node.res.statusCode).toBe(400)
//     })
//   })

//   describe('Request validation', () => {
//     it('should return 400 when validation fails', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const { ValidationError } = await import('~/server/utils/errors/custom-errors')

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue({ flashcards: [] })
//       mockValidateCreateFlashcardsRequest.mockImplementation(() => {
//         throw new ValidationError('Invalid flashcard data', 'Front is required')
//       })

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as ApiErrorResponseDTO

//       // Assert
//       expect(result.error).toBe('Invalid flashcard data')
//       expect(result.details).toBe('Front is required')
//       expect(mockEvent.node.res.statusCode).toBe(400)
//     })

//     it('should re-throw non-ValidationError from validator', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue({ flashcards: [] })
//       mockValidateCreateFlashcardsRequest.mockImplementation(() => {
//         throw new Error('Unexpected error')
//       })

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act & Assert
//       await expect(handler(mockEvent as any)).rejects.toThrow('Unexpected error')
//     })
//   })

//   describe('Generation ownership validation', () => {
//     it('should validate generation ownership for ai-full flashcards', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn().mockResolvedValue([mockGenerationId]),
//         createMultiple: vi.fn().mockResolvedValue([mockCreatedFlashcard]),
//       }

//       const requestBody = {
//         flashcards: [
//           {
//             front: 'AI Front',
//             back: 'AI Back',
//             source: 'ai-full',
//             generation_id: mockGenerationId,
//           },
//         ],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       await handler(mockEvent as any)

//       // Assert
//       expect(mockFlashcardsService.validateMultipleGenerationOwnership).toHaveBeenCalledWith(
//         [mockGenerationId],
//         mockUserId
//       )
//     })

//     it('should validate generation ownership for ai-edited flashcards', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn().mockResolvedValue([mockGenerationId]),
//         createMultiple: vi.fn().mockResolvedValue([mockCreatedFlashcard]),
//       }

//       const requestBody = {
//         flashcards: [
//           {
//             front: 'AI Edited Front',
//             back: 'AI Edited Back',
//             source: 'ai-edited',
//             generation_id: mockGenerationId,
//           },
//         ],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       await handler(mockEvent as any)

//       // Assert
//       expect(mockFlashcardsService.validateMultipleGenerationOwnership).toHaveBeenCalledWith(
//         [mockGenerationId],
//         mockUserId
//       )
//     })

//     it('should not validate generation ownership for manual flashcards', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn(),
//         createMultiple: vi.fn().mockResolvedValue([mockCreatedFlashcard]),
//       }

//       const requestBody = {
//         flashcards: [mockFlashcardData],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       await handler(mockEvent as any)

//       // Assert
//       expect(mockFlashcardsService.validateMultipleGenerationOwnership).not.toHaveBeenCalled()
//     })

//     it('should return 400 when generation IDs are invalid', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn().mockResolvedValue([]),
//         createMultiple: vi.fn(),
//       }

//       const requestBody = {
//         flashcards: [
//           {
//             front: 'AI Front',
//             back: 'AI Back',
//             source: 'ai-full',
//             generation_id: 999,
//           },
//         ],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as ApiErrorResponseDTO

//       // Assert
//       expect(result.error).toBe('Invalid generation_id for source type')
//       expect(result.details).toContain('Generation IDs do not belong to user: 999')
//       expect(mockEvent.node.res.statusCode).toBe(400)
//     })

//     it('should return 400 when some generation IDs are invalid', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn().mockResolvedValue([1]),
//         createMultiple: vi.fn(),
//       }

//       const requestBody = {
//         flashcards: [
//           {
//             front: 'AI Front 1',
//             back: 'AI Back 1',
//             source: 'ai-full',
//             generation_id: 1,
//           },
//           {
//             front: 'AI Front 2',
//             back: 'AI Back 2',
//             source: 'ai-full',
//             generation_id: 999,
//           },
//         ],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as ApiErrorResponseDTO

//       // Assert
//       expect(result.error).toBe('Invalid generation_id for source type')
//       expect(result.details).toContain('999')
//       expect(mockEvent.node.res.statusCode).toBe(400)
//     })

//     it('should return 500 when generation validation fails', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi
//           .fn()
//           .mockRejectedValue(new Error('Database error')),
//         createMultiple: vi.fn(),
//       }

//       const requestBody = {
//         flashcards: [
//           {
//             front: 'AI Front',
//             back: 'AI Back',
//             source: 'ai-full',
//             generation_id: mockGenerationId,
//           },
//         ],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as ApiErrorResponseDTO

//       // Assert
//       expect(result.error).toBe('Internal server error')
//       expect(result.details).toBe('Failed to validate generation ownership')
//       expect(mockEvent.node.res.statusCode).toBe(500)
//       expect(consoleErrorSpy).toHaveBeenCalledWith(
//         'Error validating generation ownership:',
//         expect.any(Error)
//       )
//     })

//     it('should skip validation when no generation IDs are provided', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn(),
//         createMultiple: vi.fn().mockResolvedValue([mockCreatedFlashcard]),
//       }

//       const requestBody = {
//         flashcards: [
//           {
//             front: 'AI Front',
//             back: 'AI Back',
//             source: 'ai-full',
//             generation_id: null,
//           },
//         ],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       await handler(mockEvent as any)

//       // Assert
//       expect(mockFlashcardsService.validateMultipleGenerationOwnership).not.toHaveBeenCalled()
//     })
//   })

//   describe('Creating flashcards', () => {
//     it('should create flashcards successfully', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn(),
//         createMultiple: vi.fn().mockResolvedValue([mockCreatedFlashcard]),
//       }

//       const requestBody = {
//         flashcards: [mockFlashcardData],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as CreateFlashcardsResponseDTO

//       // Assert
//       expect(result.flashcards).toEqual([mockCreatedFlashcard])
//       expect(mockEvent.node.res.statusCode).toBe(201)
//       expect(mockFlashcardsService.createMultiple).toHaveBeenCalledWith(
//         [mockFlashcardData],
//         mockUserId
//       )
//     })

//     it('should create multiple flashcards successfully', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const createdFlashcards = [
//         { ...mockCreatedFlashcard, id: 1 },
//         { ...mockCreatedFlashcard, id: 2 },
//       ]

//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn(),
//         createMultiple: vi.fn().mockResolvedValue(createdFlashcards),
//       }

//       const requestBody = {
//         flashcards: [mockFlashcardData, mockFlashcardData],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as CreateFlashcardsResponseDTO

//       // Assert
//       expect(result.flashcards).toEqual(createdFlashcards)
//       expect(result.flashcards).toHaveLength(2)
//       expect(mockEvent.node.res.statusCode).toBe(201)
//     })

//     it('should return 500 when flashcard creation fails', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn(),
//         createMultiple: vi.fn().mockRejectedValue(new Error('Database error')),
//       }

//       const requestBody = {
//         flashcards: [mockFlashcardData],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as ApiErrorResponseDTO

//       // Assert
//       expect(result.error).toBe('Internal server error')
//       expect(result.details).toBe('Failed to create flashcards')
//       expect(mockEvent.node.res.statusCode).toBe(500)
//       expect(consoleErrorSpy).toHaveBeenCalledWith(
//         'Error creating flashcards:',
//         expect.any(Error)
//       )
//     })
//   })

//   describe('Mixed source types', () => {
//     it('should handle mixed manual and AI flashcards', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn().mockResolvedValue([mockGenerationId]),
//         createMultiple: vi.fn().mockResolvedValue([mockCreatedFlashcard]),
//       }

//       const requestBody = {
//         flashcards: [
//           {
//             front: 'Manual Front',
//             back: 'Manual Back',
//             source: 'manual',
//             generation_id: null,
//           },
//           {
//             front: 'AI Front',
//             back: 'AI Back',
//             source: 'ai-full',
//             generation_id: mockGenerationId,
//           },
//         ],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       await handler(mockEvent as any)

//       // Assert
//       expect(mockFlashcardsService.validateMultipleGenerationOwnership).toHaveBeenCalledWith(
//         [mockGenerationId],
//         mockUserId
//       )
//       expect(mockFlashcardsService.createMultiple).toHaveBeenCalledWith(
//         requestBody.flashcards,
//         mockUserId
//       )
//     })

//     it('should validate all generation IDs from mixed sources', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       const mockFlashcardsService = {
//         validateMultipleGenerationOwnership: vi.fn().mockResolvedValue([1, 2]),
//         createMultiple: vi.fn().mockResolvedValue([mockCreatedFlashcard]),
//       }

//       const requestBody = {
//         flashcards: [
//           {
//             front: 'AI Full Front',
//             back: 'AI Full Back',
//             source: 'ai-full',
//             generation_id: 1,
//           },
//           {
//             front: 'AI Edited Front',
//             back: 'AI Edited Back',
//             source: 'ai-edited',
//             generation_id: 2,
//           },
//           {
//             front: 'Manual Front',
//             back: 'Manual Back',
//             source: 'manual',
//             generation_id: null,
//           },
//         ],
//       }

//       mockGetUserId.mockResolvedValue(mockUserId)
//       mockReadBody.mockResolvedValue(requestBody)
//       mockValidateCreateFlashcardsRequest.mockReturnValue(requestBody)
//       mockCreateFlashcardsService.mockReturnValue(mockFlashcardsService)

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       await handler(mockEvent as any)

//       // Assert
//       expect(mockFlashcardsService.validateMultipleGenerationOwnership).toHaveBeenCalledWith(
//         [1, 2],
//         mockUserId
//       )
//     })
//   })

//   describe('Unexpected errors', () => {
//     it('should return 500 for unexpected errors', async () => {
//       // Arrange
//       const mockEvent = createMockEvent()
//       mockGetUserId.mockRejectedValue(new Error('Unexpected error'))

//       // Import handler
//       const handler = (await import('../flashcards.post')).default

//       // Act
//       const result = (await handler(mockEvent as any)) as ApiErrorResponseDTO

//       // Assert
//       expect(result.error).toBe('Internal server error')
//       expect(result.details).toBe('An unexpected error occurred')
//       expect(mockEvent.node.res.statusCode).toBe(500)
//       expect(consoleErrorSpy).toHaveBeenCalledWith(
//         'Unexpected error in flashcards endpoint:',
//         expect.any(Error)
//       )
//     })
//   })
// })
