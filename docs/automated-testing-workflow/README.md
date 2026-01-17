# Quolar - Modular AI Test Automation Framework

**Version**: 2.0
**Status**: Documentation Complete
**Last Updated**: 2026-01-17

---

## Overview

**Quolar** (Quoth + Exolar) is a modular, provider-agnostic AI test automation framework that transforms tickets into fully tested features with minimal manual intervention. Built on the MCP (Model Context Protocol) standard, Quolar enables swapping between different tools while maintaining the same powerful workflow.

### The Quolar Vision

```
┌─────────────────────────────────────────────────────────────────┐
│                        ANY TICKET SYSTEM                         │
│              Linear | Jira | GitHub Issues | ...                │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    QUOLAR WORKFLOW ENGINE                        │
│                                                                  │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   │
│   │ Analyze  │ → │ Generate │ → │ Execute  │ → │ Create   │   │
│   │ Ticket   │   │ Tests    │   │ & Heal   │   │ PR       │   │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ANY TEST FRAMEWORK                          │
│              Playwright | Vitest | Cypress | ...                │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Protocol-Based Extensibility**: MCP as universal interface, not proprietary plugins
2. **Zero-Config Defaults**: Works out-of-the-box with sensible defaults
3. **Adapter Pattern**: Core logic is provider-agnostic, adapters are thin wrappers
4. **Graceful Degradation**: Optional providers enhance but aren't required
5. **Self-Healing**: Automatic failure detection and intelligent correction

---

## Value Proposition

| Metric | Before Quolar | With Quolar |
|--------|---------------|-------------|
| Test creation time | 4-6 hours | ~15 minutes |
| Test accuracy | Variable | 90%+ on first generation |
| Auto-healing success | N/A | 70%+ of failures |
| Manual intervention | Always | Near-zero for standard flows |
| Standards compliance | Manual review | 100% automated enforcement |

---

## Quick Start

### Installation

```bash
# Install the Quolar skill
mkdir -p ~/.claude/skills
cd ~/.claude/skills
git clone https://github.com/attorneyshare/quolar.git quolar

# Reload Claude Code
claude-code reload
```

### Configuration

Create `quolar.config.ts` in your project:

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

### Usage

```bash
# Start Claude Code
claude-code

# Run the workflow
/test-ticket ENG-123
```

---

## Provider Architecture

Quolar uses **pluggable providers** for all external integrations:

| Category | Default | Alternatives |
|----------|---------|--------------|
| **Tickets** | Linear | Jira, GitHub Issues |
| **Documentation** | Quoth | Confluence, Notion |
| **Analytics** | Exolar | DataDog, Allure |
| **VCS** | GitHub | GitLab, Bitbucket |
| **Test Framework** | Playwright | Vitest, Cypress |

### Default Stack (Our Ecosystem)

```
Linear (tickets) + Quoth (docs) + Exolar (analytics) + GitHub + Playwright
```

### Enterprise Stack (Example)

```
Jira (tickets) + Confluence (docs) + DataDog (analytics) + GitHub + Playwright
```

---

## Workflow Steps

The workflow executes 7 sequential steps:

### STEP 1: Ticket Analysis
- Fetch ticket via TicketProvider
- Extract requirements and acceptance criteria
- Determine test type from labels

### STEP 2: Pattern Search
- Search codebase for similar tests
- Query DocsProvider for patterns (if available)
- Build pattern library

### STEP 3: Test Planning
- Spawn test-planner agent
- Generate test scenarios
- Determine execution strategy

### STEP 4: Test Generation
- Create git branch via VCSProvider
- Spawn test-writer agents
- Generate test files via TestFrameworkProvider

### STEP 5: Execution Loop (Auto-Healing)
- Execute tests (max 3 attempts)
- On failure: classify via AnalyticsProvider
- Apply fixes and retry

### STEP 6: CI Integration
- Update GitHub Actions workflows
- Configure reporters
- Commit changes

### STEP 7: PR Creation
- Push branch via VCSProvider
- Create PR with rich description
- Link PR to ticket
- Validate CI execution

---

## Example Output

```bash
$ /test-ticket ENG-123

✓ Step 1: Analyzing ticket ENG-123...
  → Title: User Authentication Flow
  → Labels: feature, authentication, ui
  → Test type: E2E UI Tests

✓ Step 2: Searching for patterns...
  → Found 3 similar tests in codebase
  → Quoth: Found 2 additional patterns

