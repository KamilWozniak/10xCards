import type { Locator } from '@playwright/test'
import { BasePage } from '../BasePage'

/**
 * Component Object Class dla listy propozycji fiszek
 * Enkapsuluje wszystkie interakcje z kontenerem listy propozycji i funkcjami zarządzania
 */
export class FlashcardProposalsListComponent extends BasePage {
  // Selektory dla głównych elementów listy propozycji
  private readonly proposalsContainer: Locator
  private readonly proposalsList: Locator
  private readonly emptyState: Locator
  private readonly selectionSummary: Locator
  private readonly selectedCount: Locator
  private readonly selectionBreakdown: Locator
  private readonly saveSelectedButton: Locator

  constructor(page: any) {
    super(page)

    // Inicjalizacja selektorów na podstawie data-testid
    this.proposalsContainer = this.getByTestId('flashcard-proposals-container')
    this.proposalsList = this.getByTestId('proposals-list')
    this.emptyState = this.getByTestId('proposals-empty-state')
    this.selectionSummary = this.getByTestId('selection-summary')
    this.selectedCount = this.getByTestId('selected-count')
    this.selectionBreakdown = this.getByTestId('selection-breakdown')
    this.saveSelectedButton = this.getByTestId('save-selected-flashcards-button')
  }

  /**
   * Sprawdzenie czy kontener propozycji jest widoczny
   */
  async expectProposalsVisible(): Promise<void> {
    await this.expectVisible(this.proposalsContainer)
    await this.expectVisible(this.proposalsList)
  }

  /**
   * Sprawdzenie czy kontener propozycji nie jest widoczny
   */
  async expectProposalsHidden(): Promise<void> {
    const containerCount = await this.proposalsContainer.count()
    if (containerCount > 0) {
      throw new Error('Proposals container should not be visible')
    }
  }

  /**
   * Sprawdzenie stanu pustego (brak propozycji)
   */
  async expectEmptyState(): Promise<void> {
    await this.expectVisible(this.emptyState)
    await this.expectText(this.emptyState, 'Brak propozycji do wyświetlenia')
  }

  /**
   * Sprawdzenie czy stan pusty nie jest widoczny
   */
  async expectEmptyStateHidden(): Promise<void> {
    const emptyCount = await this.emptyState.count()
    if (emptyCount > 0) {
      throw new Error('Empty state should not be visible when proposals exist')
    }
  }

  /**
   * Pobranie liczby propozycji w liście
   */
  async getProposalCount(): Promise<number> {
    try {
      // Sprawdź czy lista propozycji jest widoczna
      await this.expectVisible(this.proposalsList)
    } catch {
      // Jeśli lista nie jest widoczna, może być stan pusty
      const emptyStateCount = await this.emptyState.count()
      if (emptyStateCount > 0) {
        return 0
      }
      // Jeśli ani lista ani stan pusty nie są widoczne, zwróć 0
      return 0
    }

    // Poczekaj krótko na załadowanie propozycji
    await this.page.waitForTimeout(1000)

    // Zlicz elementy propozycji na podstawie data-testid pattern
    const proposalCards = this.page.locator('[data-testid^="proposal-card-"]')
    const count = await proposalCards.count()

    // Dodatkowe debugowanie
    if (count === 0) {
      const allCards = await this.page.locator('div[data-testid*="proposal"]').count()
      console.log(`Debug: Found ${allCards} elements with 'proposal' in data-testid`)
    }

    return count
  }

  /**
   * Sprawdzenie czy lista zawiera określoną liczbę propozycji
   */
  async expectProposalCount(expectedCount: number): Promise<void> {
    const actualCount = await this.getProposalCount()
    if (actualCount !== expectedCount) {
      throw new Error(`Expected ${expectedCount} proposals, but found ${actualCount}`)
    }
  }

  /**
   * Sprawdzenie czy propozycje są widoczne (co najmniej jedna)
   */
  async expectProposalsExist(): Promise<void> {
    // Poczekaj na załadowanie propozycji
    await this.waitForProposalsLoad()

    // Sprawdź czy kontener jest widoczny
    await this.expectProposalsVisible()

    // Poczekaj na pojawienie się propozycji z timeout
    await this.page.waitForFunction(
      () => {
        const proposalCards = document.querySelectorAll('[data-testid^="proposal-card-"]')
        return proposalCards.length > 0
      },
      undefined,
      { timeout: 10000 }
    )

    const count = await this.getProposalCount()
    if (count === 0) {
      throw new Error('Expected at least one proposal to be visible')
    }
  }

