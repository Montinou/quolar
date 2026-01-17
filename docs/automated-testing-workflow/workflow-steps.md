# Workflow Steps - Automated Testing Workflow

**Version**: 1.0
**Last Updated**: 2026-01-17

---

## Overview

The Automated Testing Workflow consists of 7 sequential steps that transform a Linear ticket into fully tested code with CI integration and PR documentation.

**Execution Flow**:
```
Step 1: Ticket Analysis
   ↓
Step 2: Pattern Search
   ↓
Step 3: Test Planning
   ↓
Step 4: Test Generation
   ↓
Step 5: Execution Loop (Auto-Healing)
   ↓
Step 6: CI Integration
   ↓
Step 7: PR Creation
```

**Total Duration**: ~12-15 minutes (varies by complexity)

---

## STEP 1: Ticket Analysis

### Purpose
Read Linear ticket and extract testing requirements.

### Duration
~30 seconds

### Process

**1.1 Fetch Ticket from Linear MCP**
```typescript
const ticket = await mcp.linear.get_issue({
  id: ticketId,
  includeRelations: true
})
```

**1.2 Extract Key Information**
- Title and description
- Labels (feature, bug, api, ui)
- Acceptance criteria
- Related PRs and branches
- Linked issues (blockers, dependencies)
- Project and team context

**1.3 Determine Test Type**

| Labels | Test Type | Location |
|--------|-----------|----------|
| `feature`, `ui` | E2E UI Tests | `automation/playwright/tests/{feature}/` |
| `bug`, `ui` | E2E Regression Tests | `automation/playwright/tests/{feature}/` |
| `api`, `backend` | API Integration Tests | `automation/playwright/tests/{feature}-api/` |
| `feature`, `ui`, `api` | Both E2E + API | Multiple directories |

**1.4 Check for Related PR**
```typescript
if (ticket.pr_url) {
  const prDescription = await fetchPRDescription(ticket.pr_url)
  const changedFiles = await fetchPRFiles(ticket.pr_url)
  // Use for additional context
}
```

**1.5 Checkout Git Branch**
```bash
git checkout -b test/LIN-123-automated-tests
```

### Outputs

**Ticket Analysis Document**:
```markdown
# Ticket Analysis: LIN-123

## Ticket Details
- **Title**: User Authentication Flow
- **Type**: Feature
- **Status**: In Progress
- **Labels**: feature, ui, authentication
- **Priority**: High

## Requirements
1. Users can log in with email/password
2. Invalid credentials show error message
3. Successful login redirects to dashboard
4. Session persists across page refresh

## Test Strategy
- **Test Type**: E2E UI Tests
- **Playwright Project**: chrome (parallel)
- **Test Location**: automation/playwright/tests/authentication/
- **Page Objects**: PO_LoginPage, PO_Dashboard

## Related Code
- PR: #456
- Branch: feature/LIN-123-auth-flow
- Files Changed: src/pages/Login.tsx, src/services/auth.ts
```

**File Location**: `docs/test-analysis/LIN-123.md`

### Error Handling

**If ticket not found**:
```
Error: Linear ticket LIN-123 not found
→ Verify ticket ID
→ Check workspace configuration
```

**If no labels**:
```
Warning: No labels found, defaulting to E2E UI tests
→ Workflow continues with best guess
→ Manual review recommended
```

---

## STEP 2: Pattern Search

### Purpose
Search actual codebase for relevant testing patterns.

### Duration
~1-2 minutes

### Process

**2.1 Search Actual Playwright Tests**
```typescript
// Find tests with similar keywords
const similarTests = await glob(
  'automation/playwright/tests/**/*{auth,login,signin}*.spec.ts'
)

// Read top 3 matching files
for (const testFile of similarTests.slice(0, 3)) {
  const content = await read(testFile)
  // Extract patterns
}
```

**2.2 Optional: Search Quoth MCP** (graceful fallback)
```typescript
try {
  const patterns = await mcp.quoth.quoth_search_index({
    query: "playwright authentication flow test patterns"
  })
  // Use as supplementary reference
} catch (error) {
  console.log("Quoth unavailable, using codebase patterns only")
}
```

