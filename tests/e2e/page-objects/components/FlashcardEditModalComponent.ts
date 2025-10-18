import type { Locator } from '@playwright/test'
import { BasePage } from '../BasePage'

/**
 * Component Object Class dla modala edycji fiszki
 * Enkapsuluje wszystkie interakcje z modalem edycji propozycji fiszki
 */
export class FlashcardEditModalComponent extends BasePage {
  // Selektory dla elementów modala edycji
  private readonly modal: Locator
  private readonly frontTextarea: Locator
  private readonly backTextarea: Locator
  private readonly saveButton: Locator
  private readonly cancelButton: Locator

  constructor(page: any) {
    super(page)

    // Inicjalizacja selektorów na podstawie data-testid
    this.modal = this.getByTestId('flashcard-edit-modal')
    this.frontTextarea = this.getByTestId('edit-modal-front-textarea')
    this.backTextarea = this.getByTestId('edit-modal-back-textarea')
    this.saveButton = this.getByTestId('edit-modal-save-button')
    this.cancelButton = this.getByTestId('edit-modal-cancel-button')
  }

  /**
   * Sprawdzenie czy modal jest otwarty
   */
  async expectModalOpen(): Promise<void> {
    await this.expectVisible(this.modal)
    await this.expectVisible(this.frontTextarea)
    await this.expectVisible(this.backTextarea)
    await this.expectVisible(this.saveButton)
    await this.expectVisible(this.cancelButton)
  }

  /**
   * Sprawdzenie czy modal jest zamknięty
   */
  async expectModalClosed(): Promise<void> {
    const modalCount = await this.modal.count()
    if (modalCount > 0) {
      // Modal może istnieć ale być ukryty
      await this.page.waitForFunction(
        () => {
          const modal = document.querySelector('[data-testid="flashcard-edit-modal"]')
          return !modal || window.getComputedStyle(modal).display === 'none'
        },
        undefined,
        { timeout: 5000 }
      )
    }
  }

  /**
   * Oczekiwanie na otwarcie modala
   */
  async waitForModalOpen(timeout: number = 5000): Promise<void> {
    await this.page.waitForSelector('[data-testid="flashcard-edit-modal"]', { 
      state: 'visible',
      timeout 
    })
    await this.expectModalOpen()
  }