  /**
   * Sprawdzenie podsumowania wyboru
   */
  async expectSelectionSummary(selectedCount: number): Promise<void> {
    if (selectedCount > 0) {
      await this.expectVisible(this.selectionSummary)
      await this.expectVisible(this.selectedCount)

      // Sprawdź tekst z liczbą wybranych
      await this.page.waitForFunction(
        count => {
          const element = document.querySelector('[data-testid="selected-count"]')
          return element && element.textContent?.includes(`${count} fiszek wybranych`)
        },
        selectedCount,
        { timeout: 5000 }
      )
    } else {
      // Gdy nic nie wybrano, podsumowanie może być ukryte lub pokazywać 0
      const summaryCount = await this.selectionSummary.count()
      if (summaryCount > 0) {
        await this.page.waitForFunction(
          () => {
            const element = document.querySelector('[data-testid="selected-count"]')
            return element && element.textContent?.includes('0 fiszek wybranych')
          },
          undefined,
          { timeout: 5000 }
        )
      }
    }
  }

  /**
   * Sprawdzenie szczegółów wyboru (zaakceptowane vs edytowane)
   */
  async expectSelectionBreakdown(acceptedCount: number, editedCount: number): Promise<void> {
    if (acceptedCount > 0 || editedCount > 0) {
      await this.expectVisible(this.selectionBreakdown)

      await this.page.waitForFunction(
        (accepted, edited) => {
          const element = document.querySelector('[data-testid="selection-breakdown"]')
          const text = element?.textContent || ''
          return (
            text.includes(`${accepted} zaakceptowanych`) && text.includes(`${edited} edytowanych`)
          )
        },
        [acceptedCount, editedCount],
        { timeout: 5000 }
      )
    }
  }

  /**
   * Pobranie liczby wybranych propozycji z UI
   */
  async getSelectedCountFromUI(): Promise<number> {
    try {
      await this.expectVisible(this.selectedCount)
      const text = await this.selectedCount.textContent()
      const match = text?.match(/(\d+) fiszek wybranych/)
      return match ? parseInt(match[1], 10) : 0
    } catch {
      return 0
    }
  }

  /**
   * Kliknięcie przycisku zapisu wybranych fiszek
   */
  async clickSaveSelectedButton(): Promise<void> {
    await this.expectVisible(this.saveSelectedButton)
    await this.clickElement(this.saveSelectedButton)
  }

  /**
   * Sprawdzenie czy przycisk zapisu jest aktywny
   */
  async expectSaveButtonEnabled(enabled: boolean = true): Promise<void> {
    await this.expectVisible(this.saveSelectedButton)

    if (enabled) {
      await this.page.waitForFunction(
        () => {
          const button = document.querySelector(
            '[data-testid="save-selected-flashcards-button"]'
          ) as HTMLButtonElement
          return button && !button.disabled
        },
        undefined,
        { timeout: 5000 }
      )
    } else {
      await this.page.waitForFunction(
        () => {
          const button = document.querySelector(
            '[data-testid="save-selected-flashcards-button"]'
          ) as HTMLButtonElement
          return button && button.disabled
        },
        undefined,
        { timeout: 5000 }
      )
    }
  }

  /**
   * Sprawdzenie tekstu przycisku zapisu
   */
  async expectSaveButtonText(selectedCount: number): Promise<void> {
    await this.expectVisible(this.saveSelectedButton)
    await this.expectText(this.saveSelectedButton, `Zapisz wybrane fiszki (${selectedCount})`)
  }

  /**
   * Sprawdzenie tytułu listy propozycji
   */
  async expectProposalsTitle(): Promise<void> {
    const titleLocator = this.proposalsContainer.locator('h2, [data-testid*="title"]').first()
    await this.expectVisible(titleLocator)
    await this.expectText(titleLocator, 'Propozycje fiszek')
  }

  /**
   * Sprawdzenie opisu listy propozycji z licznikiem
   */
  async expectProposalsDescription(selectedCount: number, totalCount: number): Promise<void> {
    const descriptionLocator = this.proposalsContainer
      .locator('[data-testid*="description"], p')
      .first()
    await this.expectVisible(descriptionLocator)

    await this.page.waitForFunction(
      (selected, total) => {
        const descriptions = document.querySelectorAll(
          '[data-testid="flashcard-proposals-container"] p'
        )
        for (const desc of descriptions) {
          if (desc.textContent?.includes(`(${selected}/${total})`)) {
            return true
          }
        }
        return false
      },
      [selectedCount, totalCount],
      { timeout: 5000 }
    )
  }

