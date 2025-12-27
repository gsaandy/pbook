import { afterEach, mock } from 'bun:test'
import { GlobalRegistrator } from '@happy-dom/global-registrator'

// Register happy-dom globals
GlobalRegistrator.register()

// Import testing library cleanup after DOM is available
const { cleanup } = await import('@testing-library/react')

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock matchMedia if not available
if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: mock((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: mock(() => {}),
      removeListener: mock(() => {}),
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
      dispatchEvent: mock(() => {}),
    })),
  })
}

// Mock ResizeObserver if not available
if (typeof globalThis.ResizeObserver !== 'function') {
  // @ts-expect-error - mocking global
  globalThis.ResizeObserver = class ResizeObserver {
    observe = mock(() => {})
    unobserve = mock(() => {})
    disconnect = mock(() => {})
  }
}

// Mock IntersectionObserver if not available
if (typeof globalThis.IntersectionObserver !== 'function') {
  // @ts-expect-error - mocking global
  globalThis.IntersectionObserver = class IntersectionObserver {
    observe = mock(() => {})
    unobserve = mock(() => {})
    disconnect = mock(() => {})
  }
}
