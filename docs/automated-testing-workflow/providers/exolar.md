# Exolar Provider

**Type**: AnalyticsProvider
**Status**: Stable (Default)
**MCP Server**: HTTP transport to Exolar API

---

## Overview

The Exolar provider integrates with the Exolar QA Dashboard to provide test analytics, failure classification, and auto-healing insights. Exolar tracks all test executions, enabling intelligent failure analysis and flakiness detection.

---

## Configuration

### quolar.config.ts

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  analytics: {
    provider: 'exolar',
    endpoint: 'https://exolar.ai-innovation.site/api/mcp',

    // Optional: Auto-healing threshold
    autoHealThreshold: 70,  // Min confidence % to auto-heal

    // Optional: Flakiness threshold
    flakinessThreshold: 20  // Tests above this % are flagged as flaky
  }
})
```

### Environment Variables

```bash
# .env.quolar
DASHBOARD_URL=https://exolar.ai-innovation.site
DASHBOARD_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### MCP Configuration

```json
// ~/.claude/mcp.json
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

---

## Getting Your Exolar API Key

1. Contact QA team lead
2. Request API key for Exolar dashboard
3. Receive key via secure channel (Slack DM, 1Password, etc.)
4. Add to `.env.quolar`:
   ```bash
   DASHBOARD_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## Interface Implementation

### Supported Operations

| Method | MCP Tool | Description |
|--------|----------|-------------|
| `classifyFailure()` | `perform_exolar_action(classify)` | Classify test failure |
| `reportResults()` | `perform_exolar_action(report)` | Report test results |
| `findSimilarFailures()` | `query_exolar_data(similar)` | Find similar failures |
| `getFlakiness()` | `query_exolar_data(flakiness)` | Get flakiness data |
| `getExecution()` | `query_exolar_data(execution)` | Get execution details |
| `queryExecutions()` | `query_exolar_data(executions)` | Query by branch |

### Failure Classification

```typescript
// Classify a test failure
const classification = await analyticsProvider.classifyFailure({
  testName: 'Successful login with valid credentials',
  error: 'Locator not found: button:visible',
  stackTrace: '...',
  screenshot: 'base64...',
  duration: 5000
})

// Returns:
// {
//   result: 'FLAKE',
//   confidence: 90,
//   evidence: ['intermittent failure', 'locator pattern', 'no code changes'],
//   suggestedFix: 'Add .filter().first() to locator'
// }
```

### Classification Types

| Type | Description | Auto-Heal? |
|------|-------------|------------|
| `FLAKE` | Intermittent failure, test issue | Yes (if confidence > threshold) |
| `BUG` | Genuine product bug | No (needs investigation) |
| `ENVIRONMENT` | Infrastructure/config issue | Maybe (environment fix) |
| `UNKNOWN` | Cannot determine cause | No (needs manual review) |

---

## Workflow Integration

### Step 5: Execution Loop

Exolar powers the auto-healing retry loop:

```typescript
async function executeStep5_ExecutionLoop(context: WorkflowContext) {
  const MAX_RETRIES = 3

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    // Execute tests
    const results = await context.testFrameworkProvider.execute({
      testFiles: context.testFiles,
      project: 'chrome'
    })

    // All passed? Exit loop
    if (results.failed === 0) {
      console.log('All tests passing!')
      return
    }

    // Analyze failures with Exolar
    if (context.analyticsProvider) {
      for (const failure of results.failures) {
        const classification = await context.analyticsProvider.classifyFailure(failure)

        if (classification.result === 'FLAKE' &&
            classification.confidence >= context.config.autoHealThreshold) {
          // Apply suggested fix
          await applyFix(failure, classification.suggestedFix)
        } else if (classification.result === 'BUG') {
          // Log as potential bug
          console.warn(`Potential bug detected: ${failure.testName}`)
        }
      }
    }

    // Commit fixes and retry
    await context.vcsProvider.commit(`fix: auto-heal attempt ${attempt}`, changedFiles)
  }
}
```

### Step 7: CI Validation

Exolar validates CI execution after PR creation:

```typescript
async function validateCIExecution(context: WorkflowContext) {
  // Wait for CI to start
  await sleep(120000)  // ~2 minutes for Vercel/GitHub Actions

  // Query execution from Exolar
  const executions = await context.analyticsProvider?.queryExecutions(
    context.branchName,
    1
  )

  if (executions?.[0]) {
    const execution = executions[0]

    console.log(`CI Execution: ${execution.executionId}`)
    console.log(`Status: ${execution.failed === 0 ? 'PASSED' : 'FAILED'}`)
    console.log(`Results: ${execution.passed} passed, ${execution.failed} failed`)
    console.log(`Dashboard: ${context.config.analytics.endpoint}/executions/${execution.executionId}`)
  }
}
```

---

## Auto-Healing Strategy

### Fix Patterns by Classification

