# Quolar Configuration Reference

**Version**: 2.0
**Last Updated**: 2026-01-17

---

## Overview

Quolar uses a TypeScript configuration file (`quolar.config.ts`) for type-safe provider and workflow configuration. This document provides the complete schema reference.

---

## Quick Start

Create `quolar.config.ts` in your project root:

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './tests'
  },
  tickets: {
    provider: 'linear',
    workspace: 'your-workspace'
  }
})
```

---

## Complete Schema

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  // ═══════════════════════════════════════════════════════════════════
  // TEST FRAMEWORK CONFIGURATION (Required)
  // ═══════════════════════════════════════════════════════════════════
  testFramework: {
    // Provider type
    provider: 'playwright' | 'vitest' | 'cypress',

    // Path to framework config file
    config: string,                    // e.g., './playwright.config.ts'

    // Test directory
    testDir: string,                   // e.g., './automation/playwright/tests'

    // Page objects directory (optional, Playwright)
    pageObjectsDir?: string,           // e.g., './automation/playwright/page-objects'

    // Fixtures directory (optional)
    fixturesDir?: string,              // e.g., './automation/playwright/fixtures'

    // Helper utilities directory (optional)
    helpersDir?: string                // e.g., './automation/playwright/utils'
  },

  // ═══════════════════════════════════════════════════════════════════
  // TICKET PROVIDER CONFIGURATION (Required)
  // ═══════════════════════════════════════════════════════════════════
  tickets: {
    // Provider type
    provider: 'linear' | 'jira' | 'github-issues',

    // ─────────────────────────────────────────────────────────────────
    // LINEAR-SPECIFIC OPTIONS
    // ─────────────────────────────────────────────────────────────────
    // Workspace slug (Linear)
    workspace?: string,                // e.g., 'attorney-share'

    // Filter by team (Linear, optional)
    team?: string,                     // e.g., 'ENG'

    // ─────────────────────────────────────────────────────────────────
    // JIRA-SPECIFIC OPTIONS
    // ─────────────────────────────────────────────────────────────────
    // Jira base URL
    baseUrl?: string,                  // e.g., 'https://your-org.atlassian.net'

    // Jira project key
    projectKey?: string,               // e.g., 'ENG'

    // Custom field mapping (Jira)
    customFields?: {
      acceptanceCriteria?: string,     // e.g., 'customfield_10001'
      testType?: string,
      [key: string]: string | undefined
    },

    // Status mapping (Jira)
    statusMapping?: {
      [jiraStatus: string]: 'pending' | 'in_progress' | 'completed'
    },

    // ─────────────────────────────────────────────────────────────────
    // GITHUB ISSUES OPTIONS
    // ─────────────────────────────────────────────────────────────────
    // Repository owner (GitHub Issues)
    owner?: string,                    // e.g., 'attorneyshare'

    // Repository name (GitHub Issues)
    repo?: string,                     // e.g., 'mvp'

    // ─────────────────────────────────────────────────────────────────
    // COMMON OPTIONS
    // ─────────────────────────────────────────────────────────────────
    // Label mapping for test type detection
    labelMapping?: {
      [label: string]: 'e2e-test' | 'api-test' | 'unit-test' | 'integration-test'
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // DOCUMENTATION PROVIDER CONFIGURATION (Optional)
  // Falls back to codebase search if not configured
  // ═══════════════════════════════════════════════════════════════════
  documentation?: {
    // Provider type (null to disable)
    provider: 'quoth' | 'confluence' | 'notion' | null,

    // API endpoint
    endpoint?: string,                 // e.g., 'https://quoth.ai-innovation.site/api/mcp'

    // ─────────────────────────────────────────────────────────────────
    // QUOTH-SPECIFIC OPTIONS
    // ─────────────────────────────────────────────────────────────────
    // Filter by categories
    categories?: string[],             // e.g., ['patterns', 'architecture']

    // Minimum relevance score (0-1)
    minRelevance?: number,             // Default: 0.5

    // ─────────────────────────────────────────────────────────────────
    // CONFLUENCE-SPECIFIC OPTIONS
    // ─────────────────────────────────────────────────────────────────
    // Confluence base URL
    baseUrl?: string,                  // e.g., 'https://your-org.atlassian.net/wiki'

    // Confluence space key
    spaceKey?: string                  // e.g., 'DEV'
  },

  // ═══════════════════════════════════════════════════════════════════
  // ANALYTICS PROVIDER CONFIGURATION (Optional)
  // Falls back to basic logging if not configured
  // ═══════════════════════════════════════════════════════════════════
  analytics?: {
    // Provider type (null to disable)
    provider: 'exolar' | 'datadog' | 'allure' | null,

    // API endpoint
    endpoint?: string,                 // e.g., 'https://exolar.ai-innovation.site/api/mcp'

    // Auto-healing threshold (0-100)
    autoHealThreshold?: number,        // Default: 70

    // Flakiness threshold (0-100)
    flakinessThreshold?: number,       // Default: 20

    // ─────────────────────────────────────────────────────────────────
    // DATADOG-SPECIFIC OPTIONS
    // ─────────────────────────────────────────────────────────────────
    apiKey?: string,                   // Use env var: process.env.DD_API_KEY
    appKey?: string                    // Use env var: process.env.DD_APP_KEY
  },

  // ═══════════════════════════════════════════════════════════════════
  // VCS PROVIDER CONFIGURATION (Auto-detected by default)
  // ═══════════════════════════════════════════════════════════════════
  vcs?: {
    // Provider type
    provider: 'github' | 'gitlab' | 'bitbucket',

    // CI system type
    ciSystem: 'github-actions' | 'gitlab-ci' | 'jenkins' | 'circleci',

    // Default base branch
    baseBranch?: string,               // Default: 'main'

    // PR settings
    pr?: {
      draft?: boolean,                 // Default: false
      labels?: string[],               // Default: ['automated-tests']
      reviewers?: string[]             // Default: []
    }
  },

  // ═══════════════════════════════════════════════════════════════════
  // WORKFLOW SETTINGS
  // ═══════════════════════════════════════════════════════════════════
  workflow?: {
    // Maximum auto-healing retry attempts
    maxRetries?: number,               // Default: 3

    // Minimum confidence % to auto-heal
    autoHealingThreshold?: number,     // Default: 70

    // Maximum parallel test-writer agents
    parallelAgents?: number,           // Default: 3

    // Git branch prefix
    branchPrefix?: string,             // Default: 'test/'

    // Commit message prefix
    commitPrefix?: string,             // Default: 'test:'

    // Skip steps (for partial runs)
    skipSteps?: number[],              // e.g., [6, 7] to skip CI/PR

    // Require manual approval before PR
    requireApproval?: boolean          // Default: false
  },

  // ═══════════════════════════════════════════════════════════════════
  // TEST EXECUTION SETTINGS
  // ═══════════════════════════════════════════════════════════════════
  execution?: {
    // Default Playwright project
    defaultProject?: string,           // Default: 'chrome'

    // Default parallel workers
    defaultWorkers?: number,           // Default: 4

    // Test timeout in milliseconds
    timeout?: number,                  // Default: 60000

    // Playwright retries
    retries?: number,                  // Default: 2

    // Reporter configuration
    reporter?: {
      type: 'list' | 'dot' | 'html' | 'json' | 'dashboard',
      options?: Record<string, unknown>
    }[],

    // Environment overrides
    env?: Record<string, string>
  },

  // ═══════════════════════════════════════════════════════════════════
  // OUTPUT SETTINGS
  // ═══════════════════════════════════════════════════════════════════
  output?: {
    // Directory for ticket analysis documents
    analysisDir?: string,              // Default: './docs/test-analysis'

    // Directory for test plan documents
    plansDir?: string,                 // Default: './docs/test-plans'

    // Enable verbose logging
    verbose?: boolean,                 // Default: false

    // Save intermediate artifacts
    saveArtifacts?: boolean,           // Default: true

    // Artifact retention days
    artifactRetentionDays?: number     // Default: 7
  },

  // ═══════════════════════════════════════════════════════════════════
  // TEMPLATE SETTINGS
  // ═══════════════════════════════════════════════════════════════════
  templates?: {
    // Custom template directory
    dir?: string,                      // Default: use built-in templates

    // Test file template
    testFile?: string,                 // e.g., 'custom-e2e.ts.hbs'

    // PR description template
    prDescription?: string,            // e.g., 'custom-pr.md.hbs'

    // Commit message template
    commitMessage?: string             // e.g., 'custom-commit.hbs'
  }
})
```

