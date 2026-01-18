# Quolar

AI-Powered Test Automation Workflow Engine for Claude Code.

Quolar orchestrates the end-to-end process of converting Linear tickets into fully automated, self-healing Playwright E2E tests.

## Installation

### Via Claude Code Plugin (Recommended)

```bash
# Add the Quolar marketplace
/plugin marketplace add Montinou/quolar

# Install the plugin
/plugin install quolar
```

### Manual Installation

```bash
# Clone to your Claude Code skills directory
mkdir -p ~/.claude/skills
cd ~/.claude/skills
git clone https://github.com/Montinou/quolar.git

# Reload Claude Code
claude-code reload
```

## Usage

```bash
# Start Claude Code
claude-code

# Run the workflow with a ticket ID
/test-ticket ENG-123

# Dry run (generate tests without executing)
/test-ticket ENG-456 --dry-run

# Skip PR creation
/test-ticket ENG-789 --skip-pr
```

## What It Does

1. **Reads your Linear ticket** - Extracts requirements and acceptance criteria
2. **Searches for patterns** - Finds similar tests in your codebase
3. **Plans test scenarios** - Generates comprehensive test plan
4. **Writes Playwright tests** - Creates tests following your project's conventions
5. **Executes with auto-healing** - Runs tests up to 3 times, fixing failures automatically
6. **Integrates with CI** - Updates GitHub Actions configuration
7. **Creates PR** - Opens pull request linked to the ticket

## Prerequisites

### Required MCP Servers
- **linear** - For fetching ticket details

### Optional MCP Servers (Enhanced Features)
- **quoth** - For documentation pattern search
- **exolar** - For test analytics and failure classification

## Configuration

Create `quolar.config.ts` in your project root:

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
    provider: 'quoth',  // optional
  },
  analytics: {
    provider: 'exolar',  // optional
  },
})
```

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

## Default Stack

| Provider Type | Default | Alternatives |
|---------------|---------|--------------|
| Tickets | Linear | Jira, GitHub Issues |
| Documentation | Quoth | Confluence, Notion |
| Analytics | Exolar | DataDog, Allure |
| VCS | GitHub | GitLab, Bitbucket |
| Test Framework | Playwright | Vitest, Cypress |

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Documentation

See the [docs/](./docs/) directory for detailed documentation:

- **[Complete Analysis & Documentation](./docs/QUOLAR-COMPLETE-ANALYSIS.md)** - Comprehensive single-source-of-truth documentation covering all aspects of Quolar
- [Architecture](./docs/automated-testing-workflow/architecture.md)
- [Installation Guide](./docs/automated-testing-workflow/installation.md)
- [Usage Guide](./docs/automated-testing-workflow/usage-guide.md)
- [Workflow Steps](./docs/automated-testing-workflow/workflow-steps.md)
- [Troubleshooting](./docs/automated-testing-workflow/troubleshooting.md)

## Plugin Structure

```
quolar/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── skills/
│   └── test-ticket/
│       ├── SKILL.md         # Main skill file
│       └── reference.md     # Detailed documentation
├── marketplace.json         # Marketplace catalog
├── packages/                # Core packages (for programmatic use)
│   ├── core/
│   ├── providers/
│   └── skill/
└── docs/                    # Full documentation
```

## License

MIT
