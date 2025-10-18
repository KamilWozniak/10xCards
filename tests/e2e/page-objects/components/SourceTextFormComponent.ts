import type { Locator } from '@playwright/test'
import { expect } from '@playwright/test'
import { BasePage } from '../BasePage'

/**
 * Component Object Class dla formularza tekstu źródłowego
 * Enkapsuluje wszystkie interakcje z formularzem wprowadzania tekstu do generowania fiszek
 */
export class SourceTextFormComponent extends BasePage {
  // Selektory dla głównych elementów formularza
  private readonly formContainer: Locator
  private readonly textArea: Locator
  private readonly characterCounterSection: Locator
  private readonly characterCount: Locator
  private readonly progressBar: Locator
  private readonly progressFill: Locator
  private readonly validationError: Locator
  private readonly generateButton: Locator
  private readonly loadingText: Locator
  private readonly buttonText: Locator

  constructor(page: any) {
    super(page)

    // Inicjalizacja selektorów na podstawie data-testid
    this.formContainer = this.getByTestId('source-text-form')
    this.textArea = this.getByTestId('source-text-textarea')
    this.characterCounterSection = this.getByTestId('character-counter-section')
    this.characterCount = this.getByTestId('character-count')
    this.progressBar = this.getByTestId('character-progress-bar')
    this.progressFill = this.getByTestId('character-progress-fill')
    this.validationError = this.getByTestId('form-validation-error')
    this.generateButton = this.getByTestId('generate-flashcards-button')
    this.loadingText = this.getByTestId('generate-loading-text')
    this.buttonText = this.getByTestId('generate-button-text')
  }

  /**
   * Sprawdzenie czy formularz jest widoczny i załadowany
   */
  async expectFormVisible(): Promise<void> {
    await this.expectVisible(this.formContainer)
    await this.expectVisible(this.textArea)
    await this.expectVisible(this.generateButton)
  }

  /**
   * Wypełnienie pola tekstowego
   */
  async fillSourceText(text: string): Promise<void> {
    await this.expectVisible(this.textArea)
    await this.fillField(this.textArea, text)
  }

  /**
   * Sprawdzenie licznika znaków
   */
  async expectCharacterCount(count: number): Promise<void> {
    await this.expectVisible(this.characterCount)
    await this.expectText(this.characterCount, `${count} znaków`)
  }

  /**
   * Pobranie aktualnej liczby znaków z licznika
   */
  async getCharacterCount(): Promise<number> {
    await this.expectVisible(this.characterCount)
    const text = await this.characterCount.textContent()
    const match = text?.match(/(\d+) znaków/)
    return match ? parseInt(match[1], 10) : 0
  }

  /**
   * Sprawdzenie stanu walidacji formularza
   */
  async expectValidationState(isValid: boolean): Promise<void> {
    await this.expectVisible(this.characterCount)
    
    if (isValid) {
      // Sprawdzenie czy tekst ma zielony kolor (valid state)
      await this.page.waitForFunction(
        () => {
          const element = document.querySelector('[data-testid="character-count"]')
          return element && window.getComputedStyle(element).color.includes('22, 163, 74') // text-green-600
        },
        { timeout: 5000 }
      )
    } else {
      // Sprawdzenie czy tekst ma czerwony kolor (invalid state)
      await this.page.waitForFunction(
        () => {
          const element = document.querySelector('[data-testid="character-count"]')
          return element && window.getComputedStyle(element).color.includes('220, 38, 38') // text-red-600
        },
        { timeout: 5000 }
      )
    }
  }

  /**
   * Sprawdzenie paska postępu
   */
  async expectProgressBar(): Promise<void> {
    await this.expectVisible(this.progressBar)
    await this.expectVisible(this.progressFill)
  }

