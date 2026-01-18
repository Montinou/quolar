# Quolar - AI-Powered Test Automation

Convert Linear tickets into self-healing Playwright E2E tests.

## Quick Start

```bash
/quolar-setup              # First-time configuration (run once)
/test-ticket ENG-123       # Generate tests from ticket
```

## Prerequisites

### Required MCP Servers

Before using Quolar skills, ensure these MCP servers are connected:

```bash
# Check connected servers
/mcp
```

**Required:**
- `linear` - Fetch ticket details, link PR to ticket
- `quoth` - Search documentation for test patterns (MANDATORY per project rules)

**Optional:**
- `exolar` - Classify failures, query test analytics

### Install Missing Servers

**Linear MCP** (requires LINEAR_API_KEY):
```json
// Add to ~/.claude/settings.json or claude_desktop_config.json
"linear": {
  "command": "npx",
  "args": ["-y", "@linear/mcp-server"],
  "env": { "LINEAR_API_KEY": "lin_api_xxx" }
}
```

**Quoth MCP** (OAuth - browser auth):
```bash
claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp
```

**Exolar MCP** (OAuth - optional):
```bash
claude mcp add exolar-qa --transport http https://exolar.ai-innovation.site/api/mcp/mcp -s user
```

### Configuration File

Create `quolar.config.ts` in your project root (or use `/quolar-setup`):

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
    provider: 'quoth'
  },
  analytics: {
    provider: 'exolar'
  },
  workflow: {
    maxHealingAttempts: 3
  }
})
```

---

## Available Skills

### `/test-ticket <ticket-id>`

Generate Playwright E2E tests from a Linear ticket.

```bash
/test-ticket ENG-123           # Full workflow
/test-ticket ENG-456 --dry-run # Preview without executing
/test-ticket ENG-789 --skip-pr # Execute but skip PR creation
```

**Workflow**: Analyze -> Search Quoth -> Plan -> Generate -> Execute -> CI -> PR

See [skills/test-ticket/SKILL.md](./skills/test-ticket/SKILL.md) for full documentation.

### `/quolar-setup`

Interactive configuration wizard for first-time setup.

- Validates MCP server connections
- Creates configuration file
- Sets up test directories
- Verifies Linear workspace access

See [skills/quolar-setup/SKILL.md](./skills/quolar-setup/SKILL.md) for details.

---

## Quoth Integration (MANDATORY)

Per project rules, Quoth MUST be consulted during the workflow:

- **Step 2**: Search existing patterns before generating code
- **Step 7**: Propose new patterns to documentation

The workflow will warn if Quoth is unavailable but will still attempt to find documented patterns.

---

## Generated Artifacts

| Artifact | Location |
|----------|----------|
| Test analysis | `docs/test-analysis/{ticket-id}.md` |
| Test plan | `docs/test-plans/{ticket-id}-test-plan.md` |
| Test files | `automation/playwright/tests/{feature}/` |
| Git branch | `test/{ticket-id}-automated-tests` |
| Pull request | GitHub with linked Linear ticket |

---

## Troubleshooting

Common issues and solutions:

| Error | Solution |
|-------|----------|
| Linear MCP not connected | Add to config with LINEAR_API_KEY |
| Quoth MCP not connected | Run `claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp` |
| Linear 401 Unauthorized | Verify LINEAR_API_KEY is valid |
| Playwright not found | Run `npm install -D @playwright/test && npx playwright install` |

See [skills/test-ticket/troubleshooting.md](./skills/test-ticket/troubleshooting.md) for detailed troubleshooting.

---

## Documentation

- **[Complete Analysis & Documentation](./docs/QUOLAR-COMPLETE-ANALYSIS.md)** - Comprehensive single-source-of-truth for all Quolar details
- **Test Ticket Workflow**: [skills/test-ticket/SKILL.md](./skills/test-ticket/SKILL.md)
- **Setup Wizard**: [skills/quolar-setup/SKILL.md](./skills/quolar-setup/SKILL.md)
- **Configuration Reference**: [skills/test-ticket/reference.md](./skills/test-ticket/reference.md)
- **Step-by-Step Guides**: [skills/test-ticket/steps/](./skills/test-ticket/steps/)