---

## Configuration Examples

### Minimal Configuration

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './tests'
  },
  tickets: {
    provider: 'linear',
    workspace: 'my-workspace'
  }
})
```

### Full AttorneyShare Configuration

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './automation/playwright/tests',
    pageObjectsDir: './automation/playwright/page-objects',
    fixturesDir: './automation/playwright/fixtures',
    helpersDir: './automation/playwright/utils'
  },

  tickets: {
    provider: 'linear',
    workspace: 'attorney-share',
    team: 'ENG',
    labelMapping: {
      'feature': 'e2e-test',
      'api': 'api-test',
      'regression': 'e2e-test'
    }
  },

  documentation: {
    provider: 'quoth',
    endpoint: 'https://quoth.ai-innovation.site/api/mcp',
    categories: ['patterns', 'architecture'],
    minRelevance: 0.5
  },

  analytics: {
    provider: 'exolar',
    endpoint: 'https://exolar.ai-innovation.site/api/mcp',
    autoHealThreshold: 70,
    flakinessThreshold: 20
  },

  vcs: {
    provider: 'github',
    ciSystem: 'github-actions',
    baseBranch: 'main',
    pr: {
      draft: false,
      labels: ['automated-tests', 'qa'],
      reviewers: ['qa-team']
    }
  },

  workflow: {
    maxRetries: 3,
    autoHealingThreshold: 70,
    parallelAgents: 3,
    branchPrefix: 'test/',
    commitPrefix: 'test:'
  },

  execution: {
    defaultProject: 'chrome',
    defaultWorkers: 4,
    timeout: 60000,
    retries: 2,
    reporter: [
      { type: 'list' },
      { type: 'dashboard', options: { endpoint: 'https://exolar.ai-innovation.site' } }
    ]
  },

  output: {
    analysisDir: './docs/test-analysis',
    plansDir: './docs/test-plans',
    verbose: false,
    saveArtifacts: true
  }
})
```

