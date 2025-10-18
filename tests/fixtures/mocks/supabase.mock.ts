/**
 * Supabase mock utilities for testing
 * Use these to mock Supabase client responses in tests
 */

import { vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a mock Supabase client with common methods
 *
 * @example
 * ```typescript
 * import { createMockSupabaseClient } from '~/tests/fixtures/mocks/supabase.mock'
 *
 * vi.mock('~/composables/useSupabase', () => ({
 *   useSupabase: () => createMockSupabaseClient()
 * }))
 * ```
 */
export function createMockSupabaseClient(
  overrides: Partial<SupabaseClient> = {}
) {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    ...overrides,
  } as unknown as SupabaseClient
}

/**
 * Creates a successful Supabase response
 *
 * @example
 * ```typescript
 * const mockClient = createMockSupabaseClient()
 * mockClient.from().select().mockResolvedValue(
 *   createSuccessResponse([{ id: 1, name: 'Test' }])
 * )
 * ```
 */
export function createSuccessResponse<T>(data: T) {
  return {
    data,
    error: null,
    count: null,
    status: 200,
    statusText: 'OK',
  }
}

/**
 * Creates an error Supabase response
 *
 * @example
 * ```typescript
 * const mockClient = createMockSupabaseClient()
 * mockClient.from().select().mockResolvedValue(
 *   createErrorResponse('Record not found', 'PGRST116')
 * )
 * ```
 */
export function createErrorResponse(message: string, code = 'PGRST000') {
  return {
    data: null,
    error: {
      message,
      code,
      details: '',
      hint: '',
    },
    count: null,
    status: 400,
    statusText: 'Bad Request',
  }
}
