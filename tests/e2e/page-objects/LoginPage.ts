import type { Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object Class dla strony logowania (/auth/login)
 * Enkapsuluje wszystkie interakcje z formularzem logowania
 */
export class LoginPage extends BasePage {
  // Selektory dla głównych elementów strony
  private readonly pageContainer: Locator
  private readonly loginForm: Locator
  private readonly emailInput: Locator
  private readonly passwordInput: Locator
  private readonly submitButton: Locator
  private readonly loadingText: Locator
  private readonly submitText: Locator
  private readonly registerLink: Locator

  // Selektory dla komunikatów błędów i walidacji
  private readonly emailError: Locator
  private readonly passwordError: Locator
  private readonly authMessageError: Locator
  private readonly authMessageSuccess: Locator
  private readonly authMessageText: Locator

  constructor(page: any) {
    super(page)

    // Inicjalizacja selektorów na podstawie data-testid
    this.pageContainer = this.getByTestId('login-page')
    this.loginForm = this.getByTestId('login-form')
    this.emailInput = this.getByTestId('login-email-input')
    this.passwordInput = this.getByTestId('login-password-input')
    this.submitButton = this.getByTestId('login-submit-button')
    this.loadingText = this.getByTestId('login-loading-text')
    this.submitText = this.getByTestId('login-submit-text')
    this.registerLink = this.getByTestId('register-link')

    // Komunikaty błędów
    this.emailError = this.getByTestId('login-email-error')
    this.passwordError = this.getByTestId('login-password-error')
    this.authMessageError = this.getByTestId('auth-message-error')
    this.authMessageSuccess = this.getByTestId('auth-message-success')
    this.authMessageText = this.getByTestId('auth-message-text')
  }

  /**
   * Nawigacja do strony logowania
   */
  async navigate(): Promise<void> {
    await this.goto('/auth/login')
  }

  /**
   * Sprawdzenie czy strona logowania jest załadowana
   */
  async expectPageLoaded(): Promise<void> {
    await this.expectVisible(this.pageContainer)
    await this.expectVisible(this.loginForm)
    await this.expectUrl('/auth/login')
  }

  /**
   * Wypełnienie pola email
   */
  async fillEmail(email: string): Promise<void> {
    await this.fillField(this.emailInput, email)
  }

  /**
   * Wypełnienie pola hasło
   */
  async fillPassword(password: string): Promise<void> {
    await this.fillField(this.passwordInput, password)
  }

  /**
   * Wypełnienie całego formularza logowania
   */
  async fillLoginForm(email: string, password: string): Promise<void> {
    await this.fillEmail(email)
    await this.fillPassword(password)
  }

  /**
   * Kliknięcie przycisku logowania
   */
  async clickSubmit(): Promise<void> {
    await this.clickElement(this.submitButton)
  }

  /**
   * Pełny proces logowania
   */
  async login(email: string, password: string): Promise<void> {
    await this.fillLoginForm(email, password)
    await this.clickSubmit()
  }

  /**
   * Sprawdzenie czy przycisk jest w stanie ładowania
   */
  async expectLoadingState(): Promise<void> {
    await this.expectVisible(this.loadingText)
    await this.expectText(this.loadingText, 'Logowanie...')
  }

  /**
   * Sprawdzenie czy przycisk jest w stanie normalnym
   */
  async expectNormalState(): Promise<void> {
    await this.expectVisible(this.submitText)
    await this.expectText(this.submitText, 'Zaloguj się')
  }

  /**
   * Sprawdzenie komunikatu sukcesu
   */
  async expectSuccessMessage(message?: string): Promise<void> {
    await this.expectVisible(this.authMessageSuccess)
    if (message) {
      await this.expectText(this.authMessageText, message)
    }
  }

  /**
   * Sprawdzenie komunikatu błędu
   */
  async expectErrorMessage(message?: string): Promise<void> {
    await this.expectVisible(this.authMessageError)
    if (message) {
      await this.expectText(this.authMessageText, message)
    }
  }

  /**
   * Sprawdzenie błędu walidacji email
   */
  async expectEmailValidationError(message: string): Promise<void> {
    await this.expectVisible(this.emailError)
    await this.expectText(this.emailError, message)
  }

  /**
   * Sprawdzenie błędu walidacji hasła
   */
  async expectPasswordValidationError(message: string): Promise<void> {
    await this.expectVisible(this.passwordError)
    await this.expectText(this.passwordError, message)
  }

  /**
   * Kliknięcie linku do rejestracji
   */
  async clickRegisterLink(): Promise<void> {
    await this.clickElement(this.registerLink)
  }

  /**
   * Sprawdzenie czy formularz jest zablokowany (podczas ładowania)
   */
  async expectFormDisabled(): Promise<void> {
    await this.expectVisible(this.emailInput)
    await this.expectVisible(this.passwordInput)
    // Sprawdzenie czy pola są zablokowane
    await this.page.waitForFunction(() => {
      const emailInput = document.querySelector(
        '[data-testid="login-email-input"]'
      ) as HTMLInputElement
      const passwordInput = document.querySelector(
        '[data-testid="login-password-input"]'
      ) as HTMLInputElement
      return emailInput?.disabled && passwordInput?.disabled
    })
  }

  /**
   * Sprawdzenie czy formularz jest aktywny
   */
  async expectFormEnabled(): Promise<void> {
    await this.expectVisible(this.emailInput)
    await this.expectVisible(this.passwordInput)
    // Sprawdzenie czy pola są aktywne
    await this.page.waitForFunction(() => {
      const emailInput = document.querySelector(
        '[data-testid="login-email-input"]'
      ) as HTMLInputElement
      const passwordInput = document.querySelector(
        '[data-testid="login-password-input"]'
      ) as HTMLInputElement
      return !emailInput?.disabled && !passwordInput?.disabled
    })
  }

  /**
   * Oczekiwanie na przekierowanie po udanym logowaniu
   */
  async expectRedirectToGenerate(): Promise<void> {
    await this.page.waitForURL('/generate')
    await this.expectUrl('/generate')
  }

  /**
   * Kompletny scenariusz logowania z weryfikacją
   */
  async performLoginFlow(email: string, password: string): Promise<void> {
    await this.navigate()
    await this.expectPageLoaded()
    await this.expectFormEnabled()

    await this.login(email, password)
    await this.expectLoadingState()
    await this.expectFormDisabled()

    await this.expectRedirectToGenerate()
  }
}