**2.3 Search for Page Objects**
```typescript
const relevantPOMs = await glob(
  'automation/playwright/page-objects/PO_{Login,Auth,Dashboard}.ts'
)
```

**2.4 Search for Helper Utilities**
```typescript
const helpers = await glob('automation/playwright/utils/*.ts')
// Check: auth-helper, timeout-manager, smart-waits, analytics-blocker
```

**2.5 Extract Patterns**
- Authentication context usage
- Locator patterns (`:visible` → `.filter()` → `.first()`)
- Wait strategies (`domcontentloaded`)
- API interception patterns
- Helper function usage

### Outputs

**Pattern Library Document**:
```markdown
# Pattern Library: LIN-123

## Similar Tests Found

### 1. authentication/signin.spec.ts
- Uses PO_LoginPage
- Creates authenticated context from storage state
- Pattern: domcontentloaded wait strategy

### 2. verification/permissions.spec.ts
- Uses PO_Navigation for post-login navigation
- Pattern: waitForURL with getTimeout('navigation')

## Page Objects to Reuse
- PO_LoginPage (automation/playwright/page-objects/PO_LoginPage.ts)
- PO_Dashboard (automation/playwright/page-objects/PO_Dashboard.ts)

## Helper Utilities
- createAuthenticatedContextsParallel (utils/fast-setup.ts)
- getTimeout (utils/timeout-manager.ts)
- blockAllAnalytics (utils/analytics-blocker.ts)

## Locator Pattern
```typescript
const button = page
  .locator('button:visible')
  .filter({ hasText: 'Accept' })
  .first()
```
```

**File Location**: `docs/test-analysis/LIN-123-patterns.md`

---

## STEP 3: Test Planning

### Purpose
Generate comprehensive test plan with scenarios and execution strategy.

### Duration
~2 minutes

### Process

**3.1 Spawn test-planner Agent**
```typescript
await Task({
  subagent_type: "general-purpose",
  description: "Generate test plan",
  prompt: `
    Create comprehensive test plan for LIN-123.

    Context:
    - Ticket Analysis: docs/test-analysis/LIN-123.md
    - Pattern Library: docs/test-analysis/LIN-123-patterns.md

    Generate:
    1. Test scenarios (happy path + edge cases)
    2. Execution strategy (serial vs parallel)
    3. Test data requirements
    4. Page object reuse decisions

    Output: docs/test-plans/LIN-123-test-plan.md
  `
})
```

**3.2 Agent Analyzes**
- Feature requirements from ticket
- Acceptance criteria
- Edge cases and error scenarios
- Integration points with other features
- Test data requirements

**3.3 Determine Playwright Project**

**Serial Projects** (workers: 1):
- `chrome-referral-settings` - Shared form state
- `chrome-waterfall-referrals` - Shared page operations
- `tooltip-tests` - Shared cases in beforeAll

**Parallel Projects** (workers: 4):
- `chrome` - Default for independent tests
- `chrome-waterfall-negotiation` - Unique data per test

**3.4 Generate Test Scenarios**
- Happy path scenarios
- Edge cases (empty fields, invalid input)
- Error handling (API failures, timeouts)
- Integration scenarios

### Outputs

**Test Plan Document**: `docs/test-plans/LIN-123-test-plan.md`

See [usage-guide.md](./usage-guide.md) for full example.

---

## STEP 4: Test Generation

### Purpose
Create Playwright test files following project standards.

### Duration
~3 minutes

### Process

**4.1 Create Git Branch**
```bash
git checkout -b test/LIN-123-automated-tests
```

**4.2 Spawn test-writer Agents**
```typescript
// Can spawn multiple agents in parallel for different scenarios
const testWriterAgents = scenarios.map(scenario =>
  Task({
    subagent_type: "general-purpose",
    description: `Generate ${scenario.name} test`,
    prompt: generateTestPrompt(scenario)
  })
)

await Promise.all(testWriterAgents)
```

**4.3 Agent Generates Test**
- Uses existing page objects
- Implements correct locator pattern
- Uses `createAuthenticatedContextsParallel` for setup
- Imports helpers from `automation/playwright/utils/`
- Uses constants: `TEST_URLS`, `TEST_USERS`, `TEST_FEES`
- Implements proper wait strategies
- Groups assertions with `test.step()`

