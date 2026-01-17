# Exolar MCP Integration - Automated Testing Workflow

**Version**: 1.0
**Last Updated**: 2026-01-17

---

## Overview

Exolar MCP is the core enabler of auto-healing in the Automated Testing Workflow. It provides:
- Test execution analytics
- Failure classification (FLAKE vs BUG vs ENVIRONMENT)
- Historical failure patterns
- Semantic search for similar failures
- Confidence scoring for classifications

**Integration Points**:
- Step 5 (Execution Loop) - Failure analysis
- Step 7 (PR Creation) - CI status validation

---

## Exolar Dashboard

### What is Exolar?

Exolar is a QA dashboard that:
- Tracks all Playwright test executions
- Stores test results, logs, videos, traces
- Provides semantic search across failures
- Classifies failures using AI
- Generates reliability metrics

**Dashboard URL**: https://exolar.ai-innovation.site/dashboard

### Key Features

**1. Execution Tracking**
- Every Playwright run sent to dashboard
- Includes: test results, duration, environment
- Searchable by branch, suite, date

**2. Failure Analysis**
- Error messages and stack traces
- Screenshots and videos
- Network logs and traces
- Semantic similarity to past failures

**3. AI Classification**
- FLAKE: Intermittent, non-deterministic failures
- BUG: Actual code defects
- ENVIRONMENT: Infrastructure/config issues
- Confidence scores (0-100%)

**4. Reliability Metrics**
- Pass rate trends
- Flakiness scores
- Test duration tracking
- Failure clustering

---

## MCP Configuration

### Setup

Add to `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "exolar-qa": {
      "transport": "http",
      "url": "https://exolar.ai-innovation.site/api/mcp/mcp",
      "headers": {
        "Authorization": "Bearer ${DASHBOARD_API_KEY}"
      }
    }
  }
}
```

### Environment Variables

```bash
# .env
DASHBOARD_URL=https://exolar.ai-innovation.site
DASHBOARD_API_KEY=your_api_key_here
```

### Getting API Key

Contact QA team lead to request API key:
- Email: qa-team@attorneyshare.com
- Slack: #qa-automation

---

## MCP Operations

### 1. Explore Index

**Purpose**: Discover available datasets

```typescript
const datasets = await mcp.exolar.explore_exolar_index({
  category: 'datasets'
})

// Returns: List of all 24 queryable datasets with descriptions
```

**Categories**:
- `datasets` - All queryable datasets
- `branches` - Git branches with execution counts
- `suites` - Test suites with pass rates
- `metrics` - Metric definitions

**Example**:
```typescript
const branches = await mcp.exolar.explore_exolar_index({
  category: 'branches',
  query: 'test/'  // Filter branches starting with 'test/'
})
```

---

### 2. Query Exolar Data

**Purpose**: Retrieve test execution data

```typescript
const executions = await mcp.exolar.query_exolar_data({
  dataset: 'executions',
  filters: {
    branch: 'test/LIN-123-automated-tests',
    limit: 1
  }
})
```

**Common Datasets**:

#### executions
Recent test executions with summary stats.

```typescript
const executions = await mcp.exolar.query_exolar_data({
  dataset: 'executions',
  filters: {
    branch: 'test/LIN-123-automated-tests',
    limit: 10
  },
  view_mode: 'summary'
})

// Returns:
// {
//   data: [
//     {
//       id: 12345,
//       branch: 'test/LIN-123-automated-tests',
//       status: 'failure',
//       passed: 3,
//       failed: 1,
//       skipped: 0,
//       duration_ms: 145000,
//       timestamp: '2026-01-17T10:30:00Z'
//     }
//   ]
// }
```

#### execution_failures
Detailed failure information for a specific execution.

```typescript
const failures = await mcp.exolar.query_exolar_data({
  dataset: 'execution_failures',
  filters: {
    execution_id: 12345
  },
  view_mode: 'detailed'
})

// Returns:
// {
//   data: [
//     {
//       test_name: 'Successful login with valid credentials',
//       error_message: 'Error: Locator not found: button:visible',
//       stack_trace: '...',
//       test_file: 'automation/playwright/tests/authentication/login-flow.spec.ts',
//       line_number: 23,
//       screenshot_url: 'https://...',
//       video_url: 'https://...',
//       trace_url: 'https://...'
//     }
//   ]
// }
```

#### flaky_tests
Tests with intermittent pass/fail behavior.

```typescript
const flakyTests = await mcp.exolar.query_exolar_data({
  dataset: 'flaky_tests',
  filters: {
    min_runs: 5,
    include_resolved: false
  }
})

// Returns tests with flakiness percentage
```

#### semantic_search
Search for similar failures using AI embeddings.

```typescript
const similar = await mcp.exolar.query_exolar_data({
  dataset: 'semantic_search',
  filters: {
    query: 'locator not found button',
    search_mode: 'semantic',
    status_filter: 'failed'
  }
})

// Returns failures semantically similar to query
```

---

### 3. Perform Exolar Actions

**Purpose**: Execute heavy operations like failure classification

#### classify

**Most Important Action**: Classifies a test failure.