### Enterprise Jira Configuration

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './e2e'
  },

  tickets: {
    provider: 'jira',
    baseUrl: 'https://company.atlassian.net',
    projectKey: 'ENG',
    customFields: {
      acceptanceCriteria: 'customfield_10001'
    },
    statusMapping: {
      'To Do': 'pending',
      'In Progress': 'in_progress',
      'Done': 'completed',
      'Ready for QA': 'pending'
    }
  },

  vcs: {
    provider: 'github',
    ciSystem: 'jenkins',
    baseBranch: 'develop'
  },

  workflow: {
    maxRetries: 2,
    autoHealingThreshold: 80,
    requireApproval: true
  }
})
```

### GitHub-Only Configuration

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './tests'
  },

  tickets: {
    provider: 'github-issues',
    owner: 'my-org',
    repo: 'my-repo',
    labelMapping: {
      'enhancement': 'e2e-test',
      'bug': 'regression-test'
    }
  },

  // Disable optional providers
  documentation: {
    provider: null
  },
  analytics: {
    provider: null
  }
})
```

---

## Environment Variables

### Required Variables

| Variable | Provider | Description |
|----------|----------|-------------|
| `GITHUB_TOKEN` | VCS | GitHub Personal Access Token |
| `LINEAR_TOKEN` | Linear | Linear API token |
| `JIRA_EMAIL` | Jira | Jira account email |
| `JIRA_API_TOKEN` | Jira | Jira API token |

### Optional Variables

| Variable | Provider | Description |
|----------|----------|-------------|
| `DASHBOARD_API_KEY` | Exolar | Exolar dashboard API key |
| `QUOTH_API_KEY` | Quoth | Quoth API key |
| `DD_API_KEY` | DataDog | DataDog API key |
| `DD_APP_KEY` | DataDog | DataDog application key |
| `FRONTEND_URL` | Execution | Test environment URL |
| `BACKEND_URL` | Execution | API endpoint URL |

### Example .env.quolar

```bash
# Required
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
LINEAR_TOKEN=<YOUR_LINEAR_API_KEY>

# Optional - Analytics
DASHBOARD_URL=https://exolar.ai-innovation.site
DASHBOARD_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional - Documentation
QUOTH_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Test Environment
FRONTEND_URL=https://app.attorneyshare.info
BACKEND_URL=https://api.attorneyshare.info/graphql
```

---

## Configuration Validation

### Validate Command

```bash
npx quolar validate

# Output:
# ✓ Configuration file found: quolar.config.ts
# ✓ Test framework: playwright
#   - Config: ./playwright.config.ts (exists)
#   - Test dir: ./automation/playwright/tests (exists)
# ✓ Ticket provider: linear
#   - Workspace: attorney-share
# ✓ Documentation provider: quoth (optional)
#   - Endpoint: https://quoth.ai-innovation.site/api/mcp
# ✓ Analytics provider: exolar (optional)
#   - Endpoint: https://exolar.ai-innovation.site/api/mcp
# ✓ VCS provider: github (auto-detected)
#
# Configuration is valid!
```

### Common Validation Errors

```bash
# Missing required field
Error: tickets.provider is required

# Invalid provider type
Error: tickets.provider must be one of: linear, jira, github-issues

# Path doesn't exist
Warning: testFramework.testDir './tests' does not exist

# Invalid threshold
Error: workflow.autoHealingThreshold must be between 0 and 100
```

---

## Configuration Precedence

Configuration values are resolved in this order:

1. **Command line flags** (highest priority)
2. **Environment variables**
3. **quolar.config.ts**
4. **Default values** (lowest priority)

### Example

```bash
# Command line overrides config file
npx quolar test-ticket ENG-123 --workers 8

# Even if config has:
# execution: { defaultWorkers: 4 }
# The test will run with 8 workers
```

---

## TypeScript Support

### Type Definitions

```typescript
import type { QuolarConfig } from '@attorneyshare/quolar'

const config: QuolarConfig = {
  // Full IntelliSense support
}
```

### defineConfig Helper

The `defineConfig` helper provides type checking and IntelliSense:

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  // TypeScript will warn about invalid options
  testFramework: {
    provider: 'invalid', // Error: Type '"invalid"' is not assignable
  }
})
```

---

## Related Documentation

- [Installation](./installation.md) - Setup guide
- [Providers](./providers/README.md) - Provider configuration
- [Architecture](./architecture.md) - System design

---

**Version**: 2.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
