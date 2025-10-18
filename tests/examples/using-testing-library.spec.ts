/**
 * Example test demonstrating Testing Library usage
 * This file shows best practices for testing Vue components
 * using @testing-library/vue
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'

/**
 * Example component for testing
 * In real tests, you would import your actual component
 */
const ExampleButton = {
  name: 'ExampleButton',
  props: {
    label: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  template: `
    <button
      :disabled="disabled"
      @click="$emit('click')"
      class="btn"
    >
      {{ label }}
    </button>
  `,
}

describe('Testing Library Examples', () => {
  describe('Basic Rendering', () => {
    it('renders component with props', () => {
      // Arrange & Act
      render(ExampleButton, {
        props: {
          label: 'Click me',
        },
      })

      // Assert - Use user-centric queries
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
    })

    it('renders with different text', () => {
      render(ExampleButton, {
        props: {
          label: 'Submit',
        },
      })

      expect(screen.getByText('Submit')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('handles click events', async () => {
      // Arrange
      const onClick = vi.fn()

      render(ExampleButton, {
        props: {
          label: 'Click me',
        },
        attrs: {
          onClick,
        },
      })

      // Act
      const button = screen.getByRole('button', { name: /click me/i })
      await fireEvent.click(button)

      // Assert
      expect(onClick).toHaveBeenCalledOnce()
    })

    it('respects disabled state', async () => {
      const onClick = vi.fn()

      render(ExampleButton, {
        props: {
          label: 'Disabled',
          disabled: true,
        },
        attrs: {
          onClick,
        },
      })

      const button = screen.getByRole('button', { name: /disabled/i })

      // Assert button is disabled
      expect(button).toBeDisabled()

      // Try to click (won't trigger handler due to disabled)
      await fireEvent.click(button)
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('Query Methods', () => {
    it('demonstrates different query methods', () => {
      render(ExampleButton, {
        props: {
          label: 'Find me',
        },
      })

      // getBy* - throws if not found (best for assertions)
      const byRole = screen.getByRole('button')
      expect(byRole).toBeInTheDocument()

      const byText = screen.getByText('Find me')
      expect(byText).toBeInTheDocument()

      // queryBy* - returns null if not found (best for asserting absence)
      const notFound = screen.queryByText('Does not exist')
      expect(notFound).toBeNull()

      // findBy* - async, waits for element (best for async updates)
      // const async = await screen.findByText('Appears later')
    })
  })
})

/**
 * Best Practices Demonstrated:
 *
 * 1. Use semantic queries (getByRole, getByLabelText) over getByTestId
 * 2. Use regex matching for flexible text assertions (/click me/i)
 * 3. Test user behavior, not implementation details
 * 4. Use Arrange-Act-Assert pattern
 * 5. Make async actions explicit with await
 * 6. Prefer toBeInTheDocument() for presence checks
 * 7. Use queryBy* for asserting element absence
 * 8. Mock event handlers with vi.fn()
 */
