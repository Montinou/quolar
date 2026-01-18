# Step 7: PR Creation

**Duration**: ~1-2 minutes
**Purpose**: Evaluate documentation needs, then create GitHub PR with comprehensive test report.

---

## Actions

### 1. Evaluate Documentation Needs (MANDATORY)

**Per project rules**: Before creating PR, evaluate if Quoth documentation needs updates.

#### Compare Generated Code vs Documented Patterns

```typescript
// Search Quoth for patterns used in generated tests
const existingPatterns = await mcp.quoth.quoth_search_index({
  query: "playwright test patterns locators authentication"
})

// Read current documentation
const docs = await mcp.quoth.quoth_read_chunks({
  chunk_ids: existingPatterns.chunks?.map(c => c.id).slice(0, 5) || []
})
```

#### Classify Findings

| Finding | Action |
|---------|--------|
| **NEW_PATTERN** - Pattern not in docs | Propose new documentation |
| **VIOLATION** - Code deviates from docs | Fix code OR update docs (if pattern is better) |
| **MATCH** - Code follows docs | No action needed |

#### Propose Documentation Updates

If NEW_PATTERN or improved VIOLATION found:

```typescript
await mcp.quoth.quoth_propose_update({
  doc_id: "patterns/playwright-test-patterns.md",
  new_content: `## Pattern: {name}\n\n**Use case**: {when to use}\n\n\`\`\`typescript\n{code}\n\`\`\``,
  evidence_snippet: "// Code from {ticket-id} tests",
  reasoning: "New pattern discovered during automated test generation"
})
```

#### Pattern Categories to Check

| Category | Document Path | Check For |
|----------|---------------|-----------|
| Authentication | `patterns/auth-patterns.md` | New auth flows, context setup |
| Locators | `patterns/locator-patterns.md` | Novel selector strategies |
| Wait strategies | `patterns/wait-patterns.md` | Custom timeout handling |
| Page objects | `patterns/page-object-patterns.md` | New page object patterns |
| Auto-healing | `patterns/test-healing-patterns.md` | Fixes that should be standard |

#### Documentation Checklist (Include in PR)

```markdown
## Documentation Evaluation

- [ ] Searched Quoth for existing patterns
- [ ] Compared generated code vs documented standards
- [ ] Proposed updates for new patterns (if any)
- [ ] Fixed violations OR proposed doc updates

**Patterns Evaluated**: {count}
**New Patterns Proposed**: {count}
**Violations Fixed**: {count}
```

---

### 2. Verify Clean Git Status

```bash
# Check for uncommitted changes
git status

# Stage any remaining files
git add automation/playwright/tests/{feature}/
git add docs/test-analysis/
git add docs/test-plans/
```

### 3. Push Branch to Origin

```bash
git push -u origin test/{ticket-id}-automated-tests
```

### 4. Generate PR Description

Create comprehensive PR body:

```markdown
## Summary

Automated Playwright E2E tests for [{TICKET-ID}]({linear-url})

### What's Included
- {count} test scenarios covering acceptance criteria
- Page objects: {list}
- Test utilities: {list}

### Test Coverage

| Category | Count | Status |
|----------|-------|--------|
| Happy Path | {n} | Passing |
| Edge Cases | {n} | Passing |
| Error Handling | {n} | Passing |

### Auto-Healing Applied

{healing-summary}

### How to Run

```bash
# Run all new tests
npx playwright test --project=chrome-{feature}

# Run with UI mode
npx playwright test --project=chrome-{feature} --ui
```

### Related
- Linear: [{TICKET-ID}]({linear-url})
- Test Plan: `docs/test-plans/{ticket-id}-test-plan.md`

---
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

### 5. Create Pull Request

```bash
gh pr create \
  --title "test: automated tests for {ticket-id}" \
  --body "$(cat <<'EOF'
## Summary
...PR body from template above...
EOF
)" \
  --label "automated-tests,qa,e2e"
```

### 6. Link PR to Linear Ticket

```typescript
await mcp.linear.update_issue({
  id: ticketId,
  linkPullRequest: prUrl
})
```

### 7. Wait for CI to Start

```bash
# Monitor PR checks (wait ~2 minutes)
gh pr checks --watch
```

### 8. Validate CI Execution (Optional)

With Exolar MCP:

```typescript
const ciExecution = await mcp.exolar.query_exolar_data({
  dataset: "ci_executions",
  filters: { pr_number: prNumber },
  view_mode: "summary"
})
```

---

## PR Template

Full PR template for reference:

```markdown
## Summary

Automated Playwright E2E tests generated from Linear ticket [{TICKET-ID}]({url}).

## Changes

### New Test Files
- `automation/playwright/tests/{feature}/{test}.spec.ts`

### Documentation
- `docs/test-analysis/{ticket-id}.md` - Ticket analysis
- `docs/test-plans/{ticket-id}-test-plan.md` - Test plan

### Configuration
- Updated `playwright.config.ts` (if applicable)
- Updated `.github/workflows/ci.yml` (if applicable)

## Test Results

### Execution Summary
| Metric | Value |
|--------|-------|
| Total Tests | {n} |
| Passed | {n} |
| Auto-Healed | {n} |
| Needs Review | {n} |

### Coverage by Acceptance Criteria
- [x] AC1: {description}
- [x] AC2: {description}
- [ ] AC3: {description} (marked as fixme)

## Auto-Healing History

| Test | Original Error | Fix Applied |
|------|---------------|-------------|
| `login.spec.ts` | Locator not found | Added `:visible` |

## How to Test

```bash
# Run all tests
npx playwright test --project=chrome-{feature}

# Run specific test
npx playwright test {test-file}

# Run with UI
npx playwright test --ui
```

## Checklist

- [x] Tests follow project patterns
- [x] Page objects reused where possible
- [x] Proper wait strategies used
- [x] CI configuration updated
- [x] Documentation generated

---

**Generated by Quolar Test Automation**
Co-Authored-By: Claude Code <noreply@anthropic.com>
```

---

## Output

- GitHub PR created and linked to Linear ticket
- CI workflow triggered
- Test artifacts available for review

---

## Post-Creation

After PR is created:

1. **Monitor CI** - Watch for test execution
2. **Review failures** - Check if any tests need manual fixes
3. **Merge when ready** - After CI passes and review approved