**4.4 Place Tests in Correct Directory**
- E2E: `automation/playwright/tests/{feature}/`
- API: `automation/playwright/tests/{feature}-api/`

**4.5 Run TypeScript Type Checking**
```bash
yarn check:types
```

### Outputs

**Test Files**:
- `automation/playwright/tests/authentication/login-flow.spec.ts`
- All tests pass type checking
- No linting errors

See [template-specifications.md](./template-specifications.md) for templates.

---

## STEP 5: Execution Loop (Auto-Healing)

### Purpose
Execute tests with self-healing capability.

### Duration
~4-8 minutes (depends on failures)

### Process

**5.1 Execution Loop**
```
MAX_RETRIES = 3
attempt = 1

WHILE attempt <= MAX_RETRIES:
  1. Execute Playwright tests
  2. Capture results
  3. IF ALL PASS → Break loop, proceed to Step 6
  4. IF FAIL → Analyze, Heal, Retry
  5. IF attempt > 3 → Mark as fixme, proceed to Step 6
```

**5.2 Execute Playwright Tests**
```bash
npx playwright test --project={projectName}
```

**5.3 Capture Results**
- JSON reporter: `automation/test-results/playwright-results.json`
- Dashboard reporter: Sends to Exolar (if configured)

**5.4 IF ALL TESTS PASS**
```
✅ All tests passing!
→ Proceed to Step 6 (CI Integration)
```

**5.5 IF TESTS FAIL**

**5.5.1 Send to Exolar MCP**
```typescript
const executions = await mcp.exolar.query_exolar_data({
  dataset: "executions",
  filters: { branch: "test/LIN-123-automated-tests", limit: 1 }
})
const executionId = executions.data[0].id
```

**5.5.2 Query Failure Details**
```typescript
const failures = await mcp.exolar.query_exolar_data({
  dataset: "execution_failures",
  filters: { execution_id: executionId },
  view_mode: "detailed"
})
```

**5.5.3 Classify Each Failure**
```typescript
for (const failure of failures.data) {
  const classification = await mcp.exolar.perform_exolar_action({
    action: "classify",
    params: {
      execution_id: executionId,
      test_name: failure.test_name
    }
  })

  // Result: "FLAKE" | "BUG" | "ENVIRONMENT"
  // Confidence: 0-100
}
```

**5.5.4 Spawn test-healer Agent**
```typescript
await Task({
  subagent_type: "general-purpose",
  description: "Fix failing tests",
  prompt: healingPrompt(failures, classifications)
})
```

**5.5.5 Agent Applies Fixes**
- Reads failure details
- Analyzes error messages & stack traces
- Generates fix suggestions
- Applies fixes using Edit tool

**5.5.6 Commit Fixes**
```bash
git add .
git commit -m "fix: auto-heal LIN-123 tests (attempt ${attempt})"
```

**5.5.7 Retry**
```
attempt++
→ Go to Step 5.2
```

### Common Auto-Fixes

| Error Pattern | Detection | Auto-Fix |
|---------------|-----------|----------|
| Locator not found | `Error: Locator not found` | Add `:visible` filter |
| Timeout | `TimeoutError` | Use `getTimeout()` |
| Strict mode | `Error: strict mode violation` | Add `.first()` |
| Authentication | `401 Unauthorized` | Delete `.auth`, recreate |

### Outputs

**If Successful**:
- All tests passing
- Git commits with fix history

**If Max Retries Exceeded**:
- Remaining failures marked as `test.fixme()`
- Documented in PR description

See [integration/exolar-mcp.md](./integration/exolar-mcp.md) for details.

---

## STEP 6: CI Integration

### Purpose
Update GitHub Actions workflows and Playwright configuration.

### Duration
~1 minute

### Process

**6.1 Spawn ci-integrator Agent**
```typescript
await Task({
  subagent_type: "general-purpose",
  description: "Update CI config",
  prompt: ciIntegrationPrompt(testFiles, executionMode)
})
```

**6.2 Agent Analyzes**
- Current `.github/workflows/ci.yml`
- Current `playwright.config.ts`
- Determine if new project needed

**6.3 Update Playwright Configuration** (if needed)

