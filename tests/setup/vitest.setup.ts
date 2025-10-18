/**
 * Vitest global setup file
 * This file runs before all test suites
 *
 * Use this for:
 * - Global mocks
 * - Custom matchers
 * - Environment setup
 */

import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

/**
 * Mock window.matchMedia for components that use responsive utilities
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

/**
 * Mock IntersectionObserver for components that use lazy loading
 */
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn().mockReturnValue([]),
}))

/**
 * Mock ResizeObserver for components that respond to size changes
 */
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

/**
 * Suppress console warnings/errors during tests (optional)
 * Uncomment if needed to reduce test output noise
 */
// const originalConsoleError = console.error
// const originalConsoleWarn = console.warn

// console.error = (...args: any[]) => {
//   if (
//     typeof args[0] === 'string' &&
//     args[0].includes('Not implemented: HTMLFormElement.prototype.submit')
//   ) {
//     return
//   }
//   originalConsoleError(...args)
// }

// console.warn = (...args: any[]) => {
//   if (
//     typeof args[0] === 'string' &&
//     args[0].includes('[Vue warn]')
//   ) {
//     return
//   }
//   originalConsoleWarn(...args)
// }
