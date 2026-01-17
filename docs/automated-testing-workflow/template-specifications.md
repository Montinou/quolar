# Template Specifications - Automated Testing Workflow

**Version**: 1.0
**Last Updated**: 2026-01-17

---

## Overview

The workflow uses templates to ensure consistent test generation. Templates are placeholders that get populated with ticket-specific content.

**Template Types**:
1. **e2e-test.ts.template** - E2E UI tests
2. **api-test.ts.template** - API integration tests
3. **pr-description.md.template** - Pull request descriptions
4. **test-plan.md.template** - Test plan structure

---

## E2E Test Template

### File: `e2e-test.ts.template`

```typescript
import { test, expect } from '@playwright/test'
import { {{PAGE_OBJECTS}} } from '../../page-objects/{{PAGE_OBJECT_FILES}}'
import { createAuthenticatedContextsParallel } from '../../utils/fast-setup'
import { TEST_URLS } from '../../../shared/test-urls'
import { TEST_USERS } from '../../../shared/test-data/users'
import { getTimeout } from '../../utils/timeout-manager'
import { blockAllAnalytics } from '../../utils/analytics-blocker'
import { ModalSuppressor } from '../../utils/modal-suppressor'

test.describe('{{FEATURE_NAME}} - {{TICKET_ID}}', () => {
  {{#each SCENARIOS}}
  test('{{this.name}}', async ({{#if this.needsAuth}}{ browser }{{else}}{ page }{{/if}}) => {
    {{#if this.needsAuth}}
    const contexts = await createAuthenticatedContextsParallel(browser, [
      { userKey: '{{this.userKey}}', setupPage: true }
    ])
    const page = contexts[0].page!
    {{else}}
    await blockAllAnalytics(page)
    await ModalSuppressor.setup(page)
    {{/if}}

    {{#each this.pageObjects}}
    const {{this.varName}} = new {{this.className}}(page)
    {{/each}}

    {{#each this.steps}}
    await test.step('{{this.description}}', async () => {
      {{this.code}}
    })
    {{/each}}

    {{#if this.needsAuth}}
    await test.step('Cleanup', async () => {
      await page.close()
    })
    {{/if}}
  })
  {{/each}}
})
```

### Template Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `PAGE_OBJECTS` | string[] | Page object imports | `PO_LoginPage`, `PO_Dashboard` |
| `PAGE_OBJECT_FILES` | string[] | Page object file names | `PO_LoginPage`, `PO_Dashboard` |
| `FEATURE_NAME` | string | Feature being tested | `Authentication Flow` |
| `TICKET_ID` | string | Linear ticket ID | `LIN-123` |
| `SCENARIOS` | Scenario[] | Test scenarios | See Scenario structure |

### Scenario Structure

```typescript
interface Scenario {
  name: string              // Test name
  needsAuth: boolean        // Requires authentication?
  userKey?: string          // Test user key (if needsAuth)
  pageObjects: PageObjectRef[]
  steps: TestStep[]
}

interface PageObjectRef {
  varName: string          // Variable name (e.g., 'loginPage')
  className: string        // Class name (e.g., 'PO_LoginPage')
}

interface TestStep {
  description: string      // Step description
  code: string            // TypeScript code
}
```

### Example Usage

**Input**:
```json
{
  "PAGE_OBJECTS": ["PO_LoginPage", "PO_Dashboard"],
  "PAGE_OBJECT_FILES": ["PO_LoginPage", "PO_Dashboard"],
  "FEATURE_NAME": "Authentication Flow",
  "TICKET_ID": "LIN-123",
  "SCENARIOS": [
    {
      "name": "Successful login with valid credentials",
      "needsAuth": false,
      "pageObjects": [
        { "varName": "loginPage", "className": "PO_LoginPage" },
        { "varName": "dashboardPage", "className": "PO_Dashboard" }
      ],
      "steps": [
        {
          "description": "Navigate to login page",
          "code": "await page.goto(`${TEST_URLS.BASE_URL}/login`)\nawait page.waitForLoadState('domcontentloaded')"
        },
        {
          "description": "Enter credentials and submit",
          "code": "await loginPage.login(\n  TEST_USERS.KENSHIN_ATTORNEY.email,\n  TEST_USERS.KENSHIN_ATTORNEY.password\n)"
        }
      ]
    }
  ]
}
```

**Output**: See workflow-steps.md for full generated test example.

---

## API Test Template

### File: `api-test.ts.template`