**Pattern 1: Add to Existing Project** (most common)
```typescript
// No changes needed - tests auto-picked up by 'chrome' project
```

**Pattern 2: Create New Serial Project**
```typescript
{
  name: 'chrome-authentication',
  testMatch: '**/authentication/**/*.spec.ts',
  use: { browserName: 'chromium' },
  workers: 1,
  fullyParallel: false
}
```

**6.4 Update GitHub Actions Workflow**
```yaml
- name: Run Authentication Tests
  env:
    FRONTEND_URL: ${{ secrets.STAGING_URL }}
    BACKEND_URL: ${{ secrets.STAGING_API_URL }}
    DASHBOARD_URL: ${{ secrets.EXOLAR_DASHBOARD_URL }}
    DASHBOARD_API_KEY: ${{ secrets.EXOLAR_API_KEY }}
  run: |
    npx playwright test \
      --project=chrome-authentication \
      --reporter=html,json,list,./automation/playwright/reporters/dashboard-reporter.ts
```

**6.5 Commit Changes**
```bash
git add .github/workflows/ci.yml playwright.config.ts
git commit -m "ci: add Playwright tests for LIN-123"
```

### Outputs

- Updated `.github/workflows/ci.yml`
- Updated `playwright.config.ts` (if needed)
- Changes committed to test branch

---

## STEP 7: PR Creation

### Purpose
Create GitHub PR with comprehensive test report.

### Duration
~30 seconds

### Process

**7.1 Verify Clean Git Status**
```bash
git status  # Should be clean
```

**7.2 Push Branch**
```bash
git push origin test/LIN-123-automated-tests
```

**7.3 Generate PR Description**
```markdown
## Test Implementation for LIN-123

**Linear Ticket**: https://linear.app/attorney-share/issue/LIN-123

### Test Coverage Summary
- ✅ 4 E2E test scenarios implemented
- ✅ All tests passing
- ✅ CI integration configured

### Test Details
[Full details...]

### Auto-Healing Applied
[Healing history...]

### Testing Instructions
[How to run...]
```

**7.4 Create PR**
```bash
gh pr create \
  --title "test: automated tests for LIN-123" \
  --body "$(cat pr-description.md)" \
  --label "automated-tests,qa,e2e"
```

**7.5 Link PR to Linear Ticket**
```typescript
await mcp.linear.update_issue({
  id: "LIN-123",
  links: [{
    url: prUrl,
    title: "Automated Test PR #789"
  }]
})
```

**7.6 Wait for CI to Start**
```bash
sleep 120  # 2 minutes
```

**7.7 Validate CI Execution**
```typescript
const execution = await mcp.exolar.query_exolar_data({
  dataset: "executions",
  filters: { branch: "test/LIN-123-automated-tests", limit: 1 }
})

console.log(`CI Status: ${execution.data[0].status}`)
```

### Outputs

- GitHub PR created: `#789`
- Linear ticket updated with PR link
- CI workflow triggered
- Exolar dashboard link provided

---

## Workflow Metrics

### Typical Execution Times

| Step | Description | Duration | % of Total |
|------|-------------|----------|------------|
| 1 | Ticket Analysis | 30s | 3% |
| 2 | Pattern Search | 1m 30s | 10% |
| 3 | Test Planning | 2m | 14% |
| 4 | Test Generation | 3m | 21% |
| 5 | Execution Loop | 6m | 41% |
| 6 | CI Integration | 1m | 7% |
| 7 | PR Creation | 30s | 4% |
| **Total** | | **~14m** | **100%** |

### Success Rates (Projected)

- **First-time test accuracy**: 90%+
- **Auto-healing success**: 70%+
- **CI integration success**: 95%+
- **PR creation success**: 98%+

---

## State Management

### Workflow State

State is tracked across steps:

```typescript
interface WorkflowState {
  ticketId: string
  currentStep: number
  startTime: Date
  ticketAnalysis?: TicketAnalysis
  patternLibrary?: PatternLibrary
  testPlan?: TestPlan
  testFiles?: string[]
  executionResults?: TestResults[]
  prUrl?: string
  attemptCount: number
  fixesApplied: Fix[]
  errors: Error[]
}
```

**State Persistence**: `.workflow-state/LIN-123.json`

---

**Version**: 1.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
