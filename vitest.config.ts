import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
      },
    },
    // Test file patterns
    include: [
      '**/__tests__/**/*.spec.ts',
      '**/__tests__/**/*.test.ts',
      '**/*.spec.ts',
      '**/*.test.ts',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/tests/e2e/**', // Exclude E2E tests from unit tests
    ],
    // Setup files
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.nuxt/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/*.config.{ts,js}',
        '**/types/**',
        '**/*.d.ts',
        '**/coverage/**',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
    // Global test timeout
    testTimeout: 10000,
    // Enable globals for describe, it, expect
    globals: true,
  },
})