```typescript
import { test, expect } from '@playwright/test'
import { graphqlRequest, expectGraphQLSuccess } from '../../utils/api-helpers'
import { TEST_USERS } from '../../../shared/test-data/users'
import { TEST_URLS } from '../../../shared/test-urls'

test.describe('{{FEATURE_NAME}} API - {{TICKET_ID}}', () => {
  {{#each SCENARIOS}}
  test('{{this.name}}', async () => {
    const {{this.operationType}} = `
      {{this.graphqlOperation}}
    `

    const variables = {{this.variables}}

    const response = await graphqlRequest(
      {{this.operationType}},
      variables,
      { authToken: TEST_USERS.{{this.userKey}}.token }
    )

    {{#if this.expectSuccess}}
    expectGraphQLSuccess(response)
    expect(response.data.{{this.dataPath}}).toMatchObject({{this.expectedData}})
    {{else}}
    expect(response.errors).toBeDefined()
    expect(response.errors[0].message).toContain('{{this.expectedError}}')
    {{/if}}
  })
  {{/each}}
})
```

### API Template Variables

| Variable | Type | Description |
|----------|------|-------------|
| `FEATURE_NAME` | string | Feature name |
| `TICKET_ID` | string | Ticket ID |
| `SCENARIOS` | APIScenario[] | API test scenarios |

### API Scenario Structure

```typescript
interface APIScenario {
  name: string
  operationType: 'mutation' | 'query'
  graphqlOperation: string    // GraphQL query/mutation
  variables: object
  userKey: string             // Test user key
  expectSuccess: boolean
  dataPath?: string           // Path in response.data
  expectedData?: object
  expectedError?: string
}
```

---

## PR Description Template

### File: `pr-description.md.template`

```markdown
## Test Implementation for {{TICKET_ID}}: {{TICKET_TITLE}}

**Linear Ticket**: {{LINEAR_TICKET_URL}}
{{#if PR_URL}}
**Original PR**: {{PR_URL}}
{{/if}}

### Test Coverage Summary

- ✅ **{{SCENARIO_COUNT}} {{TEST_TYPE}} test scenarios** implemented
- ✅ **{{#if ALL_PASSING}}All tests passing{{else}}{{PASSING_COUNT}}/{{TOTAL_COUNT}} tests passing{{/if}}** in local execution
- ✅ **CI integration** configured and tested
- ✅ **Exolar dashboard** integration enabled
{{#if AUTO_HEALING_COUNT}}
- ✅ **Auto-healing** applied {{AUTO_HEALING_COUNT}} fixes during generation
{{/if}}

---

### Test Details

**Playwright Project**: `{{PLAYWRIGHT_PROJECT}}` ({{EXECUTION_MODE}}, {{WORKER_COUNT}} workers)

**Test File**: `{{TEST_FILE_PATH}}`

**Execution Time**: {{LOCAL_DURATION}} (local), ~{{CI_DURATION}} (CI expected)

**Test Scenarios**:

{{#each SCENARIOS}}
{{INDEX}}. ✅ **{{this.name}}**
   - {{this.description}}
   - Duration: {{this.duration}}

{{/each}}

---

### Implementation Details

**Page Objects Used**:
{{#each PAGE_OBJECTS}}
- `{{this.name}}` ({{this.status}})
{{/each}}

**Helper Utilities**:
{{#each HELPERS}}
- `{{this.name}}` - {{this.description}}
{{/each}}

**Standards Compliance**:
- ✅ Follows TEST_STANDARDS.md locator pattern
- ✅ Uses `domcontentloaded` wait strategy
- ✅ No hardcoded timeouts
- ✅ All locators in page objects
- ✅ Proper test.step() grouping

---

### CI Configuration Changes

**Files Modified**:
{{#each MODIFIED_FILES}}
- `{{this.path}}` - {{this.description}}
{{/each}}

**CI Features**:
- Runs on push to main and PRs
- {{EXECUTION_MODE}} execution ({{WORKER_COUNT}} workers)
- Exolar dashboard reporting
- Artifact upload (HTML report, videos on failure)
- PR comment with results summary

---

{{#if AUTO_HEALING_HISTORY}}
### Auto-Healing Applied

During test generation, the auto-healing loop detected and fixed:

{{#each AUTO_HEALING_HISTORY}}
{{INDEX}}. **Attempt {{this.attempt}} Failure**: {{this.issue}}
   - **Issue**: {{this.error}}
   - **Fix**: {{this.fix}}
   - **Commit**: `{{this.commitMessage}}`

{{/each}}

{{/if}}

---

### Testing Instructions

**Run locally**:
```bash
# Run all {{FEATURE_NAME}} tests
npx playwright test {{TEST_FILE_PATTERN}}

# Run specific test file
npx playwright test {{TEST_FILE_PATH}}

