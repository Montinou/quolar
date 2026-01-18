---
description: Generate Playwright E2E tests from a Linear ticket. Usage: /quolar:test-ticket <ticket-id> [--dry-run] [--skip-pr]
---

# Test Ticket Automation

You are executing the test-ticket skill. The user wants to generate Playwright E2E tests from a Linear ticket.

**Ticket ID**: $ARGUMENTS

## Workflow

Execute these steps in order:

1. **Analyze Ticket** - Use Linear MCP to fetch ticket details, extract requirements and acceptance criteria
2. **Search Patterns** - Use Quoth MCP to find existing test patterns and conventions
3. **Plan Tests** - Generate test scenarios based on ticket requirements
4. **Generate Code** - Create Playwright test files following project patterns
5. **Execute & Heal** - Run tests, auto-fix failures (up to 3 attempts)
6. **Update CI** - Configure GitHub Actions for new tests
7. **Create PR** - Open pull request linked to the ticket

## Options

Parse $ARGUMENTS for these flags:
- `--dry-run` - Generate tests and plan without executing or creating PR
- `--skip-pr` - Execute full workflow but skip PR creation
- `--verbose` - Show detailed progress

## Requirements

- Linear MCP must be connected
- Quoth MCP recommended for pattern search
- Playwright must be installed in the project

Start by fetching the ticket details from Linear.
