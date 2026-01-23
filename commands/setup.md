---
name: setup
description: Interactive setup wizard for Quolar test automation. Validates MCP servers, creates config, sets up directories.
argument-hint: ""
allowed-tools: Read, Write, Bash(claude:*), Bash(npx:*), Bash(ls:*), Bash(mkdir:*)
user-invocable: true
---

# Quolar Setup Wizard

Execute the quolar-setup skill to guide first-time Quolar configuration.

## Quick Overview

This wizard completes 5 phases:
1. **Pre-Flight** - Verify MCP server connections
2. **Configuration** - Create `quolar.config.ts`
3. **Directories** - Set up required folder structure
4. **Verification** - Test all connections
5. **Summary** - Display completion status

## Execution Instructions

Follow the detailed phase instructions in `${CLAUDE_PLUGIN_ROOT}/skills/quolar-setup/SKILL.md`.

### Phase 1: Pre-Flight Checks

Verify required MCP servers are connected:
- [ ] `linear` - Required for ticket fetching (needs LINEAR_API_KEY)
- [ ] `quoth` - Required for pattern documentation (MANDATORY per project rules)
- [ ] `exolar` - Optional for test analytics

If servers are missing, guide installation per the SKILL.md instructions.

### Phase 2: Configuration File

Check for existing `quolar.config.ts`. If missing, gather:
1. Linear workspace name (e.g., "attorneyshare")
2. Test directory path (default: `./automation/playwright/tests`)
3. Playwright config path (default: `./playwright.config.ts`)

### Phase 3: Directory Setup

Create required directories for test artifacts.

### Phase 4: Verification

Test all connections by fetching sample data from each MCP server.

### Phase 5: Success Summary

Display completion status with next steps.

Begin by listing connected MCP servers with `/mcp`.