# View HTML report
npx playwright show-report automation/test-results/playwright-html-report
```

**View in Exolar Dashboard**:
- Dashboard URL: {{DASHBOARD_URL}}
- Search for branch: `{{GIT_BRANCH}}`
- View detailed execution logs and failure analysis

---

### Checklist

- [x] Tests follow TEST_STANDARDS.md
- [x] All locators in page objects
- [x] No hardcoded timeouts or URLs
- [x] Analytics blocked for performance
- [x] Modal suppression configured
- [x] CI workflow configured
- [x] Exolar dashboard integration tested
- [x] All tests passing locally
{{#if AUTO_HEALING_COUNT}}
- [x] Auto-healing applied successfully
{{/if}}
- [x] Documentation updated

---

### Next Steps

1. ✅ CI runs automatically on push
2. ⏳ Review Exolar dashboard results after CI completes (~{{CI_DURATION}})
3. ⏳ Manual QA verification if needed
4. ⏳ Merge after approval

---

🤖 **Generated with**: [Claude Code Test Ticket Automation](https://claude.com/claude-code)
📊 **Exolar Dashboard**: [View Execution]({{DASHBOARD_EXECUTION_URL}})
📝 **Linear Ticket**: [{{TICKET_ID}}]({{LINEAR_TICKET_URL}})
```

### PR Template Variables

| Variable | Type | Description |
|----------|------|-------------|
| `TICKET_ID` | string | Linear ticket ID |
| `TICKET_TITLE` | string | Ticket title |
| `LINEAR_TICKET_URL` | string | Linear ticket URL |
| `PR_URL` | string? | Original feature PR URL |
| `SCENARIO_COUNT` | number | Number of test scenarios |
| `TEST_TYPE` | string | "E2E UI" or "API integration" |
| `ALL_PASSING` | boolean | All tests passing? |
| `PASSING_COUNT` | number | Number of passing tests |
| `TOTAL_COUNT` | number | Total number of tests |
| `AUTO_HEALING_COUNT` | number? | Number of auto-fixes |
| `PLAYWRIGHT_PROJECT` | string | Playwright project name |
| `EXECUTION_MODE` | string | "parallel" or "serial" |
| `WORKER_COUNT` | number | Number of workers |
| `TEST_FILE_PATH` | string | Path to test file |
| `LOCAL_DURATION` | string | Local execution time |
| `CI_DURATION` | string | Expected CI time |

---

## Test Plan Template

### File: `test-plan.md.template`

```markdown
# Test Plan: {{TICKET_ID}} - {{TICKET_TITLE}}

## Test Strategy
- **Type**: {{TEST_TYPE}}
- **Playwright Project**: {{PLAYWRIGHT_PROJECT}}
- **Execution Mode**: {{EXECUTION_MODE}}
- **Workers**: {{WORKER_COUNT}}
- **Estimated Duration**: {{ESTIMATED_DURATION}}

## Test Scenarios

{{#each SCENARIOS}}
### {{INDEX}}. {{this.name}} ✓
**Priority**: {{this.priority}}
**Type**: {{this.type}}

**Steps**:
{{#each this.steps}}
{{INDEX}}. {{this}}
{{/each}}

**Data Requirements**:
{{#each this.dataRequirements}}
- {{this}}
{{/each}}

**Expected Results**:
{{#each this.expectedResults}}
- {{this}}
{{/each}}

---

{{/each}}

## Test Data

### Required Test Users
{{#each TEST_USERS}}
- {{this.name}} ({{this.description}})
{{/each}}

### Test URLs
{{#each TEST_URLS}}
- {{this.name}}: {{this.url}}
{{/each}}

## Page Objects
{{#each PAGE_OBJECTS}}
- {{this.name}} ({{this.status}})
{{/each}}

## Helper Utilities
{{#each HELPERS}}
- {{this.name}}
{{/each}}

## Implementation Notes
{{IMPLEMENTATION_NOTES}}
```

---

## Template Usage in Workflow

### Step 1: Load Template

```typescript
const templatePath = testType === 'api'
  ? '.claude/skills/test-ticket/templates/api-test.ts.template'
  : '.claude/skills/test-ticket/templates/e2e-test.ts.template'

const template = await read(templatePath)
```

### Step 2: Populate Variables

```typescript
const populated = Handlebars.compile(template)({
  PAGE_OBJECTS: ['PO_LoginPage', 'PO_Dashboard'],
  FEATURE_NAME: 'Authentication Flow',
  TICKET_ID: 'LIN-123',
  SCENARIOS: scenarios
})
```

### Step 3: Write Output

```typescript
await write(outputPath, populated)
```

---

## Custom Templates

### Creating Custom Templates

Projects can create custom templates:

```bash
# Add to project
mkdir -p .claude/skills/test-ticket/templates/
cp e2e-test.ts.template custom-feature.ts.template

# Edit custom-feature.ts.template
# Add project-specific imports, helpers, patterns
```

The workflow will detect and use project-specific templates when appropriate.

---

**Version**: 1.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
