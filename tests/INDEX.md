# Testing Index - Quick Reference

Welcome to the 10xCards testing environment! This index helps you quickly find the testing resources you need.

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [tests/README.md](./README.md) | **START HERE** - Comprehensive testing guide |
| [TESTING_SETUP_SUMMARY.md](../TESTING_SETUP_SUMMARY.md) | Setup summary and verification |
| [tests/fixtures/README.md](./fixtures/README.md) | Guide for test fixtures and mocks |

## 🎯 Quick Start Commands

```bash
# Unit Tests
pnpm test:unit              # Run all unit tests
pnpm test:unit:watch        # Watch mode (recommended for development)
pnpm test:unit:ui           # Interactive UI dashboard
pnpm test:unit:coverage     # Generate coverage report

# E2E Tests
pnpm test:e2e               # Run E2E tests (headless)
pnpm test:e2e:ui            # E2E with Playwright UI
pnpm test:e2e:headed        # See browser while testing
pnpm test:e2e:debug         # Debug mode with inspector
```

## 📁 Directory Structure

```
tests/
├── README.md                           # Main testing guide
├── INDEX.md                            # This file - quick reference
│
├── e2e/                                # E2E Tests (Playwright)
│   └── example.spec.ts                 # Example E2E test with Page Object Model
│
├── examples/                           # Example Tests (Learn by example)
│   ├── using-testing-library.spec.ts   # Testing Library patterns
│   └── using-faker.spec.ts             # Faker.js data generation
│
├── fixtures/                           # Test Utilities
│   ├── README.md                       # Fixtures documentation
│   ├── factories/                      # Data Factories
│   │   └── flashcard.factory.ts        # Flashcard test data factory
│   └── mocks/                          # Mocks
│       └── supabase.mock.ts            # Supabase client mocks
│
└── setup/                              # Test Configuration
    └── vitest.setup.ts                 # Global test setup
```

## 🛠️ Testing Tools

### Unit Testing Stack
- **Vitest** - Test framework
- **@testing-library/vue** - Component testing (user-centric)
- **@testing-library/jest-dom** - DOM matchers
- **@vue/test-utils** - Vue testing utilities
- **@nuxt/test-utils** - Nuxt-specific helpers
- **@pinia/testing** - Pinia store testing
- **MSW** - HTTP mocking
- **@faker-js/faker** - Test data generation
- **happy-dom** - DOM environment

### E2E Testing Stack
- **Playwright** - Browser automation
- **@playwright/test** - Test runner
- Chromium/Desktop Chrome (per project guidelines)

## 📖 Learning Resources

### For Unit Testing
1. Read [tests/examples/using-testing-library.spec.ts](./examples/using-testing-library.spec.ts)
2. Read [tests/examples/using-faker.spec.ts](./examples/using-faker.spec.ts)
3. Check [tests/fixtures/factories/flashcard.factory.ts](./fixtures/factories/flashcard.factory.ts)
4. See [.cursor/rules/unit-testing.mdc](../.cursor/rules/unit-testing.mdc)

### For E2E Testing
1. Read [tests/e2e/example.spec.ts](./e2e/example.spec.ts)
2. Check [.cursor/rules/e2e-testing.mdc](../.cursor/rules/e2e-testing.mdc)
3. Review Playwright config at [playwright.config.ts](../playwright.config.ts)

## 🔍 Common Testing Patterns

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import MyComponent from './MyComponent.vue'

describe('MyComponent', () => {
  it('renders correctly', () => {
    // Arrange
    render(MyComponent, { props: { title: 'Test' } })

    // Act & Assert
    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  // Arrange
  await page.goto('/login')

  // Act
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByRole('button', { name: 'Login' }).click()

  // Assert
  await expect(page).toHaveURL('/dashboard')
})
```

### Using Factories
```typescript
import { createMockFlashcard } from '~/tests/fixtures/factories/flashcard.factory'

const flashcard = createMockFlashcard({
  front: 'Custom question',
  back: 'Custom answer'
})
```

## 📊 Coverage

Coverage thresholds: **60%** for lines, functions, branches, and statements

```bash
# Generate and view coverage
pnpm test:unit:coverage
open coverage/index.html
```

## 🐛 Debugging

### Unit Tests
```bash
# Watch mode with filter
pnpm test:unit:watch -t "pattern"

# UI mode for visual debugging
pnpm test:unit:ui
```

### E2E Tests
```bash
# Debug mode (opens DevTools)
pnpm test:e2e:debug

# Headed mode (see browser)
pnpm test:e2e:headed
```

## 📝 Best Practices

### Unit Tests ✅
- ✅ Use Testing Library queries (getByRole, getByText)
- ✅ Test user behavior, not implementation
- ✅ Follow Arrange-Act-Assert pattern
- ✅ Use factories for test data
- ✅ Mock external dependencies

### E2E Tests ✅
- ✅ Use Page Object Model for complex flows
- ✅ Prefer semantic locators over CSS selectors
- ✅ Test critical user journeys
- ✅ Use data-testid sparingly
- ✅ Verify with expect assertions

## 🚀 Next Steps

1. **Write your first test**
   - Copy an example from `tests/examples/`
   - Adapt it to your component/feature
   - Run in watch mode for instant feedback

2. **Explore the examples**
   - Run `pnpm test tests/examples --run`
   - Read the code and comments
   - Try modifying them

3. **Create test fixtures**
   - Add factories in `tests/fixtures/factories/`
   - Add mocks in `tests/fixtures/mocks/`
   - Keep them reusable

4. **Read the full guide**
   - See [tests/README.md](./README.md) for comprehensive documentation

## 📞 Support

- **Testing Guidelines**: `.cursor/rules/unit-testing.mdc` & `.cursor/rules/e2e-testing.mdc`
- **Tech Stack**: `docs/tech_stack.md`
- **Project Instructions**: `CLAUDE.md`

---

**Happy Testing! 🎉**