  /**
   * Oczekiwanie na załadowanie propozycji
   */
  async waitForProposalsLoad(timeout: number = 15000): Promise<void> {
    // Najpierw poczekaj na pojawienie się kontenera propozycji
    await this.page.waitForSelector('[data-testid="flashcard-proposals-container"]', {
      state: 'visible',
      timeout,
    })

    // Następnie poczekaj na załadowanie zawartości
    await this.page.waitForFunction(
      () => {
        const container = document.querySelector('[data-testid="flashcard-proposals-container"]')
        if (!container) return false

        const list = document.querySelector('[data-testid="proposals-list"]')
        const empty = document.querySelector('[data-testid="proposals-empty-state"]')

        // Sprawdź czy lista ma propozycje
        if (list) {
          const proposalCards = document.querySelectorAll('[data-testid^="proposal-card-"]')
          return proposalCards.length > 0
        }

        // Lub czy jest stan pusty
        return !!empty
      },
      undefined,
      { timeout: Math.max(5000, timeout - 10000) } // Zostaw trochę czasu z głównego timeout
    )
  }

  /**
   * Sprawdzenie kompletnego stanu listy propozycji
   */
  async expectCompleteProposalsState(
    totalCount: number,
    selectedCount: number = 0,
    acceptedCount: number = 0,
    editedCount: number = 0
  ): Promise<void> {
    if (totalCount === 0) {
      await this.expectEmptyState()
      return
    }

    await this.expectProposalsVisible()
    await this.expectProposalCount(totalCount)
    await this.expectProposalsDescription(selectedCount, totalCount)

    if (selectedCount > 0) {
      await this.expectSelectionSummary(selectedCount)
      await this.expectSelectionBreakdown(acceptedCount, editedCount)
      await this.expectSaveButtonEnabled(true)
      await this.expectSaveButtonText(selectedCount)
    } else {
      await this.expectSaveButtonEnabled(false)
    }
  }

  /**
   * Metoda debugowania - wypisuje informacje o stanie DOM
   */
  async debugProposalsState(): Promise<void> {
    console.log('=== DEBUG: Proposals State ===')

    const containerExists = await this.proposalsContainer.count()
    const containerVisible = containerExists > 0 ? await this.proposalsContainer.isVisible() : false
    console.log(`Container exists: ${containerExists}, visible: ${containerVisible}`)

    const listExists = await this.proposalsList.count()
    const listVisible = listExists > 0 ? await this.proposalsList.isVisible() : false
    console.log(`List exists: ${listExists}, visible: ${listVisible}`)

    const emptyExists = await this.emptyState.count()
    const emptyVisible = emptyExists > 0 ? await this.emptyState.isVisible() : false
    console.log(`Empty state exists: ${emptyExists}, visible: ${emptyVisible}`)

    const proposalCards = await this.page.locator('[data-testid^="proposal-card-"]').count()
    console.log(`Proposal cards found: ${proposalCards}`)

    // Sprawdź wszystkie elementy z "proposal" w data-testid
    const allProposalElements = await this.page.locator('[data-testid*="proposal"]').count()
    console.log(`All elements with 'proposal' in testid: ${allProposalElements}`)

    // Sprawdź czy jest widoczny element z listą propozycji z pages/generate.vue
    const proposalsListFromPage = await this.page.getByTestId('flashcard-proposals-list').count()
    console.log(`flashcard-proposals-list elements (from page): ${proposalsListFromPage}`)

    // Sprawdź strukturę DOM
    const htmlContent = await this.page.evaluate(() => {
      const container = document.querySelector('[data-testid="flashcard-proposals-container"]')
      return container ? container.outerHTML.substring(0, 500) : 'Container not found'
    })
    console.log(`Container HTML: ${htmlContent}`)

    console.log('=== END DEBUG ===')
  }

  /**
   * Sprawdzenie czy wszystkie propozycje są załadowane i widoczne
   */
  async expectAllProposalsLoaded(): Promise<void> {
    try {
      await this.waitForProposalsLoad()
      await this.expectProposalsExist()

      // Sprawdź czy wszystkie karty propozycji są w pełni załadowane
      const proposalCards = this.page.locator('[data-testid^="proposal-card-"]')
      const count = await proposalCards.count()

      for (let i = 0; i < count; i++) {
        const card = proposalCards.nth(i)
        await this.expectVisible(card)

        // Sprawdź czy karta zawiera podstawowe elementy
        const frontContent = card.locator('[data-testid="proposal-front-content"]')
        const backContent = card.locator('[data-testid="proposal-back-content"]')

        await this.expectVisible(frontContent)
        await this.expectVisible(backContent)
      }
    } catch (error) {
      // W przypadku błędu, wypisz informacje debugowania
      await this.debugProposalsState()
      throw error
    }
  }
}