  /**
   * Sprawdzenie koloru paska postępu na podstawie stanu walidacji
   */
  async expectProgressBarColor(isValid: boolean): Promise<void> {
    await this.expectVisible(this.progressFill)
    
    if (isValid) {
      // Sprawdzenie zielonego koloru dla valid state
      await this.page.waitForFunction(
        () => {
          const element = document.querySelector('[data-testid="character-progress-fill"]')
          return element && element.classList.contains('bg-green-500')
        },
        { timeout: 5000 }
      )
    } else {
      // Sprawdzenie czerwonego koloru dla invalid state
      await this.page.waitForFunction(
        () => {
          const element = document.querySelector('[data-testid="character-progress-fill"]')
          return element && element.classList.contains('bg-red-500')
        },
        { timeout: 5000 }
      )
    }
  }

  /**
   * Sprawdzenie komunikatu błędu walidacji
   */
  async expectFormError(message: string): Promise<void> {
    await this.expectVisible(this.validationError)
    await expect(this.validationError).toContainText(message)
  }

  /**
   * Sprawdzenie braku błędu walidacji
   */
  async expectNoFormError(): Promise<void> {
    const errorCount = await this.validationError.count()
    if (errorCount > 0) {
      throw new Error('Validation error should not be visible')
    }
  }

  /**
   * Kliknięcie przycisku generowania
   */
  async clickGenerateButton(): Promise<void> {
    await this.expectVisible(this.generateButton)
    await this.clickElement(this.generateButton)
  }

  /**
   * Sprawdzenie czy przycisk jest w stanie ładowania
   */
  async expectLoadingState(): Promise<void> {
    await this.expectVisible(this.loadingText)
    await this.expectText(this.loadingText, 'Generuję fiszki...')
  }

  /**
   * Sprawdzenie czy przycisk jest w stanie normalnym
   */
  async expectNormalState(): Promise<void> {
    await this.expectVisible(this.buttonText)
    await this.expectText(this.buttonText, 'Generuj fiszki')
  }

  /**
   * Sprawdzenie czy przycisk jest zablokowany
   */
  async expectButtonDisabled(): Promise<void> {
    await this.expectVisible(this.generateButton)
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('[data-testid="generate-flashcards-button"]') as HTMLButtonElement
        return button?.disabled === true
      },
      { timeout: 5000 }
    )
  }

  /**
   * Sprawdzenie czy przycisk jest aktywny
   */
  async expectButtonEnabled(): Promise<void> {
    await this.expectVisible(this.generateButton)
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('[data-testid="generate-flashcards-button"]') as HTMLButtonElement
        return button?.disabled === false
      },
      { timeout: 5000 }
    )
  }

  /**
   * Sprawdzenie minimalnej długości tekstu (1000 znaków)
   */
  async expectMinimumLengthError(): Promise<void> {
    await this.expectFormError('Tekst musi mieć co najmniej 1000 znaków (obecnie:')
  }

  /**
   * Sprawdzenie maksymalnej długości tekstu (10000 znaków)
   */
  async expectMaximumLengthError(): Promise<void> {
    await this.expectFormError('Tekst nie może przekraczać 10000 znaków (obecnie:')
  }

  /**
   * Sprawdzenie czy formularz wymaga tekstu
   */
  async expectRequiredTextError(): Promise<void> {
    await this.expectFormError('Tekst jest wymagany')
  }

  /**
   * Kompletny scenariusz wypełnienia i walidacji formularza
   */
  async fillAndValidateForm(text: string): Promise<void> {
    await this.expectFormVisible()
    await this.fillSourceText(text)
    
    // Oczekiwanie na aktualizację licznika znaków
    await this.page.waitForTimeout(500)
    
    const characterCount = await this.getCharacterCount()
    const isValid = characterCount >= 1000 && characterCount <= 10000
    
    await this.expectValidationState(isValid)
    await this.expectProgressBarColor(isValid)
    
    if (isValid) {
      await this.expectButtonEnabled()
      await this.expectNoFormError()
    } else {
      await this.expectButtonDisabled()
    }
  }

  /**
   * Pełny scenariusz generowania fiszek
   */
  async performGenerationFlow(text: string): Promise<void> {
    await this.fillAndValidateForm(text)
    await this.expectButtonEnabled()
    await this.clickGenerateButton()
    await this.expectLoadingState()
  }
}