✓ Step 3: Generating test plan...
  → 4 scenarios planned
  → Execution mode: Parallel

✓ Step 4: Generating tests...
  → Created: tests/authentication/login-flow.spec.ts
  → Type checking: PASS

✓ Step 5: Executing tests (attempt 1/3)...
  → Result: 3 passed, 1 failed
  → Exolar classification: FLAKE (90% confidence)
  → Applying auto-fix...

✓ Step 5: Executing tests (attempt 2/3)...
  → Result: 4 passed, 0 failed
  → All tests passing!

✓ Step 6: Updating CI configuration...
  → Modified: .github/workflows/ci.yml

✓ Step 7: Creating PR...
  → Branch: test/ENG-123-automated-tests
  → PR created: #789
  → Ticket updated with PR link

✅ Workflow completed in 14m 32s

PR: https://github.com/org/repo/pull/789
Dashboard: https://exolar.ai-innovation.site/executions/...
```

---

## Documentation

### Core Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./architecture.md) | System design and provider interfaces |
| [Installation](./installation.md) | Setup and configuration guide |
| [Configuration Reference](./configuration-reference.md) | Full config schema |
| [Usage Guide](./usage-guide.md) | Detailed usage instructions |

### Provider Documentation

| Document | Description |
|----------|-------------|
| [Providers Overview](./providers/README.md) | Provider architecture |
| [Linear Provider](./providers/linear.md) | Default ticket provider |
| [Jira Provider](./providers/jira.md) | Enterprise alternative |
| [Quoth Provider](./providers/quoth.md) | Documentation patterns |
| [Exolar Provider](./providers/exolar.md) | Test analytics |

### Additional Documentation

| Document | Description |
|----------|-------------|
| [Workflow Steps](./workflow-steps.md) | Detailed step documentation |
| [Agent Specifications](./agent-specifications.md) | Agent definitions |
| [Template Specifications](./template-specifications.md) | Test templates |
| [Troubleshooting](./troubleshooting.md) | Common issues |
| [Testing Strategy](./testing-strategy.md) | Verification approach |

---

## Project Structure

```
docs/automated-testing-workflow/
├── README.md                      # This file
├── architecture.md                # System design
├── installation.md                # Setup guide
├── configuration-reference.md     # Config schema
├── usage-guide.md                 # Usage instructions
├── workflow-steps.md              # Step details
├── agent-specifications.md        # Agent definitions
├── template-specifications.md     # Templates
├── testing-strategy.md            # Verification
├── troubleshooting.md             # Common issues
├── providers/
│   ├── README.md                  # Provider overview
│   ├── linear.md                  # Linear provider
│   ├── jira.md                    # Jira provider
│   ├── quoth.md                   # Quoth provider
│   └── exolar.md                  # Exolar provider
└── integration/
    └── exolar-mcp.md              # Exolar integration
```

---

## Roadmap

### Current (v2.0)

- [x] Provider abstraction layer
- [x] Linear provider (default)
- [x] Quoth provider (documentation)
- [x] Exolar provider (analytics)
- [x] Playwright provider (test framework)
- [x] GitHub provider (VCS)
- [x] Full documentation

### Next (v2.1)

- [ ] Jira provider (enterprise)
- [ ] Configuration CLI (`npx quolar init`)
- [ ] Provider connection testing
- [ ] Custom template support

### Future (v3.0)

- [ ] Standalone CLI (not just Claude Code skill)
- [ ] GitHub Issues provider
- [ ] GitLab provider
- [ ] Vitest provider
- [ ] Confluence provider

---

## Contributing

### Report Issues

https://github.com/attorneyshare/quolar/issues

### Development

```bash
# Clone the repo
git clone https://github.com/attorneyshare/quolar.git
cd quolar

# Install dependencies
yarn install

# Run tests
yarn test

# Build
yarn build
```

---

## Support

**Documentation**: This directory
**Dashboard**: https://exolar.ai-innovation.site
**Issues**: https://github.com/attorneyshare/quolar/issues
**Slack**: #qa-automation

---

## Related Projects

- **Quoth** - AI-optimized documentation system
- **Exolar** - QA analytics dashboard
- **AttorneyShare MVP** - Legal marketplace platform

---

**Maintained by**: AttorneyShare QA Tools Team
**License**: Internal Use Only
**Version**: 2.0