```typescript
const classification = await mcp.exolar.perform_exolar_action({
  action: 'classify',
  params: {
    execution_id: 12345,
    test_name: 'Successful login with valid credentials'
  }
})

// Returns:
// {
//   result: 'FLAKE',  // or 'BUG' or 'ENVIRONMENT'
//   confidence: 85,    // 0-100
//   evidence: [
//     'intermittent',
//     'locator not found',
//     'no code changes',
//     'similar failures in history'
//   ],
//   suggested_fix: 'Add :visible filter to locator'
// }
```

**Classification Types**:

| Type | Definition | Example |
|------|------------|---------|
| **FLAKE** | Intermittent, non-deterministic | Locator not found (element loaded after check) |
| **BUG** | Actual code defect | Assertion failure (expected "Dashboard" got "Login") |
| **ENVIRONMENT** | Infrastructure/config | Network timeout, 401 Unauthorized |

**Confidence Levels**:
- 90-100%: Very confident (auto-fix safe)
- 70-89%: Confident (auto-fix with caution)
- 50-69%: Uncertain (manual review recommended)
- 0-49%: Low confidence (manual intervention required)

#### compare

Compare two test executions side-by-side.

```typescript
const comparison = await mcp.exolar.perform_exolar_action({
  action: 'compare',
  params: {
    baseline_id: 12340,
    current_id: 12345
  }
})

// Returns:
// {
//   new_failures: [...],
//   fixed_tests: [...],
//   performance_regressions: [...]
// }
```

#### generate_report

Generate markdown report for an execution.

```typescript
const report = await mcp.exolar.perform_exolar_action({
  action: 'generate_report',
  params: {
    execution_id: 12345,
    include_recommendations: true
  }
})

// Returns markdown report with failure details and recommendations
```

---

## Auto-Healing Integration

### How Auto-Healing Works

**Step 5.5: Failure Analysis & Healing**

```typescript
// 1. Get execution ID
const executions = await mcp.exolar.query_exolar_data({
  dataset: 'executions',
  filters: { branch: gitBranch, limit: 1 }
})
const executionId = executions.data[0].id

// 2. Get failure details
const failures = await mcp.exolar.query_exolar_data({
  dataset: 'execution_failures',
  filters: { execution_id: executionId },
  view_mode: 'detailed'
})

// 3. Classify each failure
for (const failure of failures.data) {
  const classification = await mcp.exolar.perform_exolar_action({
    action: 'classify',
    params: {
      execution_id: executionId,
      test_name: failure.test_name
    }
  })

  // 4. Apply fix based on classification
  if (classification.result === 'FLAKE' && classification.confidence > 70) {
    await applyFlakeFix(failure, classification)
  } else if (classification.result === 'BUG' && classification.confidence > 70) {
    await applyBugFix(failure, classification)
  } else if (classification.result === 'ENVIRONMENT') {
    await applyEnvironmentFix(failure, classification)
  } else {
    // Low confidence - mark for manual review
    await markForManualReview(failure, classification)
  }
}

// 5. Commit fixes
await commitFixes(attempt)

// 6. Retry tests
```

---

### Classification Examples

#### Example 1: FLAKE - Locator Not Found

**Failure**:
```
Error: Locator not found: button:visible
  at PO_LoginPage.clickLoginButton (PO_LoginPage.ts:15)
```

**Classification**:
```json
{
  "result": "FLAKE",
  "confidence": 90,
  "evidence": [
    "intermittent (3/10 recent runs failed)",
    "no code changes in last 5 commits",
    "similar failures in history with :visible fix",
    "element exists in screenshot"
  ],
  "suggested_fix": "Add .first() to locator chain"
}
```

**Auto-Fix Applied**:
```typescript
// Before
const loginButton = page.locator('button:visible')

// After
const loginButton = page.locator('button:visible').filter({ hasText: 'Login' }).first()
```

---

#### Example 2: BUG - Assertion Failure

**Failure**:
```
Error: expect(received).toHaveText(expected)

Expected: "Dashboard"
Received: "Login"
```

**Classification**:
```json
{
  "result": "BUG",
  "confidence": 95,
  "evidence": [
    "consistent failure (10/10 recent runs)",
    "code changed in last commit (Login.tsx)",
    "assertion failure (expected vs actual mismatch)",
    "no similar historical failures"
  ],
  "suggested_fix": "Check if redirect logic changed in Login.tsx"
}
```

**Auto-Fix**: NOT auto-fixable (requires code investigation)
→ Mark as `test.fixme()` with comment

---

#### Example 3: ENVIRONMENT - Network Timeout

**Failure**:
```
TimeoutError: page.goto: Navigation timeout of 30000ms exceeded
```

**Classification**:
```json
{
  "result": "ENVIRONMENT",
  "confidence": 85,
  "evidence": [
    "timeout error",
    "intermittent (5/10 recent runs)",
    "CI environment only (local tests pass)",
    "network-related error"
  ],
  "suggested_fix": "Increase timeout for CI environment"
}
```

