# Quolar

AI-Powered Test Automation Workflow Engine for Claude Code.

Quolar orchestrates the end-to-end process of converting Linear tickets into fully automated, self-healing Playwright E2E tests.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW ORCHESTRATOR                     │
│  ┌─────────────┬────────────────┬─────────────────────────┐ │
│  │ Analysis    │ Generation     │ Validation              │ │
│  │ Layer       │ Layer          │ Layer                   │ │
│  └─────────────┴────────────────┴─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               PROVIDER ABSTRACTION LAYER                     │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────┐  │
│  │ TicketProvider │ │ DocsProvider   │ │ AnalyticsProvider│  │
│  └────────────────┘ └────────────────┘ └─────────────────┘  │
│  ┌────────────────┐ ┌────────────────┐                      │
│  │ VCSProvider    │ │ TestFramework  │                      │
│  │                │ │ Provider       │                      │
│  └────────────────┘ └────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   MCP ADAPTER LAYER                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐  │
│  │ Linear  │ │ Quoth   │ │ Exolar  │ │ GitHub  │ │Playw. │  │
│  │ Adapter │ │ Adapter │ │ Adapter │ │ Adapter │ │Adapter│  │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └───────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Description |
|---------|-------------|
| `@quolar/core` | Workflow orchestrator, provider interfaces, configuration |
| `@quolar/provider-linear` | Linear ticket management adapter |
| `@quolar/provider-github` | GitHub VCS adapter |
| `@quolar/provider-playwright` | Playwright test framework adapter |
| `@quolar/provider-quoth` | Quoth documentation adapter |
| `@quolar/provider-exolar` | Exolar analytics adapter |
| `@quolar/skill` | Claude Code skill package |

## Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Configuration

Create a `quolar.config.ts` in your project root:

```typescript
import { defineConfig } from '@quolar/core'

export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './tests',
  },
  tickets: {
    provider: 'linear',
    workspace: 'your-workspace',
  },
  documentation: {
    provider: 'quoth',
  },
  analytics: {
    provider: 'exolar',
  },
})
```

## Default Stack

| Provider Type | Default | Alternatives |
|---------------|---------|--------------|
| Tickets | Linear | Jira, GitHub Issues |
| Documentation | Quoth | Confluence, Notion |
| Analytics | Exolar | DataDog, Allure |
| VCS | GitHub | GitLab, Bitbucket |
| Test Framework | Playwright | Vitest, Cypress |

## Documentation

See the [docs/](./docs/) directory for detailed documentation.

## License

MIT
