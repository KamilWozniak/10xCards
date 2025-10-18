import type { Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object Class dla strony generowania fiszek (/generate)
 * Enkapsuluje wszystkie interakcje ze stroną główną aplikacji po zalogowaniu
 */
export class GeneratePage extends BasePage {
  // Selektory dla głównych elementów strony
  private readonly pageContainer: Locator
  private readonly pageHeader: Locator
  private readonly pageTitle: Locator
  private readonly pageDescription: Locator

  constructor(page: any) {
    super(page)

    // Inicjalizacja selektorów na podstawie data-testid
    this.pageContainer = this.getByTestId('generate-page')
    this.pageHeader = this.getByTestId('generate-page-header')
    this.pageTitle = this.getByTestId('generate-page-title')
    this.pageDescription = this.getByTestId('generate-page-description')
  }

  /**
   * Nawigacja do strony generowania
   */
  async navigate(): Promise<void> {
    await this.goto('/generate')
  }

  /**
   * Sprawdzenie czy strona generowania jest załadowana
   */
  async expectPageLoaded(): Promise<void> {
    await this.expectVisible(this.pageContainer)
    await this.expectVisible(this.pageHeader)
    await this.expectUrl('/generate')
  }

  /**
   * Sprawdzenie tytułu strony
   */
  async expectPageTitle(): Promise<void> {
    await this.expectVisible(this.pageTitle)
    await this.expectText(this.pageTitle, 'Generuj fiszki z AI')
  }

  /**
   * Sprawdzenie opisu strony
   */
  async expectPageDescription(): Promise<void> {
    await this.expectVisible(this.pageDescription)
    await this.expectText(
      this.pageDescription,
      'Wprowadź tekst (1000-10000 znaków), a AI wygeneruje dla Ciebie propozycje fiszek'
    )
  }

  /**
   * Sprawdzenie czy użytkownik został pomyślnie przekierowany po logowaniu
   */
  async expectSuccessfulRedirectFromLogin(): Promise<void> {
    await this.expectPageLoaded()
    await this.expectPageTitle()
    await this.expectPageDescription()
  }

  /**
   * Sprawdzenie czy strona zawiera wszystkie kluczowe elementy
   */
  async expectAllElementsVisible(): Promise<void> {
    await this.expectVisible(this.pageContainer)
    await this.expectVisible(this.pageHeader)
    await this.expectVisible(this.pageTitle)
    await this.expectVisible(this.pageDescription)
  }
}
