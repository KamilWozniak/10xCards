# Testing Guide

This document provides comprehensive guidance for testing the 10xCards application.

## Overview

The project uses two testing frameworks:
- **Vitest** for unit and component tests
- **Playwright** for E2E (end-to-end) tests

## Testing Stack

### Unit Testing
- **Vitest** - Fast unit test framework with Vite integration
- **@nuxt/test-utils** - Nuxt-specific testing utilities
- **@vue/test-utils** - Vue component testing utilities
- **@testing-library/vue** - User-centric component testing
- **@testing-library/dom** - DOM testing utilities
- **@pinia/testing** - Pinia store testing utilities
- **happy-dom** - Lightweight DOM implementation
- **MSW (Mock Service Worker)** - HTTP request mocking
- **@faker-js/faker** - Test data generation
- **@vitest/coverage-v8** - Code coverage reporting
- **@vitest/ui** - Interactive test UI

### E2E Testing
- **Playwright** - Browser automation framework
- **@playwright/test** - Playwright test runner
- Configured with Chromium/Desktop Chrome only (per project guidelines)

## Directory Structure

```
tests/
├── e2e/              # Playwright E2E tests
│   ├── example.spec.ts
│   └── results/      # Test results (gitignored)
├── setup/            # Test setup files
│   └── vitest.setup.ts
└── fixtures/         # Shared test data and mocks
    ├── data/         # Mock data
    ├── factories/    # Data factories
    └── mocks/        # Mock implementations

__tests__/            # Co-located unit tests
├── ComponentName.spec.ts
└── ComponentName.nuxt.spec.ts
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
pnpm test
# or
pnpm test:unit

# Run tests in watch mode (recommended during development)
pnpm test:unit:watch

# Run tests with interactive UI
pnpm test:unit:ui

# Run tests with coverage report
pnpm test:unit:coverage

# Run specific test file
pnpm test path/to/file.spec.ts

# Run tests matching a pattern
pnpm test -t "pattern"
```

### E2E Tests

```bash
# Run E2E tests (headless)
pnpm test:e2e

# Run E2E tests with UI mode
pnpm test:e2e:ui

# Run E2E tests in headed mode (see browser)
pnpm test:e2e:headed

# Run E2E tests in debug mode
pnpm test:e2e:debug

# Install Playwright browsers (one-time setup)
pnpm playwright:install
```

## Writing Tests

### Unit Tests

Follow the guidelines from `.cursor/rules/unit-testing.mdc`:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    // Arrange
    const wrapper = mount(MyComponent, {
      props: { title: 'Test' }
    })

    // Act
    // (trigger user interactions if needed)

    // Assert
    expect(wrapper.text()).toContain('Test')
  })

  it('handles click events', async () => {
    // Arrange
    const onClick = vi.fn()
    const wrapper = mount(MyComponent, {
      props: { onClick }
    })

    // Act
    await wrapper.find('button').trigger('click')

    // Assert
    expect(onClick).toHaveBeenCalledOnce()
  })
})
```

#### Testing Nuxt Components

For components that use Nuxt features (auto-imports, composables):

```typescript
import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MyNuxtComponent from './MyNuxtComponent.vue'

describe('MyNuxtComponent', () => {
  it('renders with Nuxt context', async () => {
    const component = await mountSuspended(MyNuxtComponent)
    expect(component.text()).toContain('Expected text')
  })
})
```

#### Mocking with Vitest

```typescript
import { vi } from 'vitest'

// Mock a function
const mockFn = vi.fn()
mockFn.mockReturnValue('mocked value')

// Mock a module
vi.mock('./my-module', () => ({
  myFunction: vi.fn(() => 'mocked'),
}))

// Spy on existing function
const spy = vi.spyOn(console, 'log')
console.log('test')
expect(spy).toHaveBeenCalledWith('test')
```

#### Using Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/vue'
import MyComponent from './MyComponent.vue'

it('handles user interactions', async () => {
  render(MyComponent)

  const button = screen.getByRole('button', { name: /submit/i })
  await fireEvent.click(button)

  expect(screen.getByText(/success/i)).toBeInTheDocument()
})
```

### E2E Tests

Follow the guidelines from `.cursor/rules/e2e-testing.mdc`:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should perform expected behavior', async ({ page }) => {
    // Navigate to page
    await page.goto('/path')

    // Interact with elements using resilient locators
    await page.getByRole('button', { name: 'Submit' }).click()

    // Assert expected outcomes
    await expect(page.getByText('Success')).toBeVisible()
  })
})
```

#### Page Object Model

For maintainable E2E tests, use the Page Object Model:

```typescript
import { Page } from '@playwright/test'

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email)
    await this.page.getByLabel('Password').fill(password)
    await this.page.getByRole('button', { name: 'Log in' }).click()
  }

  async expectLoggedIn() {
    await expect(this.page).toHaveURL('/dashboard')
  }
}
```

#### API Testing

Test backend endpoints directly:

```typescript
test('API endpoint returns correct data', async ({ request }) => {
  const response = await request.post('/api/generations', {
    data: { text: 'sample text' }
  })

  expect(response.ok()).toBeTruthy()
  const data = await response.json()
  expect(data).toHaveProperty('id')
})
```

## Best Practices

### General
1. Follow the **Arrange-Act-Assert** pattern
2. Write **descriptive test names** that explain the expected behavior
3. Keep tests **isolated** - each test should be independent
4. **Mock external dependencies** (API calls, services)
5. Use **TypeScript** for type safety in tests

### Unit Tests
1. Test one thing per test
2. Prefer `vi.fn()` for simple mocks, `vi.spyOn()` for monitoring existing functions
3. Use Testing Library for user-centric component tests
4. Test behavior, not implementation details
5. Keep test setup DRY using factories and fixtures

### E2E Tests
1. Use **resilient locators** (role, label, text) over CSS selectors
2. Implement **Page Object Model** for complex user flows
3. Use `data-testid` attributes sparingly, only when semantic locators aren't available
4. Test critical user journeys end-to-end
5. Use **visual comparison** (`toHaveScreenshot()`) for UI regression testing

## Coverage

Code coverage is configured with the following thresholds:
- Lines: 60%
- Functions: 60%
- Branches: 60%
- Statements: 60%

Coverage reports are generated in `coverage/` directory (gitignored).

To view coverage:
```bash
pnpm test:unit:coverage
# Open coverage/index.html in browser
```

## Debugging Tests

### Unit Tests
```bash
# Run in watch mode for instant feedback
pnpm test:unit:watch

# Use Vitest UI for visual debugging
pnpm test:unit:ui

# Add debugger in test code
it('test case', () => {
  debugger // Will pause execution
  expect(true).toBe(true)
})
```

### E2E Tests
```bash
# Run in debug mode (opens browser DevTools)
pnpm test:e2e:debug

# Run in headed mode to see browser
pnpm test:e2e:headed

# Use Playwright Inspector
pnpm test:e2e -- --debug

# Generate traces for failed tests
# Traces are automatically generated on first retry
# View at: https://trace.playwright.dev/
```

## Continuous Integration

Tests are designed to run in CI environments:
- Playwright runs with 2 retries on CI
- Coverage reports can be uploaded to coverage services
- Test results are available in `tests/e2e/results/`

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
