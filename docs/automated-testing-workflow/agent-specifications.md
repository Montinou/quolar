# Agent Specifications - Automated Testing Workflow

**Version**: 1.0
**Last Updated**: 2026-01-17

---

## Overview

The Automated Testing Workflow uses specialized AI agents for complex tasks. Each agent:
- Receives full context from parent orchestrator
- Executes autonomously within defined scope
- Returns structured results
- Has access to specific tools

**Agent Types**:
1. **test-planner** - Analyzes requirements and generates test plan
2. **test-writer** - Generates Playwright test files
3. **test-healer** - Analyzes failures and applies fixes
4. **ci-integrator** - Updates CI configuration

---

## 1. test-planner Agent

### Purpose
Analyze ticket requirements and generate comprehensive test plan.

### Capabilities
- Requirement analysis
- Test scenario generation
- Execution strategy determination
- Test data planning

### Input Context
```typescript
interface TestPlannerContext {
  ticketAnalysis: {
    title: string
    description: string
    acceptanceCriteria: string[]
    labels: string[]
    testType: 'e2e-ui' | 'e2e-api' | 'both'
  }
  patternLibrary: {
    similarTests: TestFile[]
    pageObjects: PageObject[]
    helpers: HelperFunction[]
    locatorPatterns: string[]
  }
  prDescription?: string
  existingCoverage: string[]
}
```

### Output
Test plan document at `docs/test-plans/{ticketId}-test-plan.md`

### Process

**Step 1: Analyze Requirements**
```markdown
Read ticket analysis:
- Extract user stories
- Identify acceptance criteria
- Note edge cases mentioned
- Check for integration points
```

**Step 2: Generate Scenarios**
```markdown
For each requirement:
  - Happy path scenario
  - Edge case scenarios
  - Error handling scenarios
  - Integration scenarios (if applicable)
```

**Step 3: Determine Execution Strategy**
```markdown
Check test characteristics:
  - Do tests share state? → Serial execution
  - Independent scenarios? → Parallel execution
  - Check existing playwright.config.ts for similar projects
```

**Step 4: Plan Test Data**
```markdown
Identify:
  - Required test users
  - Test data fixtures
  - API mocks needed
  - Database state requirements
```

### Tools Available
- **Read** - Review context documents
- **Write** - Create test plan document
- **Glob/Grep** - Analyze existing coverage

### Prompting Example
```typescript
await Task({
  subagent_type: "general-purpose",
  description: "Generate test plan for LIN-123",
  prompt: `
You are the test-planner agent for the Automated Testing Workflow.

Your task is to create a comprehensive test plan for Linear ticket LIN-123.

## Context Documents
- Ticket Analysis: docs/test-analysis/LIN-123.md
- Pattern Library: docs/test-analysis/LIN-123-patterns.md

## Requirements

1. Read the ticket analysis to understand:
   - Feature requirements
   - Acceptance criteria
   - Test type (E2E UI, API, etc.)

2. Read the pattern library to understand:
   - Similar tests in the codebase
   - Available page objects
   - Helper functions to use

3. Generate a test plan that includes:

   a) **Test Scenarios**:
      - Happy path scenarios (primary user flows)
      - Edge case scenarios (boundary conditions, invalid input)
      - Error handling scenarios (API failures, network timeouts)
      - Integration scenarios (interaction with other features)

   b) **Execution Strategy**:
      - Determine if tests should run in serial or parallel
      - Check if tests share state (forms, global data)
      - Specify Playwright project to use (chrome, chrome-serial, etc.)

   c) **Test Data Requirements**:
      - List required test users
      - Specify test fixtures needed
      - Note any API mocks required

   d) **Page Objects to Reuse**:
      - Identify existing page objects from pattern library
      - Note if new page objects needed

4. Write the test plan to:
   docs/test-plans/LIN-123-test-plan.md

## Output Format

Use this structure:

# Test Plan: LIN-123 - [Ticket Title]

