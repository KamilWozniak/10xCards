import type { Locator } from '@playwright/test'
import { BasePage } from './BasePage'
import { SourceTextFormComponent } from './components/SourceTextFormComponent'
import { GenerationStateComponent } from './components/GenerationStateComponent'
import { FlashcardProposalsListComponent } from './components/FlashcardProposalsListComponent'
import { FlashcardProposalItemComponent } from './components/FlashcardProposalItemComponent'
import { FlashcardEditModalComponent } from './components/FlashcardEditModalComponent'

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

  // Komponenty strony
  public readonly sourceTextForm: SourceTextFormComponent
  public readonly generationState: GenerationStateComponent
  public readonly proposalsList: FlashcardProposalsListComponent
  public readonly proposalItem: FlashcardProposalItemComponent
  public readonly editModal: FlashcardEditModalComponent

  constructor(page: any) {
    super(page)

    // Inicjalizacja selektorów na podstawie data-testid
    this.pageContainer = this.getByTestId('generate-page')
    this.pageHeader = this.getByTestId('generate-page-header')
    this.pageTitle = this.getByTestId('generate-page-title')
    this.pageDescription = this.getByTestId('generate-page-description')

    // Inicjalizacja komponentów
    this.sourceTextForm = new SourceTextFormComponent(page)
    this.generationState = new GenerationStateComponent(page)
    this.proposalsList = new FlashcardProposalsListComponent(page)
    this.proposalItem = new FlashcardProposalItemComponent(page)
    this.editModal = new FlashcardEditModalComponent(page)
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

  /**
   * Sprawdzenie czy strona jest w pełni załadowana z formularzem
   */
  async expectPageFullyLoaded(): Promise<void> {
    await this.expectPageLoaded()
    await this.expectPageTitle()
    await this.expectPageDescription()
    await this.sourceTextForm.expectFormVisible()
  }

  /**
   * Pełny scenariusz generowania fiszek
   */
  async performCompleteGenerationFlow(text: string): Promise<void> {
    // 1. Sprawdź czy strona jest załadowana
    await this.expectPageFullyLoaded()
    
    // 2. Wypełnij formularz i rozpocznij generowanie
    await this.sourceTextForm.performGenerationFlow(text)
    
    // 3. Oczekuj na rozpoczęcie ładowania
    await this.generationState.waitForLoadingStart()
    
    // 4. Oczekuj na zakończenie generowania
    const finalState = await this.generationState.waitForStateChange()
    
    if (finalState === 'error') {
      throw new Error('Generation failed with error')
    }
    
    // 5. Sprawdź czy propozycje są widoczne
    await this.expectGenerationSuccess()
  }

  /**
   * Weryfikacja udanego generowania fiszek
   */
  async expectGenerationSuccess(): Promise<void> {
    await this.generationState.expectSuccessState()
    await this.proposalsList.expectProposalsVisible()
    await this.proposalsList.expectProposalsExist()
    await this.proposalsList.expectAllProposalsLoaded()
  }

  /**
   * Akceptacja pierwszej propozycji
   */
  async acceptFirstProposal(): Promise<void> {
    // Pobierz ID pierwszej propozycji
    const proposalIds = await this.proposalItem.getAllProposalIds()
    
    if (proposalIds.length === 0) {
      throw new Error('No proposals available to accept')
    }
    
    const firstProposalId = proposalIds[0]
    await this.proposalItem.acceptProposal(firstProposalId)
    
    // Sprawdź aktualizację podsumowania
    await this.proposalsList.expectSelectionSummary(1)
    await this.proposalsList.expectSaveButtonEnabled(true)
  }

  /**
   * Akceptacja wszystkich propozycji
   */
  async acceptAllProposals(): Promise<void> {
    const proposalIds = await this.proposalItem.getAllProposalIds()
    
    if (proposalIds.length === 0) {
      throw new Error('No proposals available to accept')
    }
    
    // Akceptuj wszystkie propozycje
    for (const proposalId of proposalIds) {
      await this.proposalItem.clickAcceptButton(proposalId)
    }
    
    // Sprawdź podsumowanie
    await this.proposalsList.expectSelectionSummary(proposalIds.length)
    await this.proposalsList.expectSaveButtonEnabled(true)
  }

  /**
   * Edycja propozycji
   */
  async editProposal(proposalId: string, newFront: string, newBack: string): Promise<void> {
    // 1. Sprawdź czy propozycja istnieje
    const exists = await this.proposalItem.proposalExists(proposalId)
    if (!exists) {
      throw new Error(`Proposal with ID ${proposalId} does not exist`)
    }
    
    // 2. Kliknij przycisk edycji
    await this.proposalItem.clickEditButton(proposalId)
    
    // 3. Oczekuj na otwarcie modala
    await this.editModal.waitForModalOpen()
    
    // 4. Wykonaj edycję
    await this.editModal.performEdit(newFront, newBack)
    
    // 5. Sprawdź czy propozycja została zaktualizowana
    await this.proposalItem.expectProposalContent(proposalId, newFront, newBack)
    await this.proposalItem.expectProposalState(proposalId, 'accepted', newFront, newBack, 'Edytowane', true)
  }

  /**
   * Odrzucenie propozycji
   */
  async rejectProposal(proposalId: string): Promise<void> {
    await this.proposalItem.rejectProposal(proposalId)
  }

  /**
   * Zapisanie wybranych propozycji
   */
  async saveSelectedProposals(): Promise<void> {
    // Sprawdź czy są wybrane propozycje
    const selectedCount = await this.proposalsList.getSelectedCountFromUI()
    
    if (selectedCount === 0) {
      throw new Error('No proposals selected for saving')
    }
    
    // Kliknij przycisk zapisu
    await this.proposalsList.clickSaveSelectedButton()
    
    // Oczekuj na zakończenie operacji zapisu
    // (może wymagać dodatkowej logiki w zależności od implementacji)
  }

  /**
   * Kompletny scenariusz: generowanie, akceptacja i zapis
   */
  async performCompleteFlashcardCreationFlow(
    text: string,
    proposalsToAccept: number = 1
  ): Promise<void> {
    // 1. Wygeneruj propozycje
    await this.performCompleteGenerationFlow(text)
    
    // 2. Sprawdź liczbę wygenerowanych propozycji
    const totalCount = await this.proposalsList.getProposalCount()
    const proposalIds = await this.proposalItem.getAllProposalIds()
    
    if (totalCount < proposalsToAccept) {
      throw new Error(`Not enough proposals generated. Expected at least ${proposalsToAccept}, got ${totalCount}`)
    }
    
    // 3. Akceptuj określoną liczbę propozycji
    for (let i = 0; i < proposalsToAccept && i < proposalIds.length; i++) {
      await this.proposalItem.acceptProposal(proposalIds[i])
    }
    
    // 4. Sprawdź podsumowanie
    await this.proposalsList.expectCompleteProposalsState(
      totalCount,
      proposalsToAccept,
      proposalsToAccept,
      0
    )
    
    // 5. Zapisz wybrane propozycje
    await this.saveSelectedProposals()
  }

  /**
   * Scenariusz z edycją propozycji
   */
  async performGenerationWithEditFlow(
    text: string,
    proposalIdToEdit: string,
    newFront: string,
    newBack: string
  ): Promise<void> {
    // 1. Wygeneruj propozycje
    await this.performCompleteGenerationFlow(text)
    
    // 2. Edytuj określoną propozycję
    await this.editProposal(proposalIdToEdit, newFront, newBack)
    
    // 3. Sprawdź stan po edycji
    await this.proposalsList.expectSelectionSummary(1)
    await this.proposalsList.expectSelectionBreakdown(0, 1)
    
    // 4. Zapisz edytowaną propozycję
    await this.saveSelectedProposals()
  }

  /**
   * Obsługa błędu generowania z ponowieniem
   */
  async handleGenerationErrorWithRetry(text: string, maxRetries: number = 2): Promise<void> {
    let attempts = 0
    
    while (attempts < maxRetries) {
      try {
        await this.performCompleteGenerationFlow(text)
        return // Sukces
      } catch (error) {
        attempts++
        
        // Sprawdź czy wystąpił błąd generowania
        const hasError = await this.generationState.hasGenerationError()
        
        if (hasError && attempts < maxRetries) {
          // Spróbuj ponownie
          await this.generationState.handleErrorWithRetry()
          continue
        }
        
        // Przekaż błąd dalej jeśli wyczerpano próby
        throw error
      }
    }
  }

  /**
   * Sprawdzenie czy strona jest gotowa do generowania
   */
  async expectReadyForGeneration(): Promise<void> {
    await this.expectPageFullyLoaded()
    await this.sourceTextForm.expectButtonEnabled()
    await this.generationState.expectNoError()
  }
}
