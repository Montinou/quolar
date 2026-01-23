---
name: test-ticket
description: Generate Playwright E2E tests from a Linear ticket. Usage: /quolar:test-ticket <ticket-id> [--dry-run] [--skip-pr]
argument-hint: ENG-123 [--dry-run] [--skip-pr] [--verbose]
allowed-tools: Read, Grep, Glob, Write, Edit, Bash(git:*), Bash(npx:*), Bash(yarn:*), Bash(gh:*)
user-invocable: true
---

# Test Ticket Automation

Execute the test-ticket skill to generate Playwright E2E tests from the specified Linear ticket.

**Ticket ID**: $ARGUMENTS

## Execution Instructions

Parse `$ARGUMENTS` for ticket ID and optional flags:
- `--dry-run` - Generate tests and plan without executing or creating PR
- `--skip-pr` - Execute full workflow but skip PR creation
- `--verbose` - Show detailed progress including MCP responses

## Workflow Steps

Execute these 7 steps in order. Consult the detailed step guides in `${CLAUDE_PLUGIN_ROOT}/skills/test-ticket/steps/` for comprehensive instructions:

1. **Analyze** ([01-ticket-analysis.md](${CLAUDE_PLUGIN_ROOT}/skills/test-ticket/steps/01-ticket-analysis.md)) - Fetch ticket from Linear, extract requirements, pull branch, analyze code changes
2. **Search** ([02-pattern-search.md](${CLAUDE_PLUGIN_ROOT}/skills/test-ticket/steps/02-pattern-search.md)) - Query Quoth for documented test patterns (MANDATORY per project rules)
3. **Plan** ([03-test-planning.md](${CLAUDE_PLUGIN_ROOT}/skills/test-ticket/steps/03-test-planning.md)) - Generate test scenarios covering acceptance criteria
4. **Generate** ([04-test-generation.md](${CLAUDE_PLUGIN_ROOT}/skills/test-ticket/steps/04-test-generation.md)) - Create Playwright test files following project patterns
5. **Execute** ([05-execution-loop.md](${CLAUDE_PLUGIN_ROOT}/skills/test-ticket/steps/05-execution-loop.md)) - Run tests with auto-healing (up to 3 attempts)
6. **Integrate** ([06-ci-integration.md](${CLAUDE_PLUGIN_ROOT}/skills/test-ticket/steps/06-ci-integration.md)) - Update GitHub Actions configuration
7. **PR** ([07-pr-creation.md](${CLAUDE_PLUGIN_ROOT}/skills/test-ticket/steps/07-pr-creation.md)) - Evaluate Quoth docs, create PR, execute on preview

## Prerequisites

Verify MCP connections before starting:
- **linear** - Required for ticket fetching
- **quoth** - Required for pattern documentation (MANDATORY)
- **exolar** - Optional for test analytics

Run `${CLAUDE_PLUGIN_ROOT}/skills/test-ticket/scripts/check-mcp.sh` to validate connections.

Begin by fetching the ticket details from Linear MCP.
