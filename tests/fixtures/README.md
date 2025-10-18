# Test Fixtures

This directory contains shared test data, fixtures, and utilities used across test suites.

## Structure

```
fixtures/
├── data/          # Mock data and test fixtures
├── factories/     # Test data factories using @faker-js/faker
└── mocks/         # Shared mock implementations
```

## Usage

### Creating Test Data Factories

Use `@faker-js/faker` to generate realistic test data:

```typescript
import { faker } from '@faker-js/faker'

export function createMockFlashcard(overrides = {}) {
  return {
    id: faker.string.uuid(),
    front: faker.lorem.sentence(),
    back: faker.lorem.paragraph(),
    source: 'manual',
    created_at: faker.date.recent().toISOString(),
    user_id: faker.string.uuid(),
    ...overrides,
  }
}
```

### Creating Mock Service Workers (MSW)

For HTTP mocking in tests:

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const handlers = [
  http.post('/api/generations', () => {
    return HttpResponse.json({ data: mockGenerationResponse })
  }),
]

export const server = setupServer(...handlers)
```

## Best Practices

1. **Keep fixtures DRY** - Create reusable factories instead of duplicating test data
2. **Use faker for dynamic data** - Ensures tests don't rely on hardcoded values
3. **Type your fixtures** - Ensure fixtures match your actual data types
4. **Document complex fixtures** - Add comments for non-obvious test data structures