## Test Strategy
- **Type**: E2E UI Tests | API Integration Tests
- **Playwright Project**: chrome | chrome-serial | custom
- **Execution Mode**: Parallel | Serial
- **Workers**: 4 | 1
- **Estimated Duration**: X minutes

## Test Scenarios

### 1. [Scenario Name] ✓
**Priority**: High | Medium | Low
**Type**: Happy Path | Validation | Error Handling | Integration

**Steps**:
1. [Step 1]
2. [Step 2]
...

**Data Requirements**:
- [User/data needed]

**Expected Results**:
- [Expected outcome]

[Repeat for each scenario]

## Test Data
[List users, fixtures, mocks]

## Page Objects
[List page objects to use]

## Helper Utilities
[List helpers to use]

## Implementation Notes
[Any special considerations]

## Follow TEST_STANDARDS.md

Ensure the test plan follows these standards:
- Use existing page objects (no inline locators)
- Follow locator pattern: :visible → .filter() → .first()
- Use getTimeout() instead of hardcoded timeouts
- Block analytics for performance
- Setup modal suppression

## Begin Planning Now
  `
})
```

### Quality Criteria

✅ **Good Test Plan**:
- 4+ test scenarios covering happy path and edge cases
- Clear execution strategy with reasoning
- Specific test data identified
- Reuses existing page objects
- Follows TEST_STANDARDS.md patterns

❌ **Poor Test Plan**:
- Only happy path scenarios
- No execution strategy
- Generic test data ("use test user")
- No page object reuse
- Doesn't follow standards

---

## 2. test-writer Agent

### Purpose
Generate Playwright test files following project standards.

### Capabilities
- Code generation from templates
- Pattern application
- Standards compliance
- Type-safe code generation

### Input Context
```typescript
interface TestWriterContext {
  testPlan: TestPlan
  scenario: TestScenario
  patternLibrary: PatternLibrary
  template: string  // e2e-test.ts.template or api-test.ts.template
  standards: string  // TEST_STANDARDS.md content
}
```

### Output
Playwright test file at `automation/playwright/tests/{feature}/{test-name}.spec.ts`

### Process

**Step 1: Select Template**
```markdown
IF testType === 'e2e-ui':
  Use: templates/e2e-test.ts.template
ELSE IF testType === 'api':
  Use: templates/api-test.ts.template
```

**Step 2: Generate Imports**
```typescript
// Required imports
import { test, expect } from '@playwright/test'

// Page objects (from pattern library)
import { PO_LoginPage } from '../../page-objects/PO_LoginPage'
import { PO_Dashboard } from '../../page-objects/PO_Dashboard'

// Helpers (from pattern library)
import { createAuthenticatedContextsParallel } from '../../utils/fast-setup'
import { getTimeout } from '../../utils/timeout-manager'
import { blockAllAnalytics } from '../../utils/analytics-blocker'
import { ModalSuppressor } from '../../utils/modal-suppressor'

// Constants
import { TEST_URLS } from '../../../shared/test-urls'
import { TEST_USERS } from '../../../shared/test-data/users'
```

**Step 3: Generate Test Structure**
```typescript
test.describe('[Feature Name] - LIN-123', () => {
  test('[Scenario description]', async ({ page }) => {
    // Setup
    await blockAllAnalytics(page)
    await ModalSuppressor.setup(page)

    // Arrange
    const loginPage = new PO_LoginPage(page)

    // Act & Assert (grouped in test.step)
    await test.step('[Step description]', async () => {
      // Actions and assertions
    })
  })
})
```

**Step 4: Apply Standards**
- ✅ All locators in page objects
- ✅ Use `:visible` → `.filter()` → `.first()` pattern
- ✅ Use `getTimeout()` for timeouts
- ✅ Use `domcontentloaded` wait strategy
- ✅ Block analytics
- ✅ Setup modal suppression
- ✅ Group assertions with `test.step()`

