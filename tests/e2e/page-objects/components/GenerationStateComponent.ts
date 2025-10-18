import type { Locator } from '@playwright/test'
import { BasePage } from '../BasePage'

/**
 * Component Object Class dla stanów generowania fiszek
 * Enkapsuluje wszystkie interakcje ze stanami loading, error i success podczas generowania
 */
export class GenerationStateComponent extends BasePage {
  // Selektory dla elementów stanu generowania
  private readonly loadingSpinner: Locator
  private readonly errorMessage: Locator
  private readonly retryButton: Locator

  constructor(page: any) {
    super(page)

    // Inicjalizacja selektorów na podstawie data-testid
    this.loadingSpinner = this.getByTestId('generation-loading-spinner')
    this.errorMessage = this.getByTestId('generation-error-message')
    this.retryButton = this.getByTestId('generation-retry-button')
  }

  /**
   * Sprawdzenie czy spinner ładowania jest widoczny
   */
  async expectLoadingSpinner(): Promise<void> {
    await this.expectVisible(this.loadingSpinner)
  }

  /**
   * Sprawdzenie czy spinner ładowania nie jest widoczny
   */
  async expectLoadingSpinnerHidden(): Promise<void> {
    const spinnerCount = await this.loadingSpinner.count()
    if (spinnerCount > 0) {
      // Jeśli spinner istnieje, sprawdź czy jest ukryty
      await this.page.waitForFunction(
        () => {
          const spinner = document.querySelector('[data-testid="generation-loading-spinner"]')
          return !spinner || window.getComputedStyle(spinner).display === 'none'
        },
        { timeout: 10000 }
      )
    }
  }

  /**
   * Oczekiwanie na rozpoczęcie ładowania
   */
  async waitForLoadingStart(): Promise<void> {
    await this.expectLoadingSpinner()
  }

  /**
   * Oczekiwanie na zakończenie ładowania
   */
  async waitForLoadingComplete(timeout: number = 30000): Promise<void> {
    // Najpierw sprawdź czy loading się rozpoczął
    try {
      await this.expectLoadingSpinner()
    } catch {
      // Loading może już się zakończyć
      return
    }

    // Następnie czekaj na zakończenie
    await this.page.waitForFunction(
      () => {
        const spinner = document.querySelector('[data-testid="generation-loading-spinner"]')
        return !spinner || window.getComputedStyle(spinner).display === 'none'
      },
      { timeout }
    )
  }

  /**
   * Sprawdzenie komunikatu błędu
   */
  async expectErrorMessage(message?: string): Promise<void> {
    await this.expectVisible(this.errorMessage)
    
    if (message) {
      // Sprawdź czy komunikat zawiera oczekiwany tekst
      await this.page.waitForFunction(
        (expectedMessage) => {
          const errorElement = document.querySelector('[data-testid="generation-error-message"]')
          return errorElement && errorElement.textContent?.includes(expectedMessage)
        },
        message,
        { timeout: 5000 }
      )
    }
  }

  /**
   * Pobranie treści komunikatu błędu
   */
  async getErrorMessage(): Promise<string> {
    await this.expectVisible(this.errorMessage)
    const text = await this.errorMessage.textContent()
    return text || ''
  }

  /**
   * Sprawdzenie braku błędu
   */
  async expectNoError(): Promise<void> {
    const errorCount = await this.errorMessage.count()
    if (errorCount > 0) {
      // Sprawdź czy element błędu jest ukryty
      await this.page.waitForFunction(
        () => {
          const error = document.querySelector('[data-testid="generation-error-message"]')
          return !error || window.getComputedStyle(error).display === 'none'
        },
        { timeout: 5000 }
      )
    }
  }

  /**
   * Kliknięcie przycisku ponowienia
   */
  async clickRetryButton(): Promise<void> {
    await this.expectVisible(this.retryButton)
    await this.clickElement(this.retryButton)
  }

