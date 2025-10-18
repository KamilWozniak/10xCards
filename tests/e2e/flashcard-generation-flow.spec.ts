import { test, expect } from '@playwright/test'
import {
  LoginPage,
  GeneratePage,
  TEST_USERS,
  GENERATION_TEST_DATA,
  validateTestEnvironment,
} from './page-objects'

/**
 * E2E Test Suite dla pełnego scenariusza generowania fiszek
 *
 * Scenariusz testowy:
 * 1. Użytkownik się loguje na stronie "/auth/login"
 * 2. Użytkownik zostaje przekierowany do "/generate"
 * 3. Użytkownik dodaje tekst do textArea na stronie "generate"
 * 4. Użytkownik klika przycisk "generuj fiszki"
 * 5. Użytkownik czeka na wygenerowanie fiszek
 * 6. Użytkownik widzi propozycje wygenerowanych fiszek pod formularzem
 */

test.describe('Flashcard Generation Flow', () => {
  let loginPage: LoginPage
  let generatePage: GeneratePage

  test.beforeEach(async ({ page }) => {
    // Walidacja środowiska testowego
    validateTestEnvironment()

    // Inicjalizacja Page Objects
    loginPage = new LoginPage(page)
    generatePage = new GeneratePage(page)
  })

  test('should complete full flashcard generation flow successfully', async ({ page }) => {
    // 1. Logowanie użytkownika
    await loginPage.navigate()
    await loginPage.expectPageLoaded()
    await loginPage.performLoginFlow(TEST_USERS.VALID_USER.email, TEST_USERS.VALID_USER.password)

    // 2. Weryfikacja przekierowania do /generate
    await generatePage.expectSuccessfulRedirectFromLogin()
    await generatePage.expectPageFullyLoaded()

    // 3. Wypełnienie formularza tekstem źródłowym
    await generatePage.sourceTextForm.expectFormVisible()
    await generatePage.sourceTextForm.fillSourceText(GENERATION_TEST_DATA.validText)

    // Weryfikacja walidacji formularza
    await generatePage.sourceTextForm.expectValidationState(true)
    await generatePage.sourceTextForm.expectButtonEnabled()

    // 4. Rozpoczęcie generowania fiszek
    await generatePage.sourceTextForm.clickGenerateButton()
    await generatePage.sourceTextForm.expectLoadingState()

    // 5. Oczekiwanie na zakończenie generowania
    await generatePage.generationState.expectLoadingState()
    const finalState = await generatePage.generationState.waitForStateChange(60000) // 60 sekund timeout

    expect(finalState).toBe('success')
    await generatePage.generationState.expectSuccessState()

    // 6. Weryfikacja wygenerowanych propozycji
    await generatePage.expectGenerationSuccess()
    await generatePage.proposalsList.expectProposalsVisible()

    const proposalCount = await generatePage.proposalsList.getProposalCount()
    expect(proposalCount).toBeGreaterThan(0)

    // Sprawdź czy wszystkie propozycje są załadowane
    await generatePage.proposalsList.expectAllProposalsLoaded()

    // Sprawdź stan początkowy propozycji
    const proposalIds = await generatePage.proposalItem.getAllProposalIds()
    for (const proposalId of proposalIds) {
      await generatePage.proposalItem.expectProposalState(proposalId, 'neutral')
    }
  })

  test('should handle form validation correctly', async ({ page }) => {
    // Logowanie
    await loginPage.performLoginFlow(TEST_USERS.VALID_USER.email, TEST_USERS.VALID_USER.password)
    await generatePage.expectPageFullyLoaded()

    // Test z pustym tekstem
    await generatePage.sourceTextForm.fillSourceText(GENERATION_TEST_DATA.emptyText)
    await generatePage.sourceTextForm.expectRequiredTextError()
    await generatePage.sourceTextForm.expectButtonDisabled()

    // Test z za krótkim tekstem
    await generatePage.sourceTextForm.fillSourceText(GENERATION_TEST_DATA.shortText)
    await generatePage.sourceTextForm.expectMinimumLengthError()
    await generatePage.sourceTextForm.expectValidationState(false)
    await generatePage.sourceTextForm.expectButtonDisabled()

    // Test z za długim tekstem
    await generatePage.sourceTextForm.fillSourceText(GENERATION_TEST_DATA.longText)
    await generatePage.sourceTextForm.expectMaximumLengthError()
    await generatePage.sourceTextForm.expectValidationState(false)
    await generatePage.sourceTextForm.expectButtonDisabled()

    // Test z poprawnym tekstem
    await generatePage.sourceTextForm.fillSourceText(GENERATION_TEST_DATA.validText)
    await generatePage.sourceTextForm.expectNoFormError()
    await generatePage.sourceTextForm.expectValidationState(true)
    await generatePage.sourceTextForm.expectButtonEnabled()
  })
})
