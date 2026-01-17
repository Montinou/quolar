import { defineConfig } from '@quolar/core'

/**
 * Minimal Quolar configuration
 *
 * Only the required fields - everything else uses defaults.
 */
export default defineConfig({
  testFramework: {
    provider: 'playwright',
  },

  tickets: {
    provider: 'linear',
    workspace: 'my-company',
  },
})
