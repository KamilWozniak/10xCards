import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import SourceTextForm from '../SourceTextForm.vue'

// Create a default mock implementation
const createMockFormValidation = () => ({
  formValidation: ref({
    isValid: false,
    characterCount: 0,
    errorMessage: null,
    minLength: 1000,
    maxLength: 10000,
  }),
  validateText: vi.fn((text: string) => {
    const length = text.trim().length
    return length >= 1000 && length <= 10000
  }),
  resetValidation: vi.fn(),
})

// Mock composables
vi.mock('~/composables/useFormValidation', () => ({
  useFormValidation: vi.fn(() => createMockFormValidation()),
}))

describe('SourceTextForm', () => {
  let wrapper: ReturnType<typeof mount>

  beforeEach(() => {
    wrapper = mount(SourceTextForm, {
      props: {
        isLoading: false,
        disabled: false,
      },
    })
  })

  describe('component initialization', () => {
    it('should render the component with default state', () => {
      // Assert
      expect(wrapper.find('textarea').exists()).toBe(true)
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.text()).toContain('Tekst źródłowy')
      expect(wrapper.text()).toContain(
        'Wprowadź tekst, z którego AI wygeneruje fiszki (1000-10000 znaków)'
      )
    })

    it('should initialize with empty form data', () => {
      // Assert
      const textarea = wrapper.find('textarea')
      expect(textarea.element.value).toBe('')
      expect(wrapper.text()).toContain('0 znaków')
    })

    it('should display character count limits', () => {
      // Assert
      expect(wrapper.text()).toContain('min: 1000')
      expect(wrapper.text()).toContain('max: 10000')
    })

    it('should have disabled generate button when form is invalid', () => {
      // Assert
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should display placeholder in textarea', () => {
      // Assert
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('placeholder')).toBe('Wprowadź tekst źródłowy...')
    })
  })

  describe('props handling', () => {
    it('should disable textarea when disabled prop is true', async () => {
      // Arrange & Act
      await wrapper.setProps({ disabled: true })

      // Assert
      const textarea = wrapper.find('textarea')
      expect(textarea.attributes('disabled')).toBeDefined()
    })

    it('should disable button when disabled prop is true', async () => {
      // Arrange & Act
      await wrapper.setProps({ disabled: true })

      // Assert
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('should show loading state when isLoading is true', async () => {
      // Arrange & Act
      await wrapper.setProps({ isLoading: true })

      // Assert
      expect(wrapper.text()).toContain('Generuję fiszki...')
    })

    it('should show normal text when isLoading is false', async () => {
      // Arrange & Act
      await wrapper.setProps({ isLoading: false })

      // Assert
      expect(wrapper.text()).toContain('Generuj fiszki')
      expect(wrapper.text()).not.toContain('Generuję fiszki...')
    })

    it('should disable button when both disabled and isLoading are true', async () => {
      // Arrange & Act
      await wrapper.setProps({ disabled: true, isLoading: true })

      // Assert
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBeDefined()
    })
  })

  describe('text input handling', () => {
    it('should update character count on input', async () => {
      // Arrange
      const textarea = wrapper.find('textarea')
      const testText = 'a'.repeat(1500)

      // Act
      await textarea.setValue(testText)
      await textarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('1500 znaków')
    })

    it('should trim text for character count calculation', async () => {
      // Arrange
      const textarea = wrapper.find('textarea')
      const testText = '   ' + 'a'.repeat(1500) + '   '

      // Act
      await textarea.setValue(testText)
      await textarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('1500 znaków')
    })

    it('should call validateText on input', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      const mockValidateText = vi.fn()
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: false,
          characterCount: 0,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: mockValidateText,
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      const textarea = wrapper.find('textarea')
      const testText = 'test input'

      // Act
      await textarea.setValue(testText)
      await textarea.trigger('input')

      // Assert
      expect(mockValidateText).toHaveBeenCalledWith(testText)
    })

    it('should update v-model binding on input', async () => {
      // Arrange
      const textarea = wrapper.find('textarea')
      const testText = 'Test text content'

      // Act
      await textarea.setValue(testText)
      await nextTick()

      // Assert
      expect(textarea.element.value).toBe(testText)
    })

    it('should handle empty input', async () => {
      // Arrange
      const textarea = wrapper.find('textarea')

      // Act
      await textarea.setValue('')
      await textarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('0 znaków')
    })

    it('should handle very long text input', async () => {
      // Arrange
      const textarea = wrapper.find('textarea')
      const testText = 'a'.repeat(15000)

      // Act
      await textarea.setValue(testText)
      await textarea.trigger('input')
      await nextTick()

      // Assert
      expect(wrapper.text()).toContain('15000 znaków')
    })
  })

  describe('form validation display', () => {
    it('should show error message when validation fails', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: false,
          characterCount: 500,
          errorMessage: 'Tekst musi mieć co najmniej 1000 znaków (obecnie: 500)',
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Assert
      expect(wrapper.text()).toContain('Tekst musi mieć co najmniej 1000 znaków (obecnie: 500)')
    })

    it('should not show error message when validation passes', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: true,
          characterCount: 5000,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Assert
      const errorMessages = wrapper.findAll('.text-sm.text-red-600')
      expect(errorMessages.length).toBe(0)
    })

    it('should apply green color when form is valid', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: true,
          characterCount: 5000,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Assert
      expect(wrapper.html()).toContain('text-green-600')
    })

    it('should apply red color when form is invalid', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: false,
          characterCount: 500,
          errorMessage: 'Error',
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Assert
      expect(wrapper.html()).toContain('text-red-600')
    })
  })

  describe('progress bar', () => {
    it('should show progress bar with correct width for valid input', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: true,
          characterCount: 5500,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(() => true),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Act - Input text to trigger character count update
      const textarea = wrapper.find('textarea')
      await textarea.setValue('a'.repeat(5500))
      await textarea.trigger('input')
      await nextTick()

      // Assert
      const progressBar = wrapper.find('.rounded-full.transition-all')
      expect(progressBar.exists()).toBe(true)
      // Progress = ((5500 - 1000) / (10000 - 1000)) * 100 = 50%
      expect(progressBar.attributes('style')).toContain('50%')
    })

    it('should show green progress bar when valid', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: true,
          characterCount: 5000,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Assert
      expect(wrapper.html()).toContain('bg-green-500')
    })

    it('should show red progress bar when invalid', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: false,
          characterCount: 500,
          errorMessage: 'Too short',
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Assert
      expect(wrapper.html()).toContain('bg-red-500')
    })

    it('should calculate 0% progress for minimum length', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: true,
          characterCount: 1000,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Assert
      const progressBar = wrapper.find('.rounded-full.transition-all')
      expect(progressBar.attributes('style')).toContain('0%')
    })

    it('should calculate 100% progress for maximum length', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: true,
          characterCount: 10000,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(() => true),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Act - Input text to trigger character count update
      const textarea = wrapper.find('textarea')
      await textarea.setValue('a'.repeat(10000))
      await textarea.trigger('input')
      await nextTick()

      // Assert
      const progressBar = wrapper.find('.rounded-full.transition-all')
      expect(progressBar.attributes('style')).toContain('100%')
    })
  })

  describe('generate button and emit', () => {
    it('should emit generate event with trimmed text on button click', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: true,
          characterCount: 5000,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(() => true),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      const testText = '   ' + 'a'.repeat(5000) + '   '
      const textarea = wrapper.find('textarea')
      await textarea.setValue(testText)
      await nextTick()

      // Act
      const button = wrapper.find('button')
      await button.trigger('click')

      // Assert
      expect(wrapper.emitted('generate')).toBeTruthy()
      expect(wrapper.emitted('generate')?.[0]).toEqual([testText.trim()])
    })

    it('should not emit when form is invalid', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: false,
          characterCount: 500,
          errorMessage: 'Too short',
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(() => false),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Act
      const button = wrapper.find('button')
      await button.trigger('click')

      // Assert
      expect(wrapper.emitted('generate')).toBeFalsy()
    })

    it('should not emit when text is empty after trim', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: false,
          characterCount: 0,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(() => false),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      const textarea = wrapper.find('textarea')
      await textarea.setValue('   ')

      // Act
      const button = wrapper.find('button')
      await button.trigger('click')

      // Assert
      expect(wrapper.emitted('generate')).toBeFalsy()
    })

    it('should enable button when form is valid and not disabled', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: true,
          characterCount: 5000,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: vi.fn(),
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      // Assert
      const button = wrapper.find('button')
      expect(button.attributes('disabled')).toBe(undefined)
    })
  })

  describe('disabled state and form reset', () => {
    it('should reset form data when disabled changes to true', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      const mockResetValidation = vi.fn()
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: true,
          characterCount: 5000,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: mockResetValidation,
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      const textarea = wrapper.find('textarea')
      await textarea.setValue('a'.repeat(5000))

      // Act
      await wrapper.setProps({ disabled: true })
      await nextTick()

      // Assert
      expect(mockResetValidation).toHaveBeenCalled()
      expect(wrapper.text()).toContain('0 znaków')
    })

    it('should clear textarea when disabled changes to true', async () => {
      // Arrange
      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: false,
        },
      })

      const textarea = wrapper.find('textarea')
      await textarea.setValue('a'.repeat(5000))

      // Act
      await wrapper.setProps({ disabled: true })
      await nextTick()

      // Assert
      expect(textarea.element.value).toBe('')
    })

    it('should not reset form when disabled changes to false', async () => {
      // Arrange
      const { useFormValidation } = await import('~/composables/useFormValidation')
      const mockResetValidation = vi.fn()
      vi.mocked(useFormValidation).mockReturnValue({
        formValidation: ref({
          isValid: false,
          characterCount: 0,
          errorMessage: null,
          minLength: 1000,
          maxLength: 10000,
        }),
        validateText: vi.fn(),
        resetValidation: mockResetValidation,
      } as any)

      wrapper = mount(SourceTextForm, {
        props: {
          isLoading: false,
          disabled: true,
        },
      })

      mockResetValidation.mockClear()

      // Act
      await wrapper.setProps({ disabled: false })
      await nextTick()

      // Assert
      expect(mockResetValidation).not.toHaveBeenCalled()
    })
  })
})
