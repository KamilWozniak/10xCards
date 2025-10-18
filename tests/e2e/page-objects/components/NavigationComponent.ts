import type { Locator } from '@playwright/test'
import { BasePage } from '../BasePage'

/**
 * Component Object Class dla nawigacji głównej aplikacji
 * Enkapsuluje wszystkie interakcje z paskiem nawigacji (layout default)
 */
export class NavigationComponent extends BasePage {
  // Selektory dla elementów nawigacji
  private readonly appLayout: Locator
  private readonly mainNavigation: Locator
  private readonly appLogo: Locator
  private readonly userSection: Locator
  private readonly userAvatar: Locator
  private readonly userEmail: Locator
  private readonly logoutButton: Locator

  constructor(page: any) {
    super(page)

    // Inicjalizacja selektorów na podstawie data-testid
    this.appLayout = this.getByTestId('app-layout')
    this.mainNavigation = this.getByTestId('main-navigation')
    this.appLogo = this.getByTestId('app-logo')
    this.userSection = this.getByTestId('user-section')
    this.userAvatar = this.getByTestId('user-avatar')
    this.userEmail = this.getByTestId('user-email')
    this.logoutButton = this.getByTestId('logout-button')
  }

  /**
   * Sprawdzenie czy nawigacja jest widoczna
   */
  async expectNavigationVisible(): Promise<void> {
    await this.expectVisible(this.appLayout)
    await this.expectVisible(this.mainNavigation)
  }

  /**
   * Sprawdzenie czy logo aplikacji jest widoczne
   */
  async expectLogoVisible(): Promise<void> {
    await this.expectVisible(this.appLogo)
    await this.expectText(this.appLogo, '10xCards')
  }

  /**
   * Sprawdzenie czy sekcja użytkownika jest widoczna
   */
  async expectUserSectionVisible(): Promise<void> {
    await this.expectVisible(this.userSection)
    await this.expectVisible(this.userAvatar)
    await this.expectVisible(this.logoutButton)
  }

  /**
   * Sprawdzenie czy email użytkownika jest wyświetlany
   */
  async expectUserEmailVisible(expectedEmail?: string): Promise<void> {
    await this.expectVisible(this.userEmail)
    if (expectedEmail) {
      await this.expectText(this.userEmail, expectedEmail)
    }
  }

  /**
   * Kliknięcie w logo (przekierowanie do /generate)
   */
  async clickLogo(): Promise<void> {
    await this.clickElement(this.appLogo)
  }

  /**
   * Kliknięcie przycisku wylogowania
   */
  async clickLogout(): Promise<void> {
    await this.clickElement(this.logoutButton)
  }

  /**
   * Sprawdzenie czy przycisk wylogowania ma odpowiedni tekst
   */
  async expectLogoutButtonText(): Promise<void> {
    await this.expectVisible(this.logoutButton)
    await this.expectText(this.logoutButton, 'Wyloguj')
  }

  /**
   * Sprawdzenie kompletnej nawigacji po zalogowaniu
   */
  async expectAuthenticatedNavigation(userEmail?: string): Promise<void> {
    await this.expectNavigationVisible()
    await this.expectLogoVisible()
    await this.expectUserSectionVisible()
    await this.expectLogoutButtonText()

    if (userEmail) {
      await this.expectUserEmailVisible(userEmail)
    }
  }

  /**
   * Proces wylogowania z oczekiwaniem na przekierowanie
   */
  async performLogout(): Promise<void> {
    await this.expectUserSectionVisible()
    await this.clickLogout()

    // Oczekiwanie na przekierowanie do strony logowania
    await this.page.waitForURL('/auth/login')
    await this.expectUrl('/auth/login')
  }

  /**
   * Sprawdzenie czy nawigacja nie jest widoczna (dla stron auth)
   */
  async expectNavigationNotVisible(): Promise<void> {
    // Na stronach auth nawigacja nie powinna być widoczna
    await this.page.waitForTimeout(1000) // Krótkie oczekiwanie
    const navigationCount = await this.mainNavigation.count()
    if (navigationCount > 0) {
      throw new Error('Navigation should not be visible on auth pages')
    }
  }
}
