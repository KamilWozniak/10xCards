import { test, expect } from '@playwright/test'

/**
 * Example E2E test demonstrating Playwright setup
 * Following guidelines from .cursor/rules/e2e-testing.mdc
 */

test.describe('Application', () => {
  test('should redirect to login page when not authenticated', async ({
    page,
  }) => {
    // Navigate to homepage
    await page.goto('/')

    // Wait for navigation to complete
    await page.waitForLoadState('networkidle')

    // Should redirect to login
    expect(page.url()).toContain('/auth/login')
  })

  test('login page should load successfully', async ({ page }) => {
    await page.goto('/auth/login')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Verify we're on login page
    expect(page.url()).toContain('/auth/login')

    // Verify login form exists (adjust selectors based on your actual form)
    // Uncomment when you have actual login form elements
    // await expect(page.getByLabel('Email')).toBeVisible()
    // await expect(page.getByLabel('Password')).toBeVisible()
    // await expect(page.getByRole('button', { name: /sign in|login/i })).toBeVisible()
  })
})

/**
 * Example using Page Object Model pattern
 * Uncomment when you have actual pages to test
 */
// class LoginPage {
//   constructor(private page: Page) {}
//
//   async goto() {
//     await this.page.goto('/login')
//   }
//
//   async login(email: string, password: string) {
//     await this.page.fill('[data-testid="email"]', email)
//     await this.page.fill('[data-testid="password"]', password)
//     await this.page.click('[data-testid="submit"]')
//   }
// }
//
// test.describe('Login Flow', () => {
//   test('user can login successfully', async ({ page }) => {
//     const loginPage = new LoginPage(page)
//     await loginPage.goto()
//     await loginPage.login('test@example.com', 'password123')
//     await expect(page).toHaveURL('/dashboard')
//   })
// })
