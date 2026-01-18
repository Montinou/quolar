# Step 1: Ticket Analysis

**Duration**: ~30 seconds
**Purpose**: Read Linear ticket and extract testing requirements.

---

## Actions

### 1. Fetch Ticket from Linear MCP

```typescript
const ticket = await mcp.linear.get_issue({
  id: ticketId,
  includeRelations: true
})
```

### 2. Extract Key Information

- **Title and description** - Primary test requirements
- **Labels** - Determines test type (feature, bug, api, ui)
- **Acceptance criteria** - Test scenarios
- **Related PRs and branches** - Context for implementation
- **Project and team context** - Test organization

### 3. Determine Test Type Based on Labels

| Labels | Test Type | Location |
|--------|-----------|----------|
| `feature`, `ui` | E2E UI Tests | `automation/playwright/tests/{feature}/` |
| `bug`, `ui` | E2E Regression | `automation/playwright/tests/{feature}/` |
| `api`, `backend` | API Integration | `automation/playwright/tests/{feature}-api/` |

### 4. Create Git Branch

```bash
git checkout -b test/{ticket-id}-automated-tests
```

---

## Output

Generate analysis document: `docs/test-analysis/{ticket-id}.md`

**Document Structure**:
```markdown
# Test Analysis: {TICKET-ID}

## Ticket Summary
- **Title**: {title}
- **Type**: {feature|bug}
- **Labels**: {labels}

## Acceptance Criteria
1. {criterion 1}
2. {criterion 2}

## Test Requirements
- Test type: {E2E UI|API Integration}
- Target directory: {path}
- Related files: {list}
```

---

## Error Handling

### Ticket Not Found
```
Error: Linear ticket {ticket-id} not found
```
**Solutions**:
- Verify ticket ID format (PREFIX-NUMBER)
- Check workspace configuration
- Ensure Linear MCP has correct permissions

### No Labels Found
```
Warning: No labels found, defaulting to E2E UI tests
```
- Workflow continues with best guess
- Manual review recommended after generation