**Step 5: Type Check**
```bash
yarn check:types
```

### Tools Available
- **Read** - Read templates and patterns
- **Write** - Create test file
- **Bash** - Run type checking

### Prompting Example
```typescript
await Task({
  subagent_type: "general-purpose",
  description: "Generate login flow tests",
  prompt: `
You are the test-writer agent for the Automated Testing Workflow.

Your task is to generate Playwright tests for the login flow scenarios.

## Context
- Test Plan: docs/test-plans/LIN-123-test-plan.md
- Pattern Library: docs/test-analysis/LIN-123-patterns.md
- Template: .claude/skills/test-ticket/templates/e2e-test.ts.template
- Standards: docs/TEST_STANDARDS.md

## Scenarios to Implement
Read the test plan and implement all scenarios listed.

## Requirements

1. Use existing page objects:
   - PO_LoginPage (for login form interactions)
   - PO_Dashboard (for post-login verification)

2. Follow TEST_STANDARDS.md:
   - Locator pattern: :visible → .filter() → .first()
   - Use getTimeout() instead of hardcoded timeouts
   - Block analytics with blockAllAnalytics(page)
   - Setup modal suppression
   - Use domcontentloaded wait strategy

3. Use helpers:
   - createAuthenticatedContextsParallel for auth setup
   - getTimeout for environment-aware timeouts

4. Use constants:
   - TEST_URLS.BASE_URL for URLs
   - TEST_USERS.KENSHIN_ATTORNEY for test user

5. Structure:
   - Group related assertions with test.step()
   - Clear step descriptions
   - Proper error messages in assertions

## Output
Write the test file to:
automation/playwright/tests/authentication/login-flow.spec.ts

## Type Checking
After writing, run:
yarn check:types

Fix any type errors before completing.
  `
})
```

---

## 3. test-healer Agent

### Purpose
Analyze test failures and apply fixes.

### Capabilities
- Error analysis
- Pattern matching
- Code fixes
- Git commit management

### Input Context
```typescript
interface TestHealerContext {
  failures: TestFailure[]
  classifications: FailureClassification[]
  testFile: string
  attempt: number
}

interface TestFailure {
  testName: string
  errorMessage: string
  stackTrace: string
  line: number
  file: string
}

interface FailureClassification {
  result: 'FLAKE' | 'BUG' | 'ENVIRONMENT'
  confidence: number  // 0-100
  evidence: string[]
  suggestedFix?: string
}
```

### Output
- Fixed test file
- Git commit with fix details

### Process

**Step 1: Analyze Failures**
```markdown
For each failure:
  - Read error message
  - Read stack trace
  - Check Exolar classification
  - Identify pattern
```

**Step 2: Match Fix Pattern**

| Error Pattern | Detection | Fix |
|---------------|-----------|-----|
| Locator not found | `Error: Locator not found` | Add `:visible` filter |
| Multiple elements | `strict mode violation` | Add `.first()` |
| Timeout | `TimeoutError` | Use `getTimeout()` |
| Auth failure | `401 Unauthorized` | Recreate auth state |

**Step 3: Apply Fix**
```typescript
// Use Edit tool to apply fix
await Edit({
  file_path: testFile,
  old_string: 'page.locator("button")',
  new_string: 'page.locator("button:visible").filter({ hasText: "Login" }).first()'
})
```

**Step 4: Commit Fix**
```bash
git add .
git commit -m "fix: auto-heal LIN-123 tests (attempt ${attempt})

- Fixed: Locator not found error
- Applied: Added :visible filter and .first()
- Classification: FLAKE (85% confidence)"
```

### Tools Available
- **Read** - Read test file and error logs
- **Edit** - Apply code fixes
- **Bash** - Git operations

### Common Fix Patterns

**Fix 1: Add :visible Filter**
```typescript
// Before
const button = page.locator('button')

// After
const button = page.locator('button:visible')
```

