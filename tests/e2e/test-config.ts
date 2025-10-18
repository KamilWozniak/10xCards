/**
 * E2E Test Configuration
 * Konfiguracja i walidacja środowiska testowego
 */

import dotenv from 'dotenv'
import path from 'path'

// Ładowanie zmiennych środowiskowych z .env.test
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') })

/**
 * Walidacja wymaganych zmiennych środowiskowych
 */
export function validateE2EEnvironment(): void {
  const requiredVars = ['E2E_USERNAME_ID', 'E2E_USERNAME', 'E2E_PASSWORD']
  const missingVars: string[] = []

  // Check if running in CI environment
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
  
  if (isCI) {
    console.log('🤖 Running in CI environment, skipping E2E environment validation')
    
    // Set default test values for CI environment
    if (!process.env.E2E_USERNAME_ID) process.env.E2E_USERNAME_ID = 'test-user-id'
    if (!process.env.E2E_USERNAME) process.env.E2E_USERNAME = 'test@example.com'
    if (!process.env.E2E_PASSWORD) process.env.E2E_PASSWORD = 'password123'
    
    return
  }

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName)
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables for E2E tests: ${missingVars.join(', ')}\n` +
        'Please ensure these variables are set in your .env.test file:\n' +
        '- E2E_USERNAME_ID: ID of the test user\n' +
        '- E2E_USERNAME: Email of the test user\n' +
        '- E2E_PASSWORD: Password of the test user'
    )
  }

  console.log('✅ E2E environment variables validated successfully')
  console.log(`📧 Test user email: ${process.env.E2E_USERNAME}`)
  console.log(`🆔 Test user ID: ${process.env.E2E_USERNAME_ID}`)
}

/**
 * Konfiguracja testowego użytkownika
 */
export const E2E_TEST_USER = {
  id: process.env.E2E_USERNAME_ID || '',
  email: process.env.E2E_USERNAME || '',
  password: process.env.E2E_PASSWORD || '',
} as const

/**
 * Sprawdzenie czy wszystkie dane testowego użytkownika są dostępne
 */
export function isTestUserConfigured(): boolean {
  return !!(E2E_TEST_USER.id && E2E_TEST_USER.email && E2E_TEST_USER.password)
}

/**
 * Pomocnicze funkcje dla testów
 */
export const E2E_HELPERS = {
  /**
   * Oczekiwanie na określony czas (dla debugowania)
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Generowanie unikalnego identyfikatora dla testów
   */
  generateTestId: () => `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,

  /**
   * Logowanie informacji o teście
   */
  logTestInfo: (testName: string, info: string) => {
    console.log(`🧪 [${testName}] ${info}`)
  },
} as const
