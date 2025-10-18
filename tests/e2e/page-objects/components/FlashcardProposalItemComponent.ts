import type { Locator } from '@playwright/test'
import { BasePage } from '../BasePage'

/**
 * Component Object Class dla pojedynczej propozycji fiszki
 * Enkapsuluje wszystkie interakcje z pojedynczym elementem propozycji
 */
export class FlashcardProposalItemComponent extends BasePage {
  constructor(page: any) {
    super(page)
  }

  /**
   * Pobranie lokalizatora karty propozycji na podstawie ID
   */
  private getProposalCard(proposalId: string): Locator {
    return this.getByTestId(`proposal-card-${proposalId}`)
  }

  /**
   * Pobranie lokalizatora treści przodu propozycji
   */
  private getFrontContent(proposalId: string): Locator {
    return this.getProposalCard(proposalId).locator('[data-testid="proposal-front-content"]')
  }

  /**
   * Pobranie lokalizatora treści tyłu propozycji
   */
  private getBackContent(proposalId: string): Locator {
    return this.getProposalCard(proposalId).locator('[data-testid="proposal-back-content"]')
  }

  /**
   * Pobranie lokalizatora przycisku akceptacji
   */
  private getAcceptButton(proposalId: string): Locator {
    return this.getByTestId(`proposal-accept-button-${proposalId}`)
  }

  /**
   * Pobranie lokalizatora przycisku odrzucenia
   */
  private getRejectButton(proposalId: string): Locator {
    return this.getByTestId(`proposal-reject-button-${proposalId}`)
  }

  /**
   * Pobranie lokalizatora przycisku edycji
   */
  private getEditButton(proposalId: string): Locator {
    return this.getByTestId(`proposal-edit-button-${proposalId}`)
  }

  /**
   * Pobranie lokalizatora statusu zaakceptowania
   */
  private getAcceptedStatus(proposalId: string): Locator {
    return this.getProposalCard(proposalId).locator('[data-testid="proposal-accepted-status"]')
  }

  /**
   * Pobranie lokalizatora statusu odrzucenia
   */
  private getRejectedStatus(proposalId: string): Locator {
    return this.getProposalCard(proposalId).locator('[data-testid="proposal-rejected-status"]')
  }

  /**
   * Pobranie lokalizatora znacznika źródła
   */
  private getSourceBadge(proposalId: string): Locator {
    return this.getProposalCard(proposalId).locator('[data-testid="proposal-source-badge"]')
  }

  /**
   * Pobranie lokalizatora etykiety edycji
   */
  private getEditedLabel(proposalId: string): Locator {
    return this.getProposalCard(proposalId).locator('[data-testid="proposal-edited-label"]')
  }

  /**
   * Sprawdzenie czy propozycja jest widoczna
   */
  async expectProposalVisible(proposalId: string): Promise<void> {
    const card = this.getProposalCard(proposalId)
    await this.expectVisible(card)
  }

  /**
   * Sprawdzenie treści propozycji (przód i tył)
   */
  async expectProposalContent(proposalId: string, front: string, back: string): Promise<void> {
    const frontContent = this.getFrontContent(proposalId)
    const backContent = this.getBackContent(proposalId)

    await this.expectVisible(frontContent)
    await this.expectVisible(backContent)
    await this.expectText(frontContent, front)
    await this.expectText(backContent, back)
  }

  /**
   * Pobranie treści przodu propozycji
   */
  async getFrontContent(proposalId: string): Promise<string> {
    const frontContent = this.getFrontContent(proposalId)
    await this.expectVisible(frontContent)
    return (await frontContent.textContent()) || ''
  }

  /**
   * Pobranie treści tyłu propozycji
   */
  async getBackContent(proposalId: string): Promise<string> {
    const backContent = this.getBackContent(proposalId)
    await this.expectVisible(backContent)
    return (await backContent.textContent()) || ''
  }

