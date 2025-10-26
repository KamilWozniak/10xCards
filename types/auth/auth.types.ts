/**
 * Authentication form types
 */

import type { User, Session } from '@supabase/supabase-js'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthErrorDisplayProps {
  message: string | null
  type: 'error' | 'success' | 'info'
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  user: User
  session: Session
}
