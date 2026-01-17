import { defineConfig } from '@quolar/core'

/**
 * Full Quolar configuration example
 *
 * This configuration demonstrates all available options
 * for the Quolar test automation workflow.
 */
export default defineConfig({
  // Required: Test framework configuration
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './tests/e2e',
    pageObjectsDir: './tests/page-objects',
  },

  // Required: Ticket management system
  tickets: {
    provider: 'linear',
    workspace: 'my-company', // Your Linear workspace slug
  },

  // Optional: Documentation system (for pattern search)
  documentation: {
    provider: 'quoth',
    endpoint: 'https://quoth.example.com/api/mcp',
  },

  // Optional: Analytics system (for failure classification)
  analytics: {
    provider: 'exolar',
    endpoint: 'https://exolar.example.com/api/mcp',
  },

  // VCS configuration (auto-detected by default)
  vcs: {
    provider: 'github',
    ciSystem: 'github-actions',
  },

  // Workflow settings
  workflow: {
    maxRetries: 3, // Number of retry attempts for recoverable failures
    autoHealingThreshold: 70, // Minimum confidence (%) to auto-heal tests
    parallelAgents: 3, // Number of parallel agent workers
  },
})
