import { defineConfig } from '@quolar/core'

/**
 * Quolar configuration with Jira (future)
 *
 * Example configuration for teams using Jira
 * instead of Linear for ticket management.
 */
export default defineConfig({
  testFramework: {
    provider: 'playwright',
    testDir: './e2e',
  },

  tickets: {
    provider: 'jira',
    projectKey: 'PROJ', // Jira project key
  },

  // Skip optional providers
  documentation: null,
  analytics: null,
})
