# Usage Guide - Automated Testing Workflow

**Version**: 1.0
**Last Updated**: 2026-01-17

---

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Command Syntax](#command-syntax)
3. [Workflow Examples](#workflow-examples)
4. [Advanced Features](#advanced-features)
5. [Best Practices](#best-practices)
6. [Common Scenarios](#common-scenarios)
7. [Tips and Tricks](#tips-and-tricks)

---

## Basic Usage

### Simple Test Generation

The most basic usage - generate tests for a Linear ticket:

```bash
# Navigate to project directory
cd /path/to/attorneyshare/mvp

# Start Claude Code
claude-code

# Run the workflow
/test-ticket LIN-123
```

That's it! The workflow will:
1. Read ticket LIN-123 from Linear
2. Search for similar test patterns
3. Generate a comprehensive test plan
4. Create Playwright tests
5. Execute tests with auto-healing
6. Update CI configuration
7. Create a PR and link it to the ticket

---

## Command Syntax

### Full Command Syntax

```bash
/test-ticket <TICKET_ID> [OPTIONS]
```

### Parameters

#### TICKET_ID (Required)

The Linear ticket identifier.

**Format**: `LIN-<number>` or `<TEAM_KEY>-<number>`

**Examples**:
```bash
/test-ticket LIN-123
/test-ticket ENG-456
/test-ticket QA-789
```

#### OPTIONS (Future Enhancement)

Options are planned for future releases:

```bash
# Skip specific steps (future)
/test-ticket LIN-123 --skip-ci

# Dry run mode (future)
/test-ticket LIN-123 --dry-run

# Custom test type (future)
/test-ticket LIN-123 --type=api

# Custom branch (future)
/test-ticket LIN-123 --branch=feature/custom-branch
```

---

## Workflow Examples

### Example 1: Feature Test Generation

**Scenario**: Generate E2E tests for a new authentication feature

**Linear Ticket**: LIN-456
- Title: "User Authentication Flow"
- Type: Feature
- Labels: `feature`, `ui`, `authentication`
- Description: "Implement login/logout functionality with session persistence"

**Command**:
```bash
/test-ticket LIN-456
```

**Expected Output**:
```
✓ Step 1: Analyzing ticket LIN-456...
  → Title: User Authentication Flow
  → Type: Feature
  → Test type: E2E UI Tests
  → Created: docs/test-analysis/LIN-456.md

✓ Step 2: Searching for patterns...
  → Found 3 similar tests: signin.spec.ts, permissions.spec.ts, auth.spec.ts
  → Page objects: PO_LoginPage, PO_Dashboard
  → Helpers: createAuthenticatedContextsParallel, getTimeout
  → Created: docs/test-analysis/LIN-456-patterns.md

✓ Step 3: Generating test plan...
  → Spawning test-planner agent...
  → 4 scenarios planned:
    1. Successful login flow
    2. Invalid email format
    3. Incorrect password
    4. Session persistence
  → Execution mode: Parallel (chrome project)
  → Created: docs/test-plans/LIN-456-test-plan.md

✓ Step 4: Generating tests...
  → Branch created: test/LIN-456-automated-tests
  → Spawning test-writer agent...
  → Generated: automation/playwright/tests/authentication/login-flow.spec.ts
  → Type checking: PASS

✓ Step 5: Executing tests (attempt 1/3)...
  → Running: npx playwright test --project=chrome
  → Results: 4 passed, 0 failed
  → Duration: 2m 18s
  → All tests passing!

✓ Step 6: Updating CI configuration...
  → Analyzed: .github/workflows/ci.yml
  → Tests covered by existing chrome project
  → No configuration changes needed

✓ Step 7: Creating PR...
  → Pushed: test/LIN-456-automated-tests
  → PR created: #789
  → Linear ticket updated with PR link
  → CI triggered successfully
  → Exolar dashboard: https://exolar.ai-innovation.site/dashboard

✅ Workflow completed in 12m 34s

Next steps:
1. Review PR: https://github.com/attorneyshare/mvp/pull/789
2. Monitor CI results in Exolar dashboard
3. Merge after approval
```

**Generated Files**:
- `docs/test-analysis/LIN-456.md` - Ticket analysis
- `docs/test-analysis/LIN-456-patterns.md` - Pattern library
- `docs/test-plans/LIN-456-test-plan.md` - Test plan
- `automation/playwright/tests/authentication/login-flow.spec.ts` - Test file

---

### Example 2: Bug Fix with Auto-Healing

**Scenario**: Generate regression tests for a bug fix with auto-healing

**Linear Ticket**: LIN-789
- Title: "Fix duplicate case creation on double-click"
- Type: Bug
- Labels: `bug`, `ui`, `critical`

**Command**:
```bash
/test-ticket LIN-789
```

**Expected Output** (with auto-healing):
```
✓ Step 1-4: [Omitted for brevity]

✓ Step 5: Executing tests (attempt 1/3)...
  → Running: npx playwright test
  → Results: 2 passed, 1 failed
  → Failure: "Verify no duplicate cases created"

  → Sending to Exolar MCP for analysis...
  → Execution ID: 12345

  → Classifying failure...
  → Classification: FLAKE (85% confidence)
  → Evidence: "strict mode violation", "multiple matching elements"

  → Spawning test-healer agent...
  → Fix applied: Added .first() to locator
  → Committed: "fix: auto-heal LIN-789 tests (attempt 1)"

✓ Step 5: Executing tests (attempt 2/3)...
  → Running: npx playwright test
  → Results: 3 passed, 0 failed
  → All tests passing!

[Rest of workflow continues...]

✅ Workflow completed in 14m 18s (2 healing attempts)
```

**Auto-Healing Actions Taken**:
1. Detected "strict mode violation" error
2. Exolar classified as FLAKE (multiple elements matching)
3. Applied fix: Added `.first()` to locator chain
4. Retry succeeded

---

### Example 3: API Test Generation

**Scenario**: Generate API integration tests

**Linear Ticket**: LIN-321
- Title: "Add GraphQL mutation for case creation"
- Type: Feature
- Labels: `api`, `backend`, `graphql`

**Command**:
```bash
/test-ticket LIN-321
```

**Expected Output**:
```
✓ Step 1: Analyzing ticket LIN-321...
  → Title: Add GraphQL mutation for case creation
  → Type: Feature
  → Labels: api, backend, graphql
  → Test type: API Integration Tests

✓ Step 2: Searching for patterns...
  → Found API test patterns in automation/playwright/tests/api/
  → Similar tests: cases-api.spec.ts, referrals-api.spec.ts
  → Helpers: graphqlRequest, expectGraphQLSuccess

✓ Step 3: Generating test plan...
  → 5 scenarios planned:
    1. Create case with valid data
    2. Create case with missing required fields
    3. Create case with invalid attorney ID
    4. Create case exceeds rate limit
    5. Create case unauthorized user

✓ Step 4: Generating tests...
  → Generated: automation/playwright/tests/api/case-creation-api.spec.ts
  → Test type: API Integration (no browser needed)

[Rest of workflow continues...]
```

**Generated Test**:
```typescript
// automation/playwright/tests/api/case-creation-api.spec.ts
import { test, expect } from '@playwright/test'
import { graphqlRequest, expectGraphQLSuccess } from '../../utils/api-helpers'
import { TEST_USERS } from '../../../shared/test-data/users'

test.describe('Case Creation API - LIN-321', () => {
  test('Create case with valid data', async () => {
    const mutation = `
      mutation CreateCase($input: CreateCaseInput!) {
        createCase(input: $input) {
          id
          title
          status
        }
      }
    `

    const variables = {
      input: {
        title: 'Personal Injury Case',
        practiceArea: 'PERSONAL_INJURY',
        description: 'Test case description'
      }
    }

    const response = await graphqlRequest(mutation, variables, {
      authToken: TEST_USERS.KENSHIN_ATTORNEY.token
    })

    expectGraphQLSuccess(response)
    expect(response.data.createCase).toMatchObject({
      title: 'Personal Injury Case',
      status: 'DRAFT'
    })
  })

  // More tests...
})
```

---

## Advanced Features

### Feature 1: Custom Test Patterns

While the workflow auto-detects patterns, you can guide it by creating documentation:

```bash
# Create custom pattern documentation in Quoth
# The workflow will find and use these patterns
```

### Feature 2: Retry Control

Control the auto-healing retry behavior:

```bash
# Set in .env
MAX_RETRY_ATTEMPTS=5  # Increase retries
```

### Feature 3: Verbose Logging

Enable detailed logging for debugging:

```bash
# Set in .env
VERBOSE_LOGGING=true

# Run workflow
/test-ticket LIN-123

# Output will include:
# - MCP request/response logs
# - Agent spawn details
# - Detailed failure analysis
# - Fix application steps
```

### Feature 4: Custom CI Configuration

The workflow auto-detects serial vs parallel execution, but you can customize:

```typescript
// In playwright.config.ts, add custom project
{
  name: 'chrome-custom-feature',
  testMatch: '**/custom-feature/**/*.spec.ts',
  use: { browserName: 'chromium' },
  workers: 1,  // Serial execution
  fullyParallel: false
}
```

The workflow will detect and use this custom project if test matches pattern.

---

## Best Practices

### 1. Ticket Preparation

**Before running the workflow**, ensure your Linear ticket has:

✅ **Clear title**: Descriptive and specific
```
✅ Good: "Implement OAuth2 Google authentication"
❌ Bad: "Add auth"
```

✅ **Detailed description**: Include acceptance criteria
```markdown
## Description
Implement Google OAuth2 authentication flow

## Acceptance Criteria
- [ ] Users can click "Sign in with Google"
- [ ] OAuth consent screen displays correctly
- [ ] Users redirected to dashboard after auth
- [ ] Session persists across browser refresh
```

✅ **Appropriate labels**: Help auto-detect test type
```
feature, ui, authentication → E2E UI tests
bug, api → API integration tests
```

✅ **Linked PR** (if available): Provides implementation context

### 2. Test Execution Environment

Always run against staging, not production:

```bash
# .env should point to staging
FRONTEND_URL=https://app.attorneyshare.info  # ✅ Staging
FRONTEND_URL=https://app.attorneyshare.com   # ❌ Production
```

### 3. Review Generated Tests

Always review generated tests before merging:

```bash
# Read test plan first
cat docs/test-plans/LIN-123-test-plan.md

# Review generated tests
code automation/playwright/tests/authentication/login-flow.spec.ts

# Run tests locally
npx playwright test automation/playwright/tests/authentication/
```

**Check for**:
- Locators are in page objects (not inline)
- No hardcoded timeouts or URLs
- Proper wait strategies
- Clear test.step() descriptions
- Edge cases covered

### 4. Monitor CI Execution

Don't just merge - verify CI passes:

```bash
# Check Exolar dashboard
open https://exolar.ai-innovation.site/dashboard

# Or query via MCP
# In Claude Code:
"Show latest Exolar execution for branch test/LIN-123-automated-tests"
```

### 5. Iterate on Failures

If auto-healing doesn't fix all tests:

```bash
# Review failures
cat automation/test-results/playwright-results.json

# Manual fixes may be needed for:
# - Complex locator issues
# - Test data conflicts
# - Environment-specific problems

# After manual fixes:
git add .
git commit -m "fix: manual test fixes for LIN-123"
git push
```

---

## Common Scenarios

### Scenario 1: Workflow Interrupted

If the workflow is interrupted (network issue, crash), resume manually:

```bash
# Check current state
git status
git log --oneline -5

# If in middle of step 4 (test generation):
# - Review docs/test-plans/LIN-123-test-plan.md
# - Continue generating tests manually or re-run workflow

# If in middle of step 5 (execution):
# - Run tests manually: npx playwright test
# - Check results and fix failures

# If in middle of step 7 (PR creation):
# - Complete PR creation manually:
git push origin test/LIN-123-automated-tests
gh pr create --title "..." --body "..."
```

### Scenario 2: Tests Pass Locally But Fail in CI

```bash
# Common causes:
# 1. Different Node version
# 2. Missing environment variables
# 3. Race conditions in parallel execution

# Debug:
# 1. Check CI logs in GitHub Actions
# 2. Review Exolar dashboard for CI execution
# 3. Compare local vs CI environment

# Fix:
# 1. Update .github/workflows/ci.yml with missing env vars
# 2. Consider serial execution for flaky tests
# 3. Add retry annotation if truly flaky
```

### Scenario 3: Auto-Healing Max Retries Exceeded

```bash
# If all 3 attempts fail:
# - Workflow marks remaining as test.fixme()
# - PR created with partial tests
# - Manual intervention required

# Review fixme tests:
grep -r "test.fixme" automation/playwright/tests/

# Common manual fixes:
# 1. Page objects need updating (UI changed)
# 2. Test data conflicts (need unique data)
# 3. Environment issues (URL, API endpoint)
```

### Scenario 4: Multiple Tickets in Parallel

Can you run workflow for multiple tickets simultaneously?

**Answer**: Yes, but with caution

```bash
# Terminal 1:
/test-ticket LIN-123

# Terminal 2 (different project directory):
cd ../attorneyshare-api
/test-ticket LIN-456

# Same project, different tickets:
# ⚠️  Not recommended - may cause git conflicts
# Wait for first workflow to complete before starting second
```

---

## Tips and Tricks

### Tip 1: Speed Up Pattern Search

Pre-read common patterns to speed up workflow:

```bash
# Before running workflow, cache patterns
grep -r "authentication" automation/playwright/tests/ > /tmp/auth-patterns.txt
grep -r "PO_LoginPage" automation/playwright/page-objects/ > /tmp/login-po.txt
```

The workflow will find these files faster.

### Tip 2: Custom Test Templates

Create project-specific templates:

```bash
# Add to .claude/skills/test-ticket/templates/
cp e2e-test.ts.template custom-feature.ts.template

# Edit custom-feature.ts.template
# Add project-specific imports, helpers, etc.

# Workflow will detect and use when appropriate
```

### Tip 3: Reuse Test Plans

Save time by reusing test plans for similar features:

```bash
# Copy existing plan
cp docs/test-plans/LIN-123-test-plan.md \
   docs/test-plans/LIN-456-test-plan.md

# Edit for new feature
# Workflow can reference existing plans
```

### Tip 4: Debug Mode

Enable debug mode for troubleshooting:

```bash
# Set in .env
DEBUG=true
VERBOSE_LOGGING=true

# Run workflow
/test-ticket LIN-123

# Output includes:
# - Full MCP request/response bodies
# - Agent internal reasoning
# - Detailed error stack traces
# - File operation logs
```

### Tip 5: Batch Test Generation

Generate tests for multiple related tickets:

```bash
# Create a batch script
cat > batch-test-tickets.sh << 'EOF'
#!/bin/bash
tickets=("LIN-123" "LIN-124" "LIN-125")

for ticket in "${tickets[@]}"; do
  echo "Processing $ticket..."
  claude-code run "/test-ticket $ticket"

  # Wait for completion
  sleep 300  # 5 minutes
done
EOF

chmod +x batch-test-tickets.sh
./batch-test-tickets.sh
```

**Warning**: This is experimental and may cause issues with parallel git operations.

---

## Workflow Customization

### Custom Workflow Steps

Future enhancement - add custom steps:

```bash
# Example: Add custom validation step
# .claude/skills/test-ticket/workflow/08-custom-validation.md

# Workflow will auto-detect and execute
```

### Custom Agents

Future enhancement - create custom agents:

```bash
# Example: Add security testing agent
# .claude/skills/test-ticket/agents/security-tester.md

# Spawned automatically for security-labeled tickets
```

---

## Integration with Other Tools

### Integration 1: Slack Notifications

Get notified when workflow completes:

```bash
# Add to .env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx

# Workflow will post to Slack on completion
```

### Integration 2: Jira Sync

Sync Linear tickets with Jira:

```bash
# Configure in .env
JIRA_PROJECT_KEY=AS
JIRA_API_TOKEN=xxx

# Workflow will sync test status to Jira
```

### Integration 3: DataDog Metrics

Track workflow metrics:

```bash
# Add to .env
DATADOG_API_KEY=xxx

# Workflow will send metrics:
# - Execution time per step
# - Auto-healing success rate
# - Test generation accuracy
```

---

## Frequently Asked Questions

### Q: Can I run this on a feature branch?

**A**: Yes! The workflow detects your current branch and creates test branch from there.

```bash
# Checkout feature branch
git checkout feature/LIN-123-auth-flow

# Run workflow
/test-ticket LIN-123

# Creates: test/LIN-123-automated-tests (from feature branch)
```

### Q: What if my ticket doesn't have a PR yet?

**A**: That's fine! The workflow works with or without a PR.

Without PR:
- Analyzes ticket description and acceptance criteria
- Searches for similar patterns in codebase
- Generates tests based on requirements

With PR:
- Also reads PR description and code changes
- Better context for test generation
- More accurate test scenarios

### Q: Can I customize the test file location?

**A**: Currently, test location is auto-determined by test type:

- E2E UI: `automation/playwright/tests/{feature}/`
- API: `automation/playwright/tests/{feature}-api/`

Future enhancement: Custom location via option.

### Q: How do I disable auto-healing?

**A**: Set retry attempts to 1:

```bash
# .env
MAX_RETRY_ATTEMPTS=1
```

This will run tests once, report failures, and skip healing.

### Q: Can I use this with a different test framework?

**A**: Currently Playwright-only. Future plans:

- Vitest unit tests
- Cypress E2E tests
- Postman API tests

---

## Getting Help

### Documentation

- [README](./README.md) - Overview
- [Architecture](./architecture.md) - System design
- [Installation](./installation.md) - Setup guide
- [Troubleshooting](./troubleshooting.md) - Common issues

### Support Channels

- GitHub Issues: https://github.com/attorneyshare/mvp/issues
- Slack: #qa-automation
- Email: qa-team@attorneyshare.com

---

**Version**: 1.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
