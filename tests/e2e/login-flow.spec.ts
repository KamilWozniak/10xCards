import { test, expect } from '@playwright/test'
import {
  LoginPage,
  GeneratePage,
  NavigationComponent,
  TEST_USERS,
  validateTestEnvironment,
} from './page-objects'

/**
 * E2E Test Suite: Login Flow
 * Testuje kompletny scenariusz logowania użytkownika
 *
 * Scenariusz:
 * 1. Użytkownik wchodzi na stronę "/auth/login"
 * 2. Użytkownik wypełnia formularz logowania poprawnymi danymi
 * 3. Użytkownik klika przycisk "Zaloguj się"
 * 4. Użytkownik zostaje przeniesiony do strony "/generate"
 */

test.describe('Login Flow - Page Object Model', () => {
  let loginPage: LoginPage
  let generatePage: GeneratePage
  let navigation: NavigationComponent

  // Walidacja środowiska testowego przed uruchomieniem testów
  test.beforeAll(() => {
    validateTestEnvironment()
  })

  test.beforeEach(async ({ page }) => {
    // Inicjalizacja Page Objects
    loginPage = new LoginPage(page)
    generatePage = new GeneratePage(page)
    navigation = new NavigationComponent(page)
  })

  test('successful login redirects to generate page', async ({ page: _page }) => {
    // Krok 1: Użytkownik wchodzi na stronę logowania
    await loginPage.navigate()
    await loginPage.expectPageLoaded()

    // Sprawdzenie że nawigacja nie jest widoczna na stronie auth
    await navigation.expectNavigationNotVisible()

    // Krok 2: Użytkownik wypełnia formularz poprawnymi danymi
    await loginPage.expectFormEnabled()
    await loginPage.fillEmail(TEST_USERS.VALID_USER.email)
    await loginPage.fillPassword(TEST_USERS.VALID_USER.password)

    // Krok 3: Użytkownik klika przycisk "Zaloguj się"
    await loginPage.expectNormalState()
    await loginPage.clickSubmit()

    // Sprawdzenie stanu ładowania
    await loginPage.expectLoadingState()
    await loginPage.expectFormDisabled()

    // Krok 4: Użytkownik zostaje przeniesiony do strony "/generate"
    await loginPage.expectRedirectToGenerate()
    await generatePage.expectSuccessfulRedirectFromLogin()

    // Sprawdzenie nawigacji po zalogowaniu
    await navigation.expectAuthenticatedNavigation(TEST_USERS.VALID_USER.email)
  })

  test('invalid credentials show error message', async ({ page: _page }) => {
    // Nawigacja do strony logowania
    await loginPage.navigate()
    await loginPage.expectPageLoaded()

    // Wypełnienie formularza nieprawidłowymi danymi
    await loginPage.fillEmail(TEST_USERS.INVALID_USER.email)
    await loginPage.fillPassword(TEST_USERS.INVALID_USER.password)
    await loginPage.clickSubmit()

    // Sprawdzenie stanu ładowania
    await loginPage.expectLoadingState()

    // Oczekiwanie na toast z komunikatem błędu
    // Toast pojawi się z błędem z Supabase (np. "Invalid login credentials")
    await loginPage.expectErrorMessage()

    // Sprawdzenie że pozostajemy na stronie logowania
    await loginPage.expectPageLoaded()
    await loginPage.expectFormEnabled()
  })

  test('empty email shows validation error', async ({ page }) => {
    await loginPage.navigate()
    await loginPage.expectPageLoaded()

    // Wypełnienie tylko hasła
    await loginPage.fillPassword('somepassword')

    // Kliknięcie poza pole email (blur event)
    await loginPage.fillEmail('')
    await page.keyboard.press('Tab')

    // Sprawdzenie błędu walidacji
    await loginPage.expectEmailValidationError('Email jest wymagany')
  })

  test('invalid email format shows validation error', async ({ page }) => {
    await loginPage.navigate()
    await loginPage.expectPageLoaded()

    // Wypełnienie nieprawidłowym emailem
    await loginPage.fillEmail('invalid-email')
    await page.keyboard.press('Tab')

    // Sprawdzenie błędu walidacji
    await loginPage.expectEmailValidationError('Nieprawidłowy format email')
  })

  test('empty password shows validation error', async ({ page }) => {
    await loginPage.navigate()
    await loginPage.expectPageLoaded()

    // Wypełnienie tylko emaila
    await loginPage.fillEmail(TEST_USERS.VALID_USER.email)

    // Kliknięcie poza pole hasła (blur event)
    await loginPage.fillPassword('')
    await page.keyboard.press('Tab')

    // Sprawdzenie błędu walidacji
    await loginPage.expectPasswordValidationError('Hasło jest wymagane')
  })

  test('register link navigates to register page', async ({ page }) => {
    await loginPage.navigate()
    await loginPage.expectPageLoaded()

    // Kliknięcie linku rejestracji
    await loginPage.clickRegisterLink()

    // Sprawdzenie przekierowania
    await expect(page).toHaveURL('/auth/register')
  })

  test('complete login flow with all verifications', async ({ page: _page }) => {
    // Kompletny scenariusz z wszystkimi weryfikacjami
    await loginPage.performLoginFlow(TEST_USERS.VALID_USER.email, TEST_USERS.VALID_USER.password)

    // Dodatkowe weryfikacje po zalogowaniu
    await generatePage.expectAllElementsVisible()
    await navigation.expectAuthenticatedNavigation(TEST_USERS.VALID_USER.email)

    // Test wylogowania
    await navigation.performLogout()
    await loginPage.expectPageLoaded()
  })
})

/**
 * Test Suite: Navigation Component
 * Testuje funkcjonalności nawigacji po zalogowaniu
 */
test.describe('Navigation Component', () => {
  let loginPage: LoginPage
  let navigation: NavigationComponent

  // Walidacja środowiska testowego przed uruchomieniem testów
  test.beforeAll(() => {
    validateTestEnvironment()
  })

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    navigation = new NavigationComponent(page)

    // Zalogowanie przed każdym testem nawigacji
    await loginPage.performLoginFlow(TEST_USERS.VALID_USER.email, TEST_USERS.VALID_USER.password)
  })

  test('navigation elements are visible after login', async ({ page: _page }) => {
    await navigation.expectAuthenticatedNavigation(TEST_USERS.VALID_USER.email)
  })

  test('logo click navigates to generate page', async ({ page }) => {
    await navigation.clickLogo()
    await expect(page).toHaveURL('/generate')
  })

  test('logout button works correctly', async ({ page: _page }) => {
    await navigation.performLogout()
    await loginPage.expectPageLoaded()
  })
})
