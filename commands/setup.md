---
description: Interactive setup wizard for Quolar test automation. Validates MCP servers, creates config, sets up directories.
---

# Quolar Setup Wizard

You are executing the quolar-setup skill. Guide the user through first-time Quolar configuration.

## Phase 1: Pre-Flight Checks

### 1.1 Check MCP Servers

List connected MCP servers and verify:
- [ ] `linear` - Required for ticket fetching
- [ ] `quoth` - Required for pattern documentation

### 1.2 Guide Installation If Missing

**Linear MCP** (requires LINEAR_API_KEY):
```json
// Add to ~/.claude/settings.json
"linear": {
  "command": "npx",
  "args": ["-y", "@linear/mcp-server"],
  "env": { "LINEAR_API_KEY": "lin_api_xxx" }
}
```

**Quoth MCP**:
```bash
claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp
```

## Phase 2: Configuration File

Check for `quolar.config.ts`. If missing, ask the user for:
1. Linear workspace name
2. Test directory path (default: `./automation/playwright/tests`)
3. Playwright config path (default: `./playwright.config.ts`)

Then create the config file.

## Phase 3: Directory Setup

Create required directories:
```bash
mkdir -p automation/playwright/tests
mkdir -p automation/playwright/page-objects
mkdir -p docs/test-analysis
mkdir -p docs/test-plans
```

## Phase 4: Verification

Test connections:
1. Fetch a sample Linear issue
2. Search Quoth for test patterns
3. Verify Playwright installation

## Phase 5: Success Summary

Display completion status with checkmarks for each component.

Start by checking the connected MCP servers.