```typescript
async function applyAutoHealFix(
  failure: TestFailure,
  classification: Classification
): Promise<string[]> {
  const fixes: string[] = []

  switch (classification.result) {
    case 'FLAKE':
      // Locator fixes
      if (classification.evidence.includes('locator not found')) {
        fixes.push('Add :visible filter')
        fixes.push('Add .first() or .nth(0)')
        fixes.push('Use more specific selector')
      }
      // Timeout fixes
      if (classification.evidence.includes('timeout')) {
        fixes.push('Replace hardcoded timeout with getTimeout()')
        fixes.push('Add explicit waitFor before assertion')
      }
      break

    case 'ENVIRONMENT':
      // Environment-specific fixes
      if (classification.evidence.includes('URL mismatch')) {
        fixes.push('Use environment variable for base URL')
      }
      break

    case 'BUG':
      // Don't auto-fix bugs, but log for investigation
      console.warn(`Bug detected in: ${failure.testName}`)
      console.warn(`Evidence: ${classification.evidence.join(', ')}`)
      break
  }

  return fixes
}
```

### Confidence Thresholds

| Confidence | Action |
|------------|--------|
| 90-100% | Auto-fix immediately |
| 70-89% | Auto-fix with warning |
| 50-69% | Suggest fix, don't apply |
| 0-49% | Flag for manual review |

---

## Flakiness Detection

Exolar tracks test stability over time:

```typescript
// Get flakiness data
const flakinessData = await analyticsProvider.getFlakiness(
  'authentication.spec.ts:Successful login'
)

// Returns:
// {
//   testSignature: 'authentication.spec.ts:Successful login',
//   flakinessScore: 15,  // 15% flaky
//   passRate: 85,        // 85% pass rate
//   recentResults: ['pass', 'pass', 'fail', 'pass', 'pass', ...]
// }

// Flag high-flakiness tests
if (flakinessData.flakinessScore > 20) {
  console.warn(`High flakiness: ${flakinessData.testSignature}`)
  // Consider marking as test.fixme() or investigating
}
```

---

## Similar Failure Search

Find historical context for failures:

```typescript
// Find similar failures
const similarFailures = await analyticsProvider.findSimilarFailures(
  'Locator not found: button[data-testid="submit"]'
)

// Returns:
// [
//   {
//     testName: 'checkout.spec.ts:Submit order',
//     error: 'Locator not found: button[data-testid="submit"]',
//     occurrences: 5,
//     lastSeen: Date,
//     resolution: 'Added .filter({ hasText: "Submit" })'
//   },
//   ...
// ]

// Apply historical resolution
if (similarFailures[0]?.resolution) {
  console.log(`Historical fix found: ${similarFailures[0].resolution}`)
}
```

---

## Graceful Degradation

Exolar is an **optional** provider. When unavailable:

```typescript
async function classifyFailureWithFallback(failure: TestFailure): Promise<Classification> {
  // Try Exolar first
  if (this.analyticsProvider) {
    try {
      return await this.analyticsProvider.classifyFailure(failure)
    } catch (error) {
      console.warn(`Exolar unavailable: ${error.message}`)
    }
  }

  // Fallback: Basic heuristic classification
  return this.basicClassification(failure)
}

function basicClassification(failure: TestFailure): Classification {
  const error = failure.error.toLowerCase()

  if (error.includes('timeout')) {
    return { result: 'FLAKE', confidence: 60, evidence: ['timeout pattern'] }
  }
  if (error.includes('locator')) {
    return { result: 'FLAKE', confidence: 50, evidence: ['locator issue'] }
  }

  return { result: 'UNKNOWN', confidence: 30, evidence: ['no pattern match'] }
}
```

---

## Verification

```bash
# Test Exolar connection
npx quolar test-connection --provider exolar

# Expected output:
# ✓ Exolar API connected
# ✓ Dashboard: https://exolar.ai-innovation.site
# ✓ Recent executions: 42
# ✓ Can query data: Yes
# ✓ Can classify failures: Yes
```

### Manual Dashboard Access

Visit: https://exolar.ai-innovation.site/dashboard

- View recent executions
- Browse failure history
- Check flakiness trends
- Review auto-healing results

---

## Troubleshooting

### Connection Failed

```bash
# Test API directly
curl -H "Authorization: Bearer $DASHBOARD_API_KEY" \
  https://exolar.ai-innovation.site/api/mcp/health

# Should return: {"status": "ok"}
```

### Classification Not Working

1. Check API key permissions
2. Verify execution ID exists
3. Check test name matches exactly

### No Recent Executions

- Ensure Playwright dashboard reporter is configured
- Check CI is running and reporting
- Verify branch name matches query

---

## Related Documentation

- [Architecture](../architecture.md) - Provider abstraction layer
- [Installation](../installation.md) - Setup instructions
- [Workflow Steps](../workflow-steps.md) - Step 5 details

---

**Version**: 2.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
