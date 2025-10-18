/**
 * Page Objects Index
 * Centralized export for all Page Object Classes
 */

// Import test configuration
import { E2E_TEST_USER, validateE2EEnvironment } from '../test-config'

// Base classes
export { BasePage } from './BasePage'

// Page Objects
export { LoginPage } from './LoginPage'
export { GeneratePage } from './GeneratePage'

// Components
export { NavigationComponent } from './components/NavigationComponent'

// Types for test data
export interface LoginCredentials {
  email: string
  password: string
}

export interface TestUser {
  email: string
  password: string
  name?: string
}

// Test user data from environment variables
export const TEST_USERS = {
  VALID_USER: {
    id: E2E_TEST_USER.id,
    email: E2E_TEST_USER.email,
    password: E2E_TEST_USER.password,
  },
  INVALID_USER: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
} as const

// Validation function to ensure test environment is properly configured
export function validateTestEnvironment(): void {
  validateE2EEnvironment()
}