  /**
   * Oczekiwanie na zamknięcie modala
   */
  async waitForModalClose(timeout: number = 5000): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const modal = document.querySelector('[data-testid="flashcard-edit-modal"]')
        return !modal || window.getComputedStyle(modal).display === 'none'
      },
      undefined,
      { timeout }
    )
  }

  /**
   * Wypełnienie pola przodu fiszki
   */
  async fillFrontText(text: string): Promise<void> {
    await this.expectVisible(this.frontTextarea)
    await this.fillField(this.frontTextarea, text)
  }

  /**
   * Wypełnienie pola tyłu fiszki
   */
  async fillBackText(text: string): Promise<void> {
    await this.expectVisible(this.backTextarea)
    await this.fillField(this.backTextarea, text)
  }

  /**
   * Pobranie treści pola przodu
   */
  async getFrontText(): Promise<string> {
    await this.expectVisible(this.frontTextarea)
    return await this.frontTextarea.inputValue()
  }

  /**
   * Pobranie treści pola tyłu
   */
  async getBackText(): Promise<string> {
    await this.expectVisible(this.backTextarea)
    return await this.backTextarea.inputValue()
  }

  /**
   * Sprawdzenie limitów znaków dla pola przodu (200 znaków)
   */
  async expectFrontCharacterLimit(): Promise<void> {
    await this.expectVisible(this.frontTextarea)
    
    // Sprawdź atrybut maxlength
    const maxLength = await this.frontTextarea.getAttribute('maxlength')
    if (maxLength !== '200') {
      throw new Error(`Expected front textarea maxlength to be 200, but got ${maxLength}`)
    }
  }

  /**
   * Sprawdzenie limitów znaków dla pola tyłu (500 znaków)
   */
  async expectBackCharacterLimit(): Promise<void> {
    await this.expectVisible(this.backTextarea)
    
    // Sprawdź atrybut maxlength
    const maxLength = await this.backTextarea.getAttribute('maxlength')
    if (maxLength !== '500') {
      throw new Error(`Expected back textarea maxlength to be 500, but got ${maxLength}`)
    }
  }

  /**
   * Sprawdzenie limitów znaków dla obu pól
   */
  async expectCharacterLimits(): Promise<void> {
    await this.expectFrontCharacterLimit()
    await this.expectBackCharacterLimit()
  }

  /**
   * Sprawdzenie licznika znaków dla pola przodu
   */
  async expectFrontCharacterCount(count: number): Promise<void> {
    await this.page.waitForFunction(
      (expectedCount) => {
        const modal = document.querySelector('[data-testid="flashcard-edit-modal"]')
        if (!modal) return false
        
        // Znajdź licznik znaków dla pola przodu
        const frontSection = modal.querySelector('textarea[data-testid="edit-modal-front-textarea"]')?.closest('div')
        const counterText = frontSection?.querySelector('.text-xs.text-gray-500')?.textContent
        
        return counterText && counterText.includes(`${expectedCount}/200 znaków`)
      },
      count,
      { timeout: 5000 }
    )
  }

  /**
   * Sprawdzenie licznika znaków dla pola tyłu
   */
  async expectBackCharacterCount(count: number): Promise<void> {
    await this.page.waitForFunction(
      (expectedCount) => {
        const modal = document.querySelector('[data-testid="flashcard-edit-modal"]')
        if (!modal) return false
        
        // Znajdź licznik znaków dla pola tyłu
        const backSection = modal.querySelector('textarea[data-testid="edit-modal-back-textarea"]')?.closest('div')
        const counterText = backSection?.querySelector('.text-xs.text-gray-500')?.textContent
        
        return counterText && counterText.includes(`${expectedCount}/500 znaków`)
      },
      count,
      { timeout: 5000 }
    )
  }

  /**
   * Sprawdzenie błędów walidacji dla pola przodu
   */
  async expectFrontValidationError(message: string): Promise<void> {
    await this.page.waitForFunction(
      (expectedMessage) => {
        const modal = document.querySelector('[data-testid="flashcard-edit-modal"]')
        if (!modal) return false
        
        // Znajdź komunikat błędu dla pola przodu
        const frontSection = modal.querySelector('textarea[data-testid="edit-modal-front-textarea"]')?.closest('div')
        const errorText = frontSection?.querySelector('.text-sm.text-red-600')?.textContent
        
        return errorText && errorText.includes(expectedMessage)
      },
      message,
      { timeout: 5000 }
    )
  }

  /**
   * Sprawdzenie błędów walidacji dla pola tyłu
   */
  async expectBackValidationError(message: string): Promise<void> {
    await this.page.waitForFunction(
      (expectedMessage) => {
        const modal = document.querySelector('[data-testid="flashcard-edit-modal"]')
        if (!modal) return false
        
        // Znajdź komunikat błędu dla pola tyłu
        const backSection = modal.querySelector('textarea[data-testid="edit-modal-back-textarea"]')?.closest('div')
        const errorText = backSection?.querySelector('.text-sm.text-red-600')?.textContent
        
        return errorText && errorText.includes(expectedMessage)
      },
      message,
      { timeout: 5000 }
    )
  }

  /**
   * Sprawdzenie braku błędów walidacji
   */
  async expectNoValidationErrors(): Promise<void> {
    await this.page.waitForFunction(
      () => {
        const modal = document.querySelector('[data-testid="flashcard-edit-modal"]')
        if (!modal) return true
        
        // Sprawdź czy nie ma komunikatów błędów
        const errors = modal.querySelectorAll('.text-sm.text-red-600')
        return errors.length === 0
      },
      undefined,
      { timeout: 5000 }
    )
  }

  /**
   * Kliknięcie przycisku zapisu
   */
  async clickSaveButton(): Promise<void> {
    await this.expectVisible(this.saveButton)
    await this.clickElement(this.saveButton)
  }

  /**
   * Kliknięcie przycisku anulowania
   */
  async clickCancelButton(): Promise<void> {
    await this.expectVisible(this.cancelButton)
    await this.clickElement(this.cancelButton)
  }

  /**
   * Sprawdzenie czy przycisk zapisu jest aktywny
   */
  async expectSaveButtonEnabled(enabled: boolean = true): Promise<void> {
    await this.expectVisible(this.saveButton)
    
    if (enabled) {
      await this.page.waitForFunction(
        () => {
          const button = document.querySelector('[data-testid="edit-modal-save-button"]') as HTMLButtonElement
          return button && !button.disabled
        },
        undefined,
        { timeout: 5000 }
      )
    } else {
      await this.page.waitForFunction(
        () => {
          const button = document.querySelector('[data-testid="edit-modal-save-button"]') as HTMLButtonElement
          return button && button.disabled
        },
        undefined,
        { timeout: 5000 }
      )
    }
  }

  /**
   * Sprawdzenie tekstów przycisków
   */
  async expectButtonTexts(): Promise<void> {
    await this.expectVisible(this.saveButton)
    await this.expectVisible(this.cancelButton)
    await this.expectText(this.saveButton, 'Zapisz zmiany')
    await this.expectText(this.cancelButton, 'Anuluj')
  }

  /**
   * Sprawdzenie tytułu modala
   */
  async expectModalTitle(): Promise<void> {
    const titleLocator = this.modal.locator('h2, [data-testid*="title"]').first()
    await this.expectVisible(titleLocator)
    await this.expectText(titleLocator, 'Edytuj fiszkę')
  }

  /**
   * Sprawdzenie opisu modala
   */
  async expectModalDescription(): Promise<void> {
    const descriptionLocator = this.modal.locator('p, [data-testid*="description"]').first()
    await this.expectVisible(descriptionLocator)
    await this.expectText(descriptionLocator, 'Wprowadź zmiany w treści fiszki')
  }

  /**
   * Zamknięcie modala przez kliknięcie w tło
   */
  async clickBackdropToClose(): Promise<void> {
    // Kliknij w tło modala (backdrop)
    await this.modal.click({ position: { x: 10, y: 10 } })
    await this.waitForModalClose()
  }

  /**
   * Wypełnienie obu pól i sprawdzenie walidacji
   */
  async fillBothFields(frontText: string, backText: string): Promise<void> {
    await this.fillFrontText(frontText)
    await this.fillBackText(backText)
    
    // Sprawdź liczniki znaków
    await this.expectFrontCharacterCount(frontText.length)
    await this.expectBackCharacterCount(backText.length)
    
    // Sprawdź czy przyciski są w odpowiednim stanie
    const isValid = frontText.trim().length > 0 && 
                   frontText.length <= 200 && 
                   backText.trim().length > 0 && 
                   backText.length <= 500
    
    await this.expectSaveButtonEnabled(isValid)
  }

  /**
   * Kompletny scenariusz edycji fiszki
   */
  async performEdit(frontText: string, backText: string): Promise<void> {
    await this.expectModalOpen()
    await this.expectModalTitle()
    await this.expectModalDescription()
    await this.expectCharacterLimits()
    await this.expectButtonTexts()
    
    await this.fillBothFields(frontText, backText)
    await this.expectNoValidationErrors()
    await this.expectSaveButtonEnabled(true)
    
    await this.clickSaveButton()
    await this.waitForModalClose()
  }

  /**
   * Scenariusz anulowania edycji
   */
  async performCancel(): Promise<void> {
    await this.expectModalOpen()
    await this.clickCancelButton()
    await this.waitForModalClose()
  }

  /**
   * Sprawdzenie czy modal zawiera początkowe dane
   */
  async expectInitialData(expectedFront: string, expectedBack: string): Promise<void> {
    await this.expectModalOpen()
    
    const currentFront = await this.getFrontText()
    const currentBack = await this.getBackText()
    
    if (currentFront !== expectedFront) {
      throw new Error(`Expected front text "${expectedFront}", but got "${currentFront}"`)
    }
    
    if (currentBack !== expectedBack) {
      throw new Error(`Expected back text "${expectedBack}", but got "${currentBack}"`)
    }
  }
}
