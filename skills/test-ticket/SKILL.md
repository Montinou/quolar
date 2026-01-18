---
name: test-ticket
description: |
  Generate Playwright E2E tests from Linear tickets automatically. Use when:
  - User says "test ticket ENG-123", "automate ENG-456", "create e2e tests"
  - User mentions ticket IDs like LIN-123, PROJ-456, ENG-789
  - User asks to "generate playwright tests from ticket"
  - User wants to "automate acceptance criteria"
  Self-heals failing tests (3 attempts), creates PR, integrates with CI.
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(git:*), Bash(npx:*), Bash(yarn:*), Bash(gh:*)
user-invocable: true
---

# Test Ticket Automation

Convert Linear tickets to self-healing Playwright E2E tests.

## Quick Start

```bash
/test-ticket ENG-123           # Full workflow
/test-ticket ENG-456 --dry-run # Generate without executing
/test-ticket ENG-789 --skip-pr # Execute but skip PR creation
```

## What It Does

This skill automates the entire test creation workflow:

1. **Analyze** - Read ticket, extract requirements ([Step 1](./steps/01-ticket-analysis.md))
2. **Search** - Find patterns in codebase + **Quoth docs** ([Step 2](./steps/02-pattern-search.md)) ⚠️ QUOTH REQUIRED
3. **Plan** - Generate test scenarios ([Step 3](./steps/03-test-planning.md))
4. **Generate** - Create Playwright test files ([Step 4](./steps/04-test-generation.md))
5. **Execute** - Run tests with auto-healing, 3 attempts ([Step 5](./steps/05-execution-loop.md))
6. **Integrate** - Update CI configuration ([Step 6](./steps/06-ci-integration.md))
7. **PR** - **Evaluate docs** + create pull request ([Step 7](./steps/07-pr-creation.md)) ⚠️ QUOTH REQUIRED

## Workflow Diagram

```
Ticket Analysis (~30s)
       │
Pattern Search (~1-2m)  ◄── QUOTH: Read existing patterns
       │
Test Planning (~2m)
       │
Test Generation (~3m)
       │
Execution Loop (~4-8m)  ─── Auto-heal up to 3 times
       │
CI Integration (~1m)
       │
Doc Evaluation + PR (~1-2m)  ◄── QUOTH: Propose new patterns
```

**Total Duration**: ~12-15 minutes

## MCP Requirements

### Required
- **linear** - Fetch ticket details, link PR to ticket
- **quoth** - Search documentation for test patterns (MANDATORY per project rules)

### Optional (Graceful Fallback)
- **exolar** - Classify failures, query test analytics

**IMPORTANT**: Per project guidelines, Quoth MUST be consulted before generating any test code. The workflow will warn if Quoth is unavailable but will still attempt to search documented patterns.

## Usage Examples

### Basic: Full Workflow
```
/test-ticket ENG-123
```
Creates tests, executes with healing, updates CI, creates PR.

### Preview: Dry Run
```
/test-ticket ENG-456 --dry-run
```
Generates tests and plan without execution or PR.

### Partial: Skip PR
```
/test-ticket ENG-789 --skip-pr
```
Full workflow but stops before creating pull request.

### Debug: Verbose Mode
```
/test-ticket ENG-101 --verbose
```
Shows detailed progress including MCP responses and generated code.

## Project Detection

Tests are placed based on ticket labels:

| Labels | Test Type | Location |
|--------|-----------|----------|
| `feature`, `ui` | E2E UI | `automation/playwright/tests/{feature}/` |
| `bug`, `ui` | Regression | `automation/playwright/tests/{feature}/` |
| `api`, `backend` | API Integration | `automation/playwright/tests/{feature}-api/` |

## Auto-Healing

The execution loop automatically fixes common issues:

| Error | Fix Applied |
|-------|-------------|
| Locator not found | Add `:visible` filter |
| Timeout exceeded | Use `getTimeout()` helper |
| Strict mode violation | Add `.first()` |
| 401 Unauthorized | Delete `.auth/`, recreate |

After 3 failed attempts, tests are marked `test.fixme()` for manual review.

## Configuration

Create `quolar.config.ts` in project root:

```typescript
import { defineConfig } from '@quolar/core'

export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './automation/playwright/tests'
  },
  tickets: {
    provider: 'linear',
    workspace: 'your-workspace'
  },
  documentation: {
    provider: 'quoth'  // optional
  },
  analytics: {
    provider: 'exolar'  // optional
  },
  workflow: {
    maxHealingAttempts: 3
  }
})
```

See [reference.md](./reference.md) for full configuration schema.

## Generated Artifacts

| Artifact | Location |
|----------|----------|
| Test analysis | `docs/test-analysis/{ticket-id}.md` |
| Test plan | `docs/test-plans/{ticket-id}-test-plan.md` |
| Test files | `automation/playwright/tests/{feature}/` |
| Git branch | `test/{ticket-id}-automated-tests` |
| Pull request | GitHub with linked Linear ticket |

## Related Skills

- `/heal-test <file>` - Auto-heal a specific failing test
- `/analyze-failures` - Classify recent test failures

## Documentation

- **Detailed Steps**: [steps/](./steps/)
- **Configuration**: [reference.md](./reference.md)
- **Troubleshooting**: [troubleshooting.md](./troubleshooting.md)
