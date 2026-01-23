# Quolar - AI-Powered Test Automation

Convert Linear tickets into self-healing Playwright E2E tests.

## Installation

```bash
# Option 1: Marketplace (Recommended)
/plugin marketplace add Montinou/quolar
/plugin install quolar@quolar-marketplace

# Option 2: Global installation
git clone https://github.com/Montinou/quolar.git ~/.claude/skills/quolar

# Option 3: Development mode
claude --plugin-dir /path/to/quolar
```

## Quick Start

```bash
/quolar-setup              # First-time configuration (run once)
/test-ticket ENG-123       # Generate tests from ticket
```

---

## Prerequisites

### Required MCP Servers

Before using Quolar, ensure these MCP servers are connected:

```bash
/mcp
```

| Server | Status | Purpose |
|--------|--------|---------|
| `linear` | Required | Ticket fetching, PR linking |
| `quoth` | Required | Pattern documentation (MANDATORY) |
| `exolar` | Optional | Test analytics, failure classification |

### Install Missing Servers

**Linear MCP** (requires LINEAR_API_KEY):
```json
"linear": {
  "command": "npx",
  "args": ["-y", "@linear/mcp-server"],
  "env": { "LINEAR_API_KEY": "lin_api_xxx" }
}
```

**Quoth MCP** (OAuth):
```bash
claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp
```

**Exolar MCP** (optional):
```bash
claude mcp add exolar-qa --transport http https://exolar.ai-innovation.site/api/mcp/mcp -s user
```

### Configuration

Create `quolar.config.ts` in project root (or use `/quolar-setup`):

```typescript
import { defineConfig } from '@quolar/core'

export default defineConfig({
  testFramework: {
    provider: 'playwright',
    testDir: './automation/playwright/tests'
  },
  tickets: {
    provider: 'linear',
    workspace: 'your-workspace'
  }
})
```

---

## Available Components

### Skills (User-Invocable Commands)

| Skill | Usage | Purpose |
|-------|-------|---------|
| `/test-ticket` | `/test-ticket ENG-123` | Generate tests from Linear ticket |
| `/quolar-setup` | `/quolar-setup` | First-time configuration wizard |

#### /test-ticket

Generate Playwright E2E tests from a Linear ticket.

```bash
/test-ticket ENG-123           # Full workflow
/test-ticket ENG-456 --dry-run # Preview without executing
/test-ticket ENG-789 --skip-pr # Execute but skip PR creation
```

**7-Step Workflow** (~15-20 minutes):
1. **Analyze** - Fetch ticket, extract requirements
2. **Search** - Query Quoth for patterns (MANDATORY)
3. **Plan** - Generate test scenarios
4. **Generate** - Create Playwright tests
5. **Execute** - Run with auto-healing (3 attempts)
6. **Integrate** - Update CI configuration
7. **PR** - Create PR, test on preview

See [skills/test-ticket/SKILL.md](./skills/test-ticket/SKILL.md) for details.

#### /quolar-setup

Interactive setup wizard for first-time configuration.

**5 Phases**: Pre-Flight → Configuration → Directories → Verification → Summary

See [skills/quolar-setup/SKILL.md](./skills/quolar-setup/SKILL.md) for details.

### Agents (Autonomous)

| Agent | Triggers On | Purpose |
|-------|-------------|---------|
| `test-healer` | "fix failing tests", test errors | Auto-heal test failures |
| `failure-classifier` | "is this a flake?", failure analysis | Classify failures (FLAKE/BUG/ENV) |

Agents trigger automatically when relevant context is detected.

---

## Quoth Integration (MANDATORY)

Per project rules, Quoth MUST be consulted during the workflow:

- **Step 2**: Search existing patterns before generating code
- **Step 7**: Propose new patterns to documentation

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

## Directory Structure

```
quolar/
├── .claude-plugin/
│   ├── plugin.json          # Plugin manifest
│   └── marketplace.json     # Marketplace entry
├── skills/
│   ├── test-ticket/
│   │   ├── SKILL.md         # Main skill documentation
│   │   ├── reference.md     # Configuration reference
│   │   ├── troubleshooting.md
│   │   ├── references/      # Detailed documentation
│   │   ├── steps/           # 7-step workflow guides
│   │   └── scripts/         # Utility scripts
│   └── quolar-setup/
│       ├── SKILL.md         # Setup wizard
│       └── references/      # MCP setup, troubleshooting
├── commands/
│   ├── test-ticket.md       # Command routing
│   └── setup.md
├── agents/
│   ├── test-healer.md       # Auto-heal agent
│   └── failure-classifier.md # Classification agent
└── packages/                # Core implementation
```

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| Linear MCP not connected | Add to config with LINEAR_API_KEY |
| Quoth MCP not connected | `claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp` |
| 401 Unauthorized | Verify LINEAR_API_KEY is valid |
| Playwright not found | `npm install -D @playwright/test && npx playwright install` |

See [skills/test-ticket/troubleshooting.md](./skills/test-ticket/troubleshooting.md) for detailed troubleshooting.

---

## Documentation

| Document | Purpose |
|----------|---------|
| [skills/test-ticket/SKILL.md](./skills/test-ticket/SKILL.md) | Main workflow documentation |
| [skills/quolar-setup/SKILL.md](./skills/quolar-setup/SKILL.md) | Setup wizard guide |
| [skills/test-ticket/reference.md](./skills/test-ticket/reference.md) | Full configuration schema |
| [skills/test-ticket/steps/](./skills/test-ticket/steps/) | Step-by-step guides |
| [docs/QUOLAR-COMPLETE-ANALYSIS.md](./docs/QUOLAR-COMPLETE-ANALYSIS.md) | Comprehensive analysis |