**Fix 2: Add .first()**
```typescript
// Before
const button = page.locator('button:visible')

// After
const button = page.locator('button:visible').first()
```

**Fix 3: Replace Hardcoded Timeout**
```typescript
// Before
await page.waitForURL('/dashboard', { timeout: 5000 })

// After
await page.waitForURL('/dashboard', { timeout: getTimeout('navigation') })
```

**Fix 4: Add Filter**
```typescript
// Before
const button = page.locator('button:visible')

// After
const button = page.locator('button:visible').filter({ hasText: 'Login' })
```

---

## 4. ci-integrator Agent

### Purpose
Update CI configuration to run new tests.

### Capabilities
- YAML manipulation
- TypeScript config updates
- Git operations

### Input Context
```typescript
interface CIIntegratorContext {
  testFiles: string[]
  executionMode: 'serial' | 'parallel'
  playwrightProject: string
  currentCIConfig: string
  currentPlaywrightConfig: string
}
```

### Output
- Updated `.github/workflows/ci.yml`
- Updated `playwright.config.ts` (if needed)
- Git commit

### Process

**Step 1: Analyze Current Config**
```typescript
// Read current CI workflow
const ciConfig = await read('.github/workflows/ci.yml')

// Read Playwright config
const playwrightConfig = await read('playwright.config.ts')
```

**Step 2: Determine Changes Needed**
```markdown
IF tests match existing project pattern:
  → No playwright.config.ts changes
  → May need new CI job

ELSE IF tests need serial execution:
  → Add new Playwright project
  → Add new CI job

ELSE:
  → Add to existing parallel project
  → Update existing CI job
```

**Step 3: Update Playwright Config** (if needed)
```typescript
// Add new project for serial execution
{
  name: 'chrome-authentication',
  testMatch: '**/authentication/**/*.spec.ts',
  use: { browserName: 'chromium' },
  workers: 1,
  fullyParallel: false
}
```

**Step 4: Update CI Workflow**
```yaml
- name: Run Authentication Tests
  env:
    FRONTEND_URL: ${{ secrets.STAGING_URL }}
    BACKEND_URL: ${{ secrets.STAGING_API_URL }}
    DASHBOARD_URL: ${{ secrets.EXOLAR_DASHBOARD_URL }}
    DASHBOARD_API_KEY: ${{ secrets.EXOLAR_API_KEY }}
    CI: true
    TEST_SUITE_NAME: Authentication
  run: |
    npx playwright test \
      --project=chrome-authentication \
      --reporter=html,json,list,./automation/playwright/reporters/dashboard-reporter.ts
```

**Step 5: Commit Changes**
```bash
git add .github/workflows/ci.yml playwright.config.ts
git commit -m "ci: add Playwright tests for LIN-123"
```

### Tools Available
- **Read** - Read configuration files
- **Edit** - Update configuration files
- **Bash** - Git operations

---

## Agent Coordination

### Parallel Execution

Some agents can run in parallel:

```typescript
// Example: Generate multiple test files in parallel
const scenarios = testPlan.scenarios

const testWriterAgents = scenarios.map((scenario, index) =>
  Task({
    subagent_type: "general-purpose",
    description: `Generate test for ${scenario.name}`,
    prompt: generateTestPrompt(scenario, index)
  })
)

// Execute all in parallel
const results = await Promise.all(testWriterAgents)
```

### Sequential Dependencies

Some agents must run sequentially:

```
test-planner → test-writer → test-healer → ci-integrator
```

---

## Error Handling in Agents

### Agent Failure Recovery

```typescript
try {
  const result = await Task({
    subagent_type: "general-purpose",
    description: "Generate test plan",
    prompt: plannerPrompt
  })
} catch (error) {
  if (isRecoverable(error)) {
    // Retry with modified prompt
    await retryAgent(modifiedPrompt)
  } else {
    // Fallback to manual process
    await manualFallback()
  }
}
```

---

**Version**: 1.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
