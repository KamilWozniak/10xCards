import type { Page, Locator } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Base Page Object Class
 * Zawiera wspólne metody i funkcjonalności dla wszystkich stron
 */
export abstract class BasePage {
  protected page: Page

  constructor(page: Page) {
    this.page = page
  }

  /**
   * Nawigacja do określonej ścieżki
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path)
    await this.waitForPageLoad()
  }

  /**
   * Oczekiwanie na pełne załadowanie strony
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Sprawdzenie czy jesteśmy na określonym URL
   */
  async expectUrl(expectedPath: string): Promise<void> {
    await expect(this.page).toHaveURL(expectedPath)
  }

  /**
   * Sprawdzenie czy element jest widoczny
   */
  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible()
  }

  /**
   * Sprawdzenie czy element zawiera określony tekst
   */
  async expectText(locator: Locator, text: string): Promise<void> {
    await expect(locator).toHaveText(text)
  }

  /**
   * Kliknięcie w element z oczekiwaniem na widoczność
   */
  async clickElement(locator: Locator): Promise<void> {
    await this.expectVisible(locator)
    await locator.click()
  }

  /**
   * Wypełnienie pola tekstowego
   */
  async fillField(locator: Locator, value: string): Promise<void> {
    await this.expectVisible(locator)
    await locator.fill(value)
  }

  /**
   * Oczekiwanie na nawigację po akcji
   */
  async waitForNavigation(action: () => Promise<void>): Promise<void> {
    await Promise.all([this.page.waitForNavigation(), action()])
  }

  /**
   * Sprawdzenie czy strona zawiera określony data-testid
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId)
  }

  /**
   * Sprawdzenie obecnego URL
   */
  getCurrentUrl(): string {
    return this.page.url()
  }

  /**
   * Zrzut ekranu dla debugowania
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `tests/e2e/screenshots/${name}.png` })
  }
}
