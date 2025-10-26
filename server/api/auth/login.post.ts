import { createSupabaseServerClient } from '~/server/utils/supabase/server-client'

/**
 * POST /api/auth/login
 *
 * Authenticate user with email and password using Supabase Auth
 * Sets httpOnly cookies for session management
 *
 * Request body:
 * {
 *   email: string
 *   password: string
 * }
 *
 * Response:
 * {
 *   user: {
 *     id: string
 *     email: string
 *     ...
 *   }
 * }
 *
 * Errors:
 * - 400: Missing or invalid credentials
 * - 401: Invalid email or password
 */
export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required',
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format',
      })
    }

    if (password.length < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password is required',
      })
    }

    const supabase = createSupabaseServerClient(event)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
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

      throw createError({
        statusCode: 401,
        statusMessage: error.message || 'Something went wrong',
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
      statusMessage: 'An error occurred during login',
    })
  }
})