  /**
   * Sprawdzenie znacznika źródła propozycji
   */
  async expectSourceBadge(proposalId: string, type: 'AI' | 'Edytowane'): Promise<void> {
    const sourceBadge = this.getSourceBadge(proposalId)
    await this.expectVisible(sourceBadge)
    await this.expectText(sourceBadge, type)
  }

  /**
   * Sprawdzenie czy propozycja jest oznaczona jako edytowana
   */
  async expectEditedLabel(proposalId: string, shouldBeVisible: boolean = true): Promise<void> {
    const editedLabel = this.getEditedLabel(proposalId)

    if (shouldBeVisible) {
      await this.expectVisible(editedLabel)
      await this.expectText(editedLabel, '(edytowane)')
    } else {
      const labelCount = await editedLabel.count()
      if (labelCount > 0) {
        throw new Error('Edited label should not be visible')
      }
    }
  }

  /**
   * Kliknięcie przycisku akceptacji
   */
  async clickAcceptButton(proposalId: string): Promise<void> {
    const acceptButton = this.getAcceptButton(proposalId)
    await this.expectVisible(acceptButton)
    await this.clickElement(acceptButton)
  }

  /**
   * Kliknięcie przycisku odrzucenia
   */
  async clickRejectButton(proposalId: string): Promise<void> {
    const rejectButton = this.getRejectButton(proposalId)
    await this.expectVisible(rejectButton)
    await this.clickElement(rejectButton)
  }

  /**
   * Kliknięcie przycisku edycji
   */
  async clickEditButton(proposalId: string): Promise<void> {
    const editButton = this.getEditButton(proposalId)
    await this.expectVisible(editButton)
    await this.clickElement(editButton)
  }

  /**
   * Sprawdzenie stanu zaakceptowania
   */
  async expectAcceptedStatus(proposalId: string): Promise<void> {
    const acceptedStatus = this.getAcceptedStatus(proposalId)
    await this.expectVisible(acceptedStatus)
    await this.expectText(acceptedStatus, 'Zaakceptowane')
  }

  /**
   * Sprawdzenie stanu odrzucenia
   */
  async expectRejectedStatus(proposalId: string): Promise<void> {
    const rejectedStatus = this.getRejectedStatus(proposalId)
    await this.expectVisible(rejectedStatus)
    await this.expectText(rejectedStatus, 'Odrzucone')
  }

  /**
   * Sprawdzenie czy propozycja jest w stanie neutralnym (nie zaakceptowana, nie odrzucona)
   */
  async expectNeutralStatus(proposalId: string): Promise<void> {
    const acceptedStatus = this.getAcceptedStatus(proposalId)
    const rejectedStatus = this.getRejectedStatus(proposalId)

    const acceptedCount = await acceptedStatus.count()
    const rejectedCount = await rejectedStatus.count()

    if (acceptedCount > 0 || rejectedCount > 0) {
      throw new Error('Proposal should be in neutral state (neither accepted nor rejected)')
    }
  }

  /**
   * Sprawdzenie widoczności przycisków akcji
   */
  async expectButtonsVisible(
    proposalId: string,
    expectedButtons: ('accept' | 'reject' | 'edit')[]
  ): Promise<void> {
    const acceptButton = this.getAcceptButton(proposalId)
    const rejectButton = this.getRejectButton(proposalId)
    const editButton = this.getEditButton(proposalId)

    if (expectedButtons.includes('accept')) {
      await this.expectVisible(acceptButton)
      await this.expectText(acceptButton, 'Akceptuj')
    } else {
      const acceptCount = await acceptButton.count()
      if (acceptCount > 0) {
        throw new Error('Accept button should not be visible')
      }
    }

    if (expectedButtons.includes('reject')) {
      await this.expectVisible(rejectButton)
      await this.expectText(rejectButton, 'Odrzuć')
    } else {
      const rejectCount = await rejectButton.count()
      if (rejectCount > 0) {
        throw new Error('Reject button should not be visible')
      }
    }

    if (expectedButtons.includes('edit')) {
      await this.expectVisible(editButton)
      await this.expectText(editButton, 'Edytuj')
    } else {
      const editCount = await editButton.count()
      if (editCount > 0) {
        throw new Error('Edit button should not be visible')
      }
    }
  }

