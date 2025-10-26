import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'

/**
 * POST /api/auth/register
 *
 * Register new user with email and password using Supabase Auth
 * Automatically logs in the user after successful registration
 * Sets httpOnly cookies for session management
 *
 * Request body:
 * {
 *   email: string
 *   password: string
 *   confirmPassword: string
 * }
 *
 * Response:
 * {
 *   user: {
 *     id: string
 *     email: string
 *     ...
 *   }
 *   session: {
 *     access_token: string
 *     refresh_token: string
 *     ...
 *   }
 * }
 *
 * Errors:
 * - 400: Missing fields, invalid format, or password mismatch
 * - 409: Email already exists
 * - 500: Internal server error
 */
export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { email, password, confirmPassword } = body

    if (!email || !password || !confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, password and confirm password are required',
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format',
      })
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters',
      })
    }

    if (password !== confirmPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Passwords do not match',
      })
    }

    const supabase = createSupabaseServerClient(event)

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: undefined,
      },
    })

    if (error) {
      const errorMessage = error.message?.toLowerCase() || ''
      if (
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('network') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('econnrefused') ||
        errorMessage.includes('timeout')
      ) {
        throw createError({
          statusCode: 503,
          statusMessage: 'Service temporarily unavailable. Please try again later',
        })
      }

      if (
        error.message.includes('already registered') ||
        error.message.includes('already exists')
      ) {
        return {
          user: null,
          session: null,
        }
      }

      if (error.message.includes('weak') || error.message.includes('password')) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Password is too weak. Use at least 6 characters',
        })
      }

      throw createError({
        statusCode: 400,
        statusMessage: error.message || 'Failed to create account',
      })
    }

    if (!data.user) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to create account. Please try again',
      })
    }

    return {
      user: data.user,
      session: data.session,
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during registration',
    })
  }
})
