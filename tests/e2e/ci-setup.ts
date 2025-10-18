/**
 * CI Setup for E2E Tests
 * This file contains mocks and configurations for CI environments
 */

import { Page } from '@playwright/test'

/**
 * Mock user authentication for CI environment
 * This function mocks the authentication process in CI
 */
export async function mockAuthentication(page: Page): Promise<void> {
  // Set localStorage to simulate authenticated user
  await page.evaluate(() => {
    localStorage.setItem('is_authenticated', 'true')
    localStorage.setItem('user_id', 'test-user-id')
    localStorage.setItem('user_email', 'test@example.com')
  })
}

/**
 * Check if running in CI environment
 */
export function isRunningInCI(): boolean {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
}

/**
 * Skip test in CI environment
 */
export function skipInCI(): boolean {
  return isRunningInCI()
}