  /**
   * Sprawdzenie czy propozycja ma opacity 50% (stan odrzucony)
   */
  async expectRejectedOpacity(proposalId: string): Promise<void> {
    const card = this.getProposalCard(proposalId)
    await this.expectVisible(card)

    await this.page.waitForFunction(
      id => {
        const element = document.querySelector(`[data-testid="proposal-card-${id}"]`)
        return element && element.classList.contains('opacity-50')
      },
      proposalId,
      { timeout: 5000 }
    )
  }

  /**
   * Sprawdzenie normalnej opacity (nie odrzucona)
   */
  async expectNormalOpacity(proposalId: string): Promise<void> {
    const card = this.getProposalCard(proposalId)
    await this.expectVisible(card)

    await this.page.waitForFunction(
      id => {
        const element = document.querySelector(`[data-testid="proposal-card-${id}"]`)
        return element && !element.classList.contains('opacity-50')
      },
      proposalId,
      { timeout: 5000 }
    )
  }

  /**
   * Sprawdzenie kompletnego stanu propozycji
   */
  async expectProposalState(
    proposalId: string,
    expectedState: 'neutral' | 'accepted' | 'rejected',
    front?: string,
    back?: string,
    sourceType?: 'AI' | 'Edytowane',
    isEdited?: boolean
  ): Promise<void> {
    await this.expectProposalVisible(proposalId)

    if (front && back) {
      await this.expectProposalContent(proposalId, front, back)
    }

    if (sourceType) {
      await this.expectSourceBadge(proposalId, sourceType)
    }

    if (isEdited !== undefined) {
      await this.expectEditedLabel(proposalId, isEdited)
    }

    switch (expectedState) {
      case 'neutral':
        await this.expectNeutralStatus(proposalId)
        await this.expectNormalOpacity(proposalId)
        await this.expectButtonsVisible(proposalId, ['accept', 'reject', 'edit'])
        break

      case 'accepted':
        await this.expectAcceptedStatus(proposalId)
        await this.expectNormalOpacity(proposalId)
        await this.expectButtonsVisible(proposalId, ['reject', 'edit'])
        break

      case 'rejected':
        await this.expectRejectedStatus(proposalId)
        await this.expectRejectedOpacity(proposalId)
        await this.expectButtonsVisible(proposalId, [])
        break
    }
  }

  /**
   * Pełny scenariusz akceptacji propozycji
   */
  async acceptProposal(proposalId: string): Promise<void> {
    await this.expectProposalState(proposalId, 'neutral')
    await this.clickAcceptButton(proposalId)
    await this.expectProposalState(proposalId, 'accepted')
  }

  /**
   * Pełny scenariusz odrzucenia propozycji
   */
  async rejectProposal(proposalId: string): Promise<void> {
    await this.expectProposalState(proposalId, 'neutral')
    await this.clickRejectButton(proposalId)
    await this.expectProposalState(proposalId, 'rejected')
  }

  /**
   * Pobranie wszystkich ID propozycji na stronie
   */
  async getAllProposalIds(): Promise<string[]> {
    const proposalCards = this.page.locator('[data-testid^="proposal-card-"]')
    const count = await proposalCards.count()
    const ids: string[] = []

    for (let i = 0; i < count; i++) {
      const card = proposalCards.nth(i)
      const testId = await card.getAttribute('data-testid')
      if (testId) {
        const id = testId.replace('proposal-card-', '')
        ids.push(id)
      }
    }

    return ids
  }

  /**
   * Sprawdzenie czy propozycja istnieje
   */
  async proposalExists(proposalId: string): Promise<boolean> {
    const card = this.getProposalCard(proposalId)
    const count = await card.count()
    return count > 0
  }
}