  /**
   * Sprawdzenie czy przycisk ponowienia jest widoczny
   */
  async expectRetryButtonVisible(): Promise<void> {
    await this.expectVisible(this.retryButton)
    await this.expectText(this.retryButton, 'Spróbuj ponownie')
  }

  /**
   * Sprawdzenie czy przycisk ponowienia nie jest widoczny
   */
  async expectRetryButtonHidden(): Promise<void> {
    const retryCount = await this.retryButton.count()
    if (retryCount > 0) {
      throw new Error('Retry button should not be visible')
    }
  }

  /**
   * Sprawdzenie stanu sukcesu (brak loading i error)
   */
  async expectSuccessState(): Promise<void> {
    await this.expectLoadingSpinnerHidden()
    await this.expectNoError()
  }

  /**
   * Sprawdzenie stanu błędu z możliwością ponowienia
   */
  async expectErrorState(expectedMessage?: string): Promise<void> {
    await this.expectLoadingSpinnerHidden()
    await this.expectErrorMessage(expectedMessage)
    await this.expectRetryButtonVisible()
  }

  /**
   * Sprawdzenie stanu ładowania
   */
  async expectLoadingState(): Promise<void> {
    await this.expectLoadingSpinner()
    await this.expectNoError()
    await this.expectRetryButtonHidden()
  }

  /**
   * Oczekiwanie na zmianę stanu z loading na success lub error
   */
  async waitForStateChange(timeout: number = 30000): Promise<'success' | 'error'> {
    // Najpierw sprawdź czy jest loading
    try {
      await this.expectLoadingSpinner()
    } catch {
      // Może już być w stanie końcowym
    }

    // Czekaj na zakończenie loading
    await this.waitForLoadingComplete(timeout)

    // Sprawdź końcowy stan
    const errorCount = await this.errorMessage.count()
    if (errorCount > 0) {
      // Sprawdź czy error jest widoczny
      try {
        await this.expectErrorMessage()
        return 'error'
      } catch {
        return 'success'
      }
    }

    return 'success'
  }

  /**
   * Kompletny scenariusz obsługi błędu z ponowieniem
   */
  async handleErrorWithRetry(expectedErrorMessage?: string): Promise<void> {
    await this.expectErrorState(expectedErrorMessage)
    await this.clickRetryButton()
    await this.expectLoadingState()
  }

  /**
   * Sprawdzenie czy generowanie jest w toku
   */
  async isGenerationInProgress(): Promise<boolean> {
    const spinnerCount = await this.loadingSpinner.count()
    if (spinnerCount === 0) return false

    return await this.page.evaluate(() => {
      const spinner = document.querySelector('[data-testid="generation-loading-spinner"]')
      return spinner && window.getComputedStyle(spinner).display !== 'none'
    })
  }

  /**
   * Sprawdzenie czy wystąpił błąd generowania
   */
  async hasGenerationError(): Promise<boolean> {
    const errorCount = await this.errorMessage.count()
    if (errorCount === 0) return false

    return await this.page.evaluate(() => {
      const error = document.querySelector('[data-testid="generation-error-message"]')
      return error && window.getComputedStyle(error).display !== 'none'
    })
  }

  /**
   * Oczekiwanie na określony stan generowania
   */
  async waitForSpecificState(
    expectedState: 'loading' | 'success' | 'error',
    timeout: number = 30000
  ): Promise<void> {
    await this.page.waitForFunction(
      (state) => {
        const spinner = document.querySelector('[data-testid="generation-loading-spinner"]')
        const error = document.querySelector('[data-testid="generation-error-message"]')
        
        const isLoading = spinner && window.getComputedStyle(spinner).display !== 'none'
        const hasError = error && window.getComputedStyle(error).display !== 'none'
        
        switch (state) {
          case 'loading':
            return isLoading && !hasError
          case 'error':
            return !isLoading && hasError
          case 'success':
            return !isLoading && !hasError
          default:
            return false
        }
      },
      expectedState,
      { timeout }
    )
  }
}
