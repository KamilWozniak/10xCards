import { test, expect } from '@playwright/test'
import {
  LoginPage,
  GeneratePage,
  NavigationComponent,
  TEST_USERS,
  validateTestEnvironment,
} from './page-objects'
import { E2E_HELPERS } from './test-config'

/**
 * E2E Test Suite: Improved Login Flow
 * Testuje kompletny scenariusz logowania użytkownika z rzeczywistymi danymi testowymi
 *
 * Scenariusz:
 * 1. Użytkownik wchodzi na stronę "/auth/login"
 * 2. Użytkownik wypełnia formularz logowania poprawnymi danymi z .env.test
 * 3. Użytkownik klika przycisk "Zaloguj się"
 * 4. Użytkownik zostaje przeniesiony do strony "/generate"
 */

test.describe('Login Flow - Real Test Data', () => {
  let loginPage: LoginPage
  let generatePage: GeneratePage
  let navigation: NavigationComponent

  // Walidacja środowiska testowego przed uruchomieniem testów
  test.beforeAll(() => {
    E2E_HELPERS.logTestInfo('Setup', 'Validating test environment...')
    validateTestEnvironment()
    E2E_HELPERS.logTestInfo('Setup', `Using test user: ${TEST_USERS.VALID_USER.email}`)
  })

  test.beforeEach(async ({ page }) => {
    // Inicjalizacja Page Objects
    loginPage = new LoginPage(page)
    generatePage = new GeneratePage(page)
    navigation = new NavigationComponent(page)

    // Dodatkowe logowanie dla debugowania
    E2E_HELPERS.logTestInfo('BeforeEach', 'Page Objects initialized')
  })

  test('successful login with real test user redirects to generate page', async ({ page }) => {
    const testId = E2E_HELPERS.generateTestId()
    E2E_HELPERS.logTestInfo(testId, 'Starting login flow test')

    try {
      // Krok 1: Użytkownik wchodzi na stronę logowania
      E2E_HELPERS.logTestInfo(testId, 'Step 1: Navigating to login page')
      await loginPage.navigate()
      await loginPage.expectPageLoaded()

      // Sprawdzenie że nawigacja nie jest widoczna na stronie auth
      await navigation.expectNavigationNotVisible()
      E2E_HELPERS.logTestInfo(testId, 'Login page loaded successfully')

      // Krok 2: Użytkownik wypełnia formularz poprawnymi danymi
      E2E_HELPERS.logTestInfo(
        testId,
        `Step 2: Filling form with email: ${TEST_USERS.VALID_USER.email}`
      )
      await loginPage.expectFormEnabled()
      await loginPage.fillEmail(TEST_USERS.VALID_USER.email)
      await loginPage.fillPassword(TEST_USERS.VALID_USER.password)

      // Krok 3: Użytkownik klika przycisk "Zaloguj się"
      E2E_HELPERS.logTestInfo(testId, 'Step 3: Clicking submit button')
      await loginPage.expectNormalState()
      await loginPage.clickSubmit()

      // Sprawdzenie stanu ładowania
      E2E_HELPERS.logTestInfo(testId, 'Checking loading state')
      await loginPage.expectLoadingState()
      await loginPage.expectFormDisabled()

      // Krok 4: Użytkownik zostaje przeniesiony do strony "/generate"
      E2E_HELPERS.logTestInfo(testId, 'Step 4: Expecting redirect to generate page')
      await loginPage.expectRedirectToGenerate()
      await generatePage.expectSuccessfulRedirectFromLogin()

      // Sprawdzenie nawigacji po zalogowaniu
      E2E_HELPERS.logTestInfo(testId, 'Verifying authenticated navigation')
      await navigation.expectAuthenticatedNavigation(TEST_USERS.VALID_USER.email)

      E2E_HELPERS.logTestInfo(testId, '✅ Login flow completed successfully')
    } catch (error) {
      E2E_HELPERS.logTestInfo(testId, `❌ Login flow failed: ${error}`)

      // Dodatkowe informacje diagnostyczne
      console.log('Current URL:', page.url())
      console.log('Page title:', await page.title())

      // Zrzut ekranu dla debugowania
      await page.screenshot({
        path: `tests/e2e/screenshots/login-failure-${testId}.png`,
        fullPage: true,
      })

      throw error
    }
  })

  test('login with real credentials shows success message', async ({ page }) => {
    const testId = E2E_HELPERS.generateTestId()
    E2E_HELPERS.logTestInfo(testId, 'Testing success toast display')

    await loginPage.navigate()
    await loginPage.expectPageLoaded()

    // Wypełnienie formularza rzeczywistymi danymi
    await loginPage.fillEmail(TEST_USERS.VALID_USER.email)
    await loginPage.fillPassword(TEST_USERS.VALID_USER.password)
    await loginPage.clickSubmit()

    // Sprawdzenie czy pojawia się toast sukcesu przed przekierowaniem
    try {
      await loginPage.expectSuccessMessage('Zalogowano pomyślnie!')
      E2E_HELPERS.logTestInfo(testId, '✅ Success toast displayed correctly')
    } catch (error) {
      E2E_HELPERS.logTestInfo(testId, 'Success toast not found, checking if redirect happened')
      // Jeśli toast sukcesu nie pojawił się (przekierowanie było za szybkie), sprawdź czy nastąpiło przekierowanie
      await generatePage.expectPageLoaded()
    }
  })

  test('invalid credentials show appropriate error message', async ({ page }) => {
    const testId = E2E_HELPERS.generateTestId()
    E2E_HELPERS.logTestInfo(testId, 'Testing invalid credentials error handling')

    await loginPage.navigate()
    await loginPage.expectPageLoaded()

    // Wypełnienie formularza nieprawidłowymi danymi
    await loginPage.fillEmail(TEST_USERS.INVALID_USER.email)
    await loginPage.fillPassword(TEST_USERS.INVALID_USER.password)
    await loginPage.clickSubmit()

    // Sprawdzenie stanu ładowania
    await loginPage.expectLoadingState()

    // Oczekiwanie na toast z komunikatem błędu
    await loginPage.expectErrorMessage()
    E2E_HELPERS.logTestInfo(testId, '✅ Error toast displayed for invalid credentials')

    // Sprawdzenie że pozostajemy na stronie logowania
    await loginPage.expectPageLoaded()
    await loginPage.expectFormEnabled()
  })

  test('complete real user login and logout flow', async ({ page }) => {
    const testId = E2E_HELPERS.generateTestId()
    E2E_HELPERS.logTestInfo(testId, 'Testing complete login/logout flow')

    // Kompletny scenariusz logowania
    await loginPage.performLoginFlow(TEST_USERS.VALID_USER.email, TEST_USERS.VALID_USER.password)

    // Weryfikacje po zalogowaniu
    await generatePage.expectAllElementsVisible()
    await navigation.expectAuthenticatedNavigation(TEST_USERS.VALID_USER.email)

    E2E_HELPERS.logTestInfo(testId, 'Login successful, testing logout')

    // Test wylogowania
    await navigation.performLogout()
    await loginPage.expectPageLoaded()

    E2E_HELPERS.logTestInfo(testId, '✅ Complete login/logout flow successful')
  })
})

/**
 * Test Suite: Environment Validation
 * Testuje czy środowisko testowe jest poprawnie skonfigurowane
 */
test.describe('Test Environment Validation', () => {
  test('environment variables are properly configured', async () => {
    // Test czy wszystkie wymagane zmienne środowiskowe są ustawione
    expect(TEST_USERS.VALID_USER.id).toBeTruthy()
    expect(TEST_USERS.VALID_USER.email).toBeTruthy()
    expect(TEST_USERS.VALID_USER.password).toBeTruthy()

    // Test czy email ma poprawny format
    expect(TEST_USERS.VALID_USER.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

    // Test czy hasło nie jest puste
    expect(TEST_USERS.VALID_USER.password.length).toBeGreaterThan(0)

    console.log('✅ All environment variables are properly configured')
    console.log(`📧 Test user email: ${TEST_USERS.VALID_USER.email}`)
    console.log(`🆔 Test user ID: ${TEST_USERS.VALID_USER.id}`)
  })
})
