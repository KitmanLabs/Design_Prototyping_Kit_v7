import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'

expect.extend(matchers)

// Vitest runs without globals, so Testing Library cannot register its own
// automatic cleanup. Unmount between tests so DOM state does not leak.
afterEach(() => {
  cleanup()
})

// jsdom has no matchMedia. Provide both the legacy and the current listener APIs,
// as MUI X date pickers use addEventListener.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  })
}

// jsdom has no IntersectionObserver. MUI X v7 Data Grid Pro and Premium create one on mount
// (the infinite loader), so give them an inert stand-in.
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  window.IntersectionObserver = class IntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return [] }
  }
}

// jsdom's style parser (cssstyle) throws on a border rule in MUI X v7's Data Grid styles
// (`border-bottom: 1px solid var(--DataGrid-rowBorderColor)` followed by a border colour).
// Browsers handle it. Fall back to the element's inline style so role queries keep working.
if (typeof window !== 'undefined') {
  const getComputedStyle = window.getComputedStyle.bind(window)
  window.getComputedStyle = (element, pseudoElement) => {
    try {
      return getComputedStyle(element, pseudoElement)
    } catch {
      return element.style
    }
  }
}