**Auto-Fix Applied**:
```typescript
// Before
await page.goto(url, { timeout: 30000 })

// After
await page.goto(url, { timeout: getTimeout('navigation') })
// getTimeout() returns higher value in CI
```

---

## Dashboard Integration

### Sending Test Results

Test results are automatically sent via Playwright dashboard reporter:

```typescript
// playwright.config.ts
reporter: [
  ['html'],
  ['json', { outputFile: 'automation/test-results/playwright-results.json' }],
  ['list'],
  ['./automation/playwright/reporters/dashboard-reporter.ts']  // Exolar integration
]
```

**Dashboard Reporter**:
```typescript
// automation/playwright/reporters/dashboard-reporter.ts
class DashboardReporter implements Reporter {
  async onEnd(result: FullResult) {
    const executionData = {
      branch: process.env.GITHUB_REF_NAME || getCurrentBranch(),
      suite: process.env.TEST_SUITE_NAME || 'default',
      results: result.results,
      duration_ms: result.duration,
      environment: process.env.CI ? 'ci' : 'local'
    }

    await sendToExolar(executionData)
  }
}
```

---

### Viewing Results in Dashboard

**Access Dashboard**:
```bash
open https://exolar.ai-innovation.site/dashboard
```

**Search for Execution**:
1. Enter branch name: `test/LIN-123-automated-tests`
2. View execution details
3. Click on failures to see:
   - Error messages
   - Stack traces
   - Screenshots
   - Videos
   - Traces
   - Network logs

**Semantic Search**:
1. Go to "Search" tab
2. Enter error message: `locator not found button`
3. View similar historical failures
4. See how they were resolved

---

## Advanced Features

### Failure Clustering

Group similar failures together:

```typescript
const clusters = await mcp.exolar.query_exolar_data({
  dataset: 'clustered_failures',
  filters: {
    execution_id: 12345,
    threshold: 0.8  // Similarity threshold (0-1)
  }
})

// Returns:
// {
//   clusters: [
//     {
//       pattern: 'Locator not found: button',
//       tests: ['test1', 'test2', 'test3'],
//       suggested_fix: 'Add .first() to all button locators'
//     }
//   ]
// }
```

### Reliability Score

Calculate test reliability:

```typescript
const reliability = await mcp.exolar.query_exolar_data({
  dataset: 'reliability_score',
  filters: {
    suite: 'authentication',
    from: '2026-01-01',
    to: '2026-01-17'
  }
})

// Returns:
// {
//   score: 92,  // 0-100
//   pass_rate: 95,
//   flaky_rate: 3,
//   average_duration: 145000
// }
```

### Performance Regressions

Detect slow tests:

```typescript
const regressions = await mcp.exolar.query_exolar_data({
  dataset: 'performance_regressions',
  filters: {
    threshold: 1.5  // 50% slower than baseline
  }
})

// Returns tests that got significantly slower
```

---

## Troubleshooting

### Connection Issues

**Error**: `Connection refused to Exolar dashboard`

**Solutions**:
```bash
# 1. Ping dashboard
curl https://exolar.ai-innovation.site/health

# 2. Check API key
echo $DASHBOARD_API_KEY

# 3. Test MCP endpoint
curl -H "Authorization: Bearer $DASHBOARD_API_KEY" \
  https://exolar.ai-innovation.site/api/mcp/health
```

### Classification Failures

**Error**: `Exolar classification unavailable`

**Solutions**:
- Check execution exists in dashboard
- Verify test results were sent
- Check dashboard reporter configuration
- Fallback: Manual classification

---

## Benefits

### With Exolar MCP

✅ **Auto-healing**: 70%+ of failures fixed automatically
✅ **Intelligent classification**: 85%+ accuracy
✅ **Historical context**: Learn from past failures
✅ **Confidence scoring**: Know when to trust auto-fixes
✅ **Semantic search**: Find similar failures instantly

### Without Exolar MCP (Graceful Degradation)

⚠️ **Manual healing**: All failures require manual fixes
⚠️ **No classification**: Can't distinguish FLAKE from BUG
⚠️ **No history**: Each failure treated as new
⚠️ **No confidence**: All fixes are best-guess

**Workflow still works**, but requires more manual intervention.

---

## Future Enhancements

### Planned Features

1. **Predictive Failure Analysis**: Predict failures before execution
2. **Auto-Refactoring Suggestions**: Suggest page object improvements
3. **Performance Baselines**: Auto-detect performance regressions
4. **Custom Classification Rules**: Project-specific failure patterns

---

## API Reference

### Complete MCP Methods

```typescript
// Explore
explore_exolar_index(params: {
  category: 'datasets' | 'branches' | 'suites' | 'metrics',
  query?: string
})

// Query
query_exolar_data(params: {
  dataset: string,
  filters?: object,
  view_mode?: 'list' | 'summary' | 'detailed'
})

// Perform Actions
perform_exolar_action(params: {
  action: 'classify' | 'compare' | 'generate_report',
  params: object
})

// Get Metric Definition
get_semantic_definition(params: {
  metric_id: string
})
```

---

**Version**: 1.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
**Dashboard**: https://exolar.ai-innovation.site
