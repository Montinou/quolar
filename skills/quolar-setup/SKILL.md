---
name: quolar-setup
description: |
  Interactive setup wizard for Quolar test automation. Use when:
  - First time using Quolar
  - User says "setup quolar", "configure test automation"
  - MCP servers need verification
  - quolar.config.ts needs to be created
allowed-tools: Read, Write, Bash(claude:*), Bash(npx:*), Bash(ls:*), Bash(mkdir:*)
user-invocable: true
---

# Quolar Setup Wizard

Interactive configuration for Quolar test automation.

## When to Use

- First time setting up Quolar
- After installing new MCP servers
- When configuration needs updating
- To verify setup is working

## Setup Workflow

Execute these phases in order. Track progress visually for the user.

### Phase 1: Pre-Flight Checks

**1.1 Check MCP Servers**

```bash
# List connected MCP servers
/mcp
```

**1.2 Verify Required Servers**

Check the MCP list for:
- [ ] `linear` - Required for ticket fetching
- [ ] `quoth` - Required for pattern documentation (MANDATORY per project rules)

**1.3 Guide Installation If Missing**

**Linear MCP** (via config file - requires LINEAR_API_KEY):
```json
// Add to ~/.claude/settings.json or claude_desktop_config.json
"mcpServers": {
  "linear": {
    "command": "npx",
    "args": ["-y", "@linear/mcp-server"],
    "env": { "LINEAR_API_KEY": "lin_api_xxx" }
  }
}
```

**Quoth MCP** (OAuth - recommended):
```bash
claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp
```

**Exolar MCP** (OAuth - optional):
```bash
claude mcp add exolar-qa --transport http https://exolar.ai-innovation.site/api/mcp/mcp -s user
```

---

### Phase 2: Configuration File

**2.1 Check for Existing Config**

```bash
ls quolar.config.ts 2>/dev/null || echo "No config found"
```

**2.2 If Missing, Gather Information**

Ask the user for:
1. Linear workspace name (e.g., "attorneyshare")
2. Test directory path (default: `./automation/playwright/tests`)
3. Playwright config path (default: `./playwright.config.ts`)

**2.3 Generate Configuration**

Create `quolar.config.ts` with the collected values:

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
    workspace: '{user-provided-workspace}'
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

### Phase 3: Directory Setup

Ensure required directories exist:

```bash
mkdir -p automation/playwright/tests
mkdir -p automation/playwright/page-objects
mkdir -p automation/playwright/utils
mkdir -p docs/test-analysis
mkdir -p docs/test-plans
```

---

### Phase 4: Verification

**4.1 Test Linear Connection**

Use Linear MCP to fetch a sample ticket or list recent issues:
```
mcp__linear__list_issues({ first: 1 })
```

Verify the workspace is accessible.

**4.2 Test Quoth Connection**

Search for existing test patterns:
```
mcp__quoth__quoth_search_index({ query: "playwright test patterns" })
```

Verify documentation access.

**4.3 Test Playwright Setup**

```bash
npx playwright --version
```

If not installed, guide the user:
```bash
npm install -D @playwright/test
npx playwright install
```

---

### Phase 5: Success Summary

Display completion status:

```
===================================
     Quolar Setup Complete!
===================================

MCP Servers:
  [x] linear - Connected (workspace: {workspace})
  [x] quoth - Connected
  [ ] exolar - Not configured (optional)

Configuration:
  [x] quolar.config.ts created

Directories:
  [x] automation/playwright/tests/
  [x] automation/playwright/page-objects/
  [x] docs/test-analysis/
  [x] docs/test-plans/

Playwright:
  [x] Version: {version}

===================================
         Next Steps
===================================

1. Run: /test-ticket <your-ticket-id>
2. See: skills/test-ticket/SKILL.md for full docs
3. Optional: Configure Exolar for test analytics
```

---

## Troubleshooting

### Linear MCP Not Connected

```
Error: MCP server 'linear' not connected
```

**Solution**: Add Linear MCP to your config with LINEAR_API_KEY:
```json
// In ~/.claude/settings.json or claude_desktop_config.json
"linear": {
  "command": "npx",
  "args": ["-y", "@linear/mcp-server"],
  "env": { "LINEAR_API_KEY": "lin_api_xxx" }
}
```

Get your API key from: Linear Settings -> API -> Personal API keys

---

### Quoth MCP Not Connected

```
Error: MCP server 'quoth' not connected
```

**Solution**:
```bash
claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp
```

This will open a browser for OAuth authentication.

---

### Exolar MCP Not Connected (Optional)

```
Error: MCP server 'exolar' not connected
```

**Solution**:
```bash
claude mcp add exolar-qa --transport http https://exolar.ai-innovation.site/api/mcp/mcp -s user
```

Note: Exolar is optional and provides test analytics features.

---

### Linear Authentication Failed

```
Error: 401 Unauthorized
```

**Solution**:
1. Verify LINEAR_API_KEY is valid
2. Get a new key from Linear Settings -> API -> Personal API keys
3. Update the key in your MCP config
4. Restart Claude Code

---

### Playwright Not Installed

```
Error: playwright command not found
```

**Solution**:
```bash
npm install -D @playwright/test
npx playwright install
```

This installs Playwright and downloads browser binaries.

---

### Config File Syntax Error

```
Error: Failed to parse quolar.config.ts
```

**Solution**: Ensure the config follows this structure:
```typescript
import { defineConfig } from '@quolar/core'

export default defineConfig({
  // ... configuration
})
```

Check for missing commas, brackets, or invalid values.

---

## Related Documentation

- [Test Ticket Skill](../test-ticket/SKILL.md) - Main test automation workflow
- [Configuration Reference](../test-ticket/reference.md) - Full config options
- [Troubleshooting Guide](../test-ticket/troubleshooting.md) - Common issues
