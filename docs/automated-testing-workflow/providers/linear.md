# Linear Provider

**Type**: TicketProvider
**Status**: Stable (Default)
**MCP Server**: `@linear/mcp-server`

---

## Overview

The Linear provider is Quolar's default ticket provider. It integrates with Linear's issue tracking system via the Linear MCP server, enabling seamless ticket analysis, PR linking, and status updates.

---

## Configuration

### quolar.config.ts

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  tickets: {
    provider: 'linear',
    workspace: 'your-workspace-slug',  // e.g., 'attorney-share'

    // Optional: Filter by team
    team: 'ENG',

    // Optional: Custom label mapping
    labelMapping: {
      'feature': 'e2e-test',
      'bug': 'regression-test',
      'api': 'api-test'
    }
  }
})
```

### Environment Variables

```bash
# .env.quolar
LINEAR_TOKEN=<YOUR_LINEAR_API_KEY>
```

### MCP Configuration

```json
// ~/.claude/mcp.json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_TOKEN}"
      }
    }
  }
}
```

---

## Getting Your Linear Token

1. Navigate to https://linear.app/settings/api
2. Click "Create new personal API key"
3. Name: `Quolar Automation`
4. Click "Create"
5. Copy the token (starts with `lin_api_`)
6. Add to `.env.quolar`:
   ```bash
   LINEAR_TOKEN=<YOUR_LINEAR_API_KEY>
   ```

---

## Interface Implementation

### Supported Operations

| Method | MCP Tool | Description |
|--------|----------|-------------|
| `read()` | `linear_read_issue` | Get ticket details |
| `update()` | `linear_update_issue` | Update ticket fields |
| `linkPR()` | `linear_update_issue` | Add PR attachment |
| `addComment()` | `linear_create_comment` | Add comment to ticket |
| `getAcceptanceCriteria()` | (parsed from description) | Extract AC |
| `search()` | `linear_search_issues` | Search tickets |

### Ticket Mapping

Linear fields are mapped to the `Ticket` interface:

```typescript
// Linear API response → Ticket interface
{
  id: issue.id,
  identifier: issue.identifier,        // e.g., "ENG-123"
  title: issue.title,
  description: issue.description,
  status: issue.state.name,            // e.g., "In Progress"
  labels: issue.labels.nodes.map(l => l.name),
  assignee: issue.assignee?.name,
  team: issue.team?.name,
  linkedPRs: issue.attachments.nodes.map(a => a.url),
  acceptanceCriteria: parseAC(issue.description),
  metadata: {
    priority: issue.priority,
    estimate: issue.estimate,
    cycle: issue.cycle?.name
  }
}
```

---

## Acceptance Criteria Parsing

The Linear provider parses acceptance criteria from the ticket description using these patterns:

### Supported Formats

**Markdown Checkboxes:**
```markdown
## Acceptance Criteria
- [ ] User can login with valid credentials
- [ ] Invalid credentials show error message
- [ ] Session persists after page refresh
```

**Numbered List:**
```markdown
Acceptance Criteria:
1. User can login with valid credentials
2. Invalid credentials show error message
3. Session persists after page refresh
```

**Bullet Points:**
```markdown
AC:
• User can login with valid credentials
• Invalid credentials show error message
• Session persists after page refresh
```

### Parsing Logic

```typescript
function parseAcceptanceCriteria(description: string): string[] {
  // Look for AC section
  const acMatch = description.match(
    /(?:acceptance criteria|ac):?\s*\n([\s\S]*?)(?:\n\n|\n##|$)/i
  )

  if (!acMatch) return []

  return acMatch[1]
    .split('\n')
    .filter(line => line.match(/^[-*•\[\]x0-9. ]+/))
    .map(line => line.replace(/^[-*•\[\]x0-9. ]+/, '').trim())
    .filter(line => line.length > 0)
}
```

---

## Test Type Detection

The provider detects test types from Linear labels:

| Label | Test Type |
|-------|-----------|
| `feature`, `ui`, `frontend` | E2E UI Tests |
| `api`, `backend`, `graphql` | API Tests |
| `integration` | Integration Tests |
| `regression` | Regression Tests |
| `smoke` | Smoke Tests |

### Custom Label Mapping

```typescript
tickets: {
  provider: 'linear',
  workspace: 'attorney-share',
  labelMapping: {
    'my-custom-label': 'e2e-test',
    'api-feature': 'api-test'
  }
}
```

---

## Workflow Integration

### Step 1: Ticket Analysis

```typescript
// Reading ticket
const ticket = await ticketProvider.read('ENG-123')

// Output:
// {
//   identifier: 'ENG-123',
//   title: 'Implement user authentication',
//   description: '...',
//   labels: ['feature', 'authentication', 'ui'],
//   acceptanceCriteria: [
//     'User can login with valid credentials',
//     'Invalid credentials show error message',
//     'Session persists after page refresh'
//   ]
// }
```

### Step 7: PR Creation

```typescript
// Link PR to ticket
await ticketProvider.linkPR('ENG-123', 'https://github.com/org/repo/pull/456')

// Add completion comment
await ticketProvider.addComment('ENG-123', `
✅ Automated tests generated and PR created!

**PR:** https://github.com/org/repo/pull/456
**Tests:** 4 scenarios covering all acceptance criteria
**Status:** All tests passing

🤖 Generated by Quolar v2.0
`)
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `401 Unauthorized` | Invalid token | Regenerate token in Linear settings |
| `404 Not Found` | Ticket doesn't exist | Verify ticket ID |
| `403 Forbidden` | No access to workspace | Check workspace permissions |

### Retry Logic

The Linear adapter implements exponential backoff:

```typescript
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) throw error
      await sleep(1000 * Math.pow(2, attempt))
    }
  }
}
```

---

## Verification

```bash
# Test Linear connection
npx quolar test-connection --provider linear

# Expected output:
# ✓ Linear API connected
# ✓ Workspace: attorney-share
# ✓ User: Your Name
# ✓ Teams accessible: 3
# ✓ Can read issues: Yes
# ✓ Can create comments: Yes
```

---

## Best Practices

### 1. Structured Ticket Descriptions

Write ticket descriptions with clear sections:

```markdown
## Summary
Brief description of the feature/bug

## Requirements
- Requirement 1
- Requirement 2

## Acceptance Criteria
- [ ] AC 1
- [ ] AC 2
- [ ] AC 3

## Technical Notes
Implementation hints for the AI
```

### 2. Use Consistent Labels

Define a label taxonomy for test type detection:

- `e2e` → E2E tests
- `api` → API tests
- `integration` → Integration tests
- `unit` → Unit tests

### 3. Link Related Issues

Use Linear's issue linking to provide context:
- Parent issues (epics)
- Related issues
- Blocking issues

---

## Troubleshooting

### Token Not Working

```bash
# Verify token directly
curl -H "Authorization: Bearer $LINEAR_TOKEN" \
  https://api.linear.app/graphql \
  -d '{"query": "{ viewer { name email } }"}'

# Should return:
# {"data":{"viewer":{"name":"Your Name","email":"you@company.com"}}}
```

### MCP Server Not Starting

```bash
# Test MCP server directly
npx @linear/mcp-server --help

# Clear cache and reload
rm -rf ~/.claude/mcp-cache
claude-code reload
```

### Can't Find Tickets

```bash
# Verify workspace access
curl -H "Authorization: Bearer $LINEAR_TOKEN" \
  https://api.linear.app/graphql \
  -d '{"query": "{ teams { nodes { name key } } }"}'

# Check team access matches your config
```

---

## Related Documentation

- [Architecture](../architecture.md) - Provider abstraction layer
- [Installation](../installation.md) - Setup instructions
- [Jira Provider](./jira.md) - Alternative ticket provider

---

**Version**: 2.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
