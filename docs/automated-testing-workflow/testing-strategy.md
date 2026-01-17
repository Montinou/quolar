# Testing Strategy - Automated Testing Workflow

**Version**: 1.0
**Last Updated**: 2026-01-17

---

## Overview

This document defines the verification and testing strategy for the Automated Testing Workflow itself - not the tests it generates, but how we ensure the workflow operates correctly.

**Testing Levels**:
1. Unit Testing - Individual components
2. Integration Testing - MCP integrations
3. End-to-End Testing - Complete workflow runs
4. Acceptance Testing - Real-world validation

---

## Unit Testing

### Components to Test

**1. Workflow Orchestrator**
```typescript
describe('WorkflowOrchestrator', () => {
  it('should execute steps sequentially', async () => {
    const orchestrator = new WorkflowOrchestrator()
    const result = await orchestrator.executeWorkflow('LIN-TEST-001')

    expect(result.stepsCompleted).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('should handle step failures gracefully', async () => {
    // Mock step 3 to fail
    const orchestrator = new WorkflowOrchestrator()

    await expect(
      orchestrator.executeWorkflow('LIN-INVALID')
    ).rejects.toThrow('Step 3 failed')
  })
})
```

**2. Ticket Analysis Parser**
```typescript
describe('TicketAnalysisParser', () => {
  it('should extract requirements from ticket', () => {
    const parser = new TicketAnalysisParser()
    const analysis = parser.parse(mockTicket)

    expect(analysis.testType).toBe('e2e-ui')
    expect(analysis.requirements).toHaveLength(4)
  })

  it('should detect test type from labels', () => {
    const parser = new TicketAnalysisParser()

    expect(parser.detectTestType(['feature', 'ui'])).toBe('e2e-ui')
    expect(parser.detectTestType(['api', 'backend'])).toBe('api')
  })
})
```

**3. Pattern Matcher**
```typescript
describe('PatternMatcher', () => {
  it('should find similar tests by keywords', async () => {
    const matcher = new PatternMatcher()
    const similar = await matcher.findSimilar('authentication')

    expect(similar).toContain('authentication/signin.spec.ts')
    expect(similar).toContain('authentication/permissions.spec.ts')
  })
})
```

---

## Integration Testing

### MCP Integration Tests

**1. Linear MCP Integration**
```typescript
describe('Linear MCP Integration', () => {
  let linearMCP: LinearMCP

  beforeEach(() => {
    linearMCP = new LinearMCP(process.env.LINEAR_TOKEN!)
  })

  it('should fetch ticket by ID', async () => {
    const ticket = await linearMCP.getIssue({ id: 'LIN-TEST-001' })

    expect(ticket.id).toBe('LIN-TEST-001')
    expect(ticket.title).toBeDefined()
  })

  it('should update ticket with PR link', async () => {
    await linearMCP.updateIssue({
      id: 'LIN-TEST-001',
      links: [{ url: 'https://github.com/test/pr/1', title: 'Test PR' }]
    })

    const updated = await linearMCP.getIssue({ id: 'LIN-TEST-001' })
    expect(updated.links).toContainEqual(
      expect.objectContaining({ url: 'https://github.com/test/pr/1' })
    )
  })
})
```

**2. Exolar MCP Integration**
```typescript
describe('Exolar MCP Integration', () => {
  let exolarMCP: ExolarMCP

  beforeEach(() => {
    exolarMCP = new ExolarMCP({
      url: process.env.DASHBOARD_URL!,
      apiKey: process.env.DASHBOARD_API_KEY!
    })
  })

  it('should query latest execution', async () => {
    const executions = await exolarMCP.queryExolarData({
      dataset: 'executions',
      filters: { branch: 'test/test-branch', limit: 1 }
    })

    expect(executions.data).toHaveLength(1)
    expect(executions.data[0].branch).toBe('test/test-branch')
  })

  it('should classify test failure', async () => {
    const classification = await exolarMCP.performExolarAction({
      action: 'classify',
      params: {
        execution_id: 12345,
        test_name: 'Login flow test'
      }
    })

    expect(classification.result).toMatch(/FLAKE|BUG|ENVIRONMENT/)
    expect(classification.confidence).toBeGreaterThan(0)
    expect(classification.confidence).toBeLessThanOrEqual(100)
  })
})
```

**3. Quoth MCP Integration** (graceful degradation)
```typescript
describe('Quoth MCP Integration', () => {
  it('should search documentation patterns', async () => {
    const quothMCP = new QuothMCP()

    try {
      const results = await quothMCP.searchIndex({
        query: 'authentication test patterns'
      })

      expect(results.chunks).toBeDefined()
    } catch (error) {
      // Graceful degradation - Quoth optional
      expect(error.message).toContain('Quoth unavailable')
    }
  })

  it('should fall back to codebase search when unavailable', async () => {
    const quothMCP = new QuothMCP()
    const fallbackSearch = new CodebaseSearch()

    let patterns
    try {
      patterns = await quothMCP.searchIndex({ query: 'auth' })
    } catch {
      patterns = await fallbackSearch.findPatterns('auth')
    }

    expect(patterns).toBeDefined()
  })
})
```

---

## End-to-End Testing

### Complete Workflow Tests

**Test 1: Happy Path - E2E UI Test Generation**
```typescript
describe('E2E Workflow: E2E UI Test Generation', () => {
  it('should generate tests for feature ticket', async () => {
    // Setup: Create test ticket
    const ticket = await createTestTicket({
      title: 'User Authentication Flow',
      labels: ['feature', 'ui', 'authentication'],
      description: 'Implement login/logout functionality'
    })

    // Execute workflow
    const result = await executeWorkflow(ticket.id)

    // Verify: All steps completed
    expect(result.stepsCompleted).toEqual([1, 2, 3, 4, 5, 6, 7])

    // Verify: Test files created
    const testFile = await read(
      'automation/playwright/tests/authentication/login-flow.spec.ts'
    )
    expect(testFile).toContain('test.describe')
    expect(testFile).toContain('PO_LoginPage')

    // Verify: Tests pass type checking
    const typeCheck = await exec('yarn check:types')
    expect(typeCheck.exitCode).toBe(0)

    // Verify: Tests execute successfully
    const testRun = await exec('npx playwright test')
    expect(testRun.exitCode).toBe(0)

    // Verify: PR created
    expect(result.prUrl).toMatch(/github.com/)

    // Verify: Linear ticket updated
    const updatedTicket = await linearMCP.getIssue({ id: ticket.id })
    expect(updatedTicket.links).toContainEqual(
      expect.objectContaining({ url: result.prUrl })
    )

    // Cleanup
    await cleanupTestArtifacts(ticket.id)
  }, 600000) // 10 minute timeout
})
```

**Test 2: Auto-Healing - Locator Fix**
```typescript
describe('E2E Workflow: Auto-Healing', () => {
  it('should auto-heal locator not found error', async () => {
    // Setup: Create ticket with intentionally broken pattern
    const ticket = await createTestTicket({
      title: 'Login Form Test',
      labels: ['feature', 'ui']
    })

    // Mock test generator to produce broken locator
    mockTestGenerator.generateWithBrokenLocator()

    // Execute workflow
    const result = await executeWorkflow(ticket.id)

    // Verify: Auto-healing was triggered
    expect(result.healingAttempts).toBeGreaterThan(0)

    // Verify: Fix was applied
    const commits = await exec('git log --grep="auto-heal" --oneline')
    expect(commits.stdout).toContain('auto-heal')

    // Verify: Tests eventually passed
    expect(result.testsAllPassing).toBe(true)

    // Cleanup
    await cleanupTestArtifacts(ticket.id)
  }, 600000)
})
```

**Test 3: API Test Generation**
```typescript
describe('E2E Workflow: API Test Generation', () => {
  it('should generate API integration tests', async () => {
    const ticket = await createTestTicket({
      title: 'Create Case GraphQL Mutation',
      labels: ['api', 'backend', 'graphql'],
      description: 'Add mutation for case creation'
    })

    const result = await executeWorkflow(ticket.id)

    // Verify: API test file created
    const testFile = await read(
      'automation/playwright/tests/api/case-creation-api.spec.ts'
    )
    expect(testFile).toContain('graphqlRequest')
    expect(testFile).not.toContain('page.goto') // No browser actions

    await cleanupTestArtifacts(ticket.id)
  }, 600000)
})
```

---

## Acceptance Testing

### Real-World Validation

**Acceptance Criteria**:

1. **Time Savings**
   - ✅ Workflow completes in < 15 minutes
   - ✅ Reduces manual effort from 4-6 hours → 15 minutes

2. **Test Quality**
   - ✅ Generated tests pass type checking (100%)
   - ✅ Generated tests follow TEST_STANDARDS.md (100%)
   - ✅ Tests execute successfully on first run (90%+)

3. **Auto-Healing Effectiveness**
   - ✅ Auto-heals common locator issues (70%+)
   - ✅ Auto-heals timeout issues (70%+)
   - ✅ Maximum 3 retry attempts enforced

4. **CI Integration**
   - ✅ CI configuration updated correctly (95%+)
   - ✅ Tests run successfully in CI (90%+)

5. **PR Quality**
   - ✅ PR description is comprehensive and accurate
   - ✅ Linear ticket linked to PR
   - ✅ CI status validated

### Manual Testing Checklist

Before releasing a new version:

- [ ] Test with E2E UI ticket (feature)
- [ ] Test with API ticket (backend)
- [ ] Test with bug fix ticket
- [ ] Test with ticket that has no similar patterns
- [ ] Test auto-healing with intentional failures
- [ ] Test CI integration (new project creation)
- [ ] Test PR creation and Linear linking
- [ ] Test graceful degradation (Quoth unavailable)
- [ ] Test graceful degradation (Exolar unavailable)
- [ ] Test error recovery (interrupted workflow)

---

## Performance Testing

### Metrics to Track

**Execution Time Breakdown**:
```
Step 1 (Ticket Analysis):    30s   (target: < 1min)
Step 2 (Pattern Search):      90s   (target: < 2min)
Step 3 (Test Planning):       120s  (target: < 3min)
Step 4 (Test Generation):     180s  (target: < 4min)
Step 5 (Execution Loop):      360s  (target: < 8min)
Step 6 (CI Integration):      60s   (target: < 2min)
Step 7 (PR Creation):         30s   (target: < 1min)
─────────────────────────────────────────────────
Total:                        870s  (14.5min, target: < 15min)
```

**Performance Tests**:
```typescript
describe('Performance Tests', () => {
  it('should complete workflow in < 15 minutes', async () => {
    const start = Date.now()
    await executeWorkflow('LIN-TEST-001')
    const duration = Date.now() - start

    expect(duration).toBeLessThan(15 * 60 * 1000) // 15 minutes
  })

  it('should cache patterns for faster subsequent runs', async () => {
    // First run (cold cache)
    const firstRun = await measureStep2Duration()

    // Second run (warm cache)
    const secondRun = await measureStep2Duration()

    expect(secondRun).toBeLessThan(firstRun * 0.7) // 30% faster
  })
})
```

---

## Regression Testing

### Test Matrix

| Ticket Type | Labels | Expected Test Type | Status |
|-------------|--------|--------------------|--------|
| Feature + UI | `feature`, `ui` | E2E UI | ✅ |
| Feature + API | `feature`, `api` | API Integration | ✅ |
| Bug + UI | `bug`, `ui` | E2E Regression | ✅ |
| Bug + API | `bug`, `api` | API Regression | ✅ |
| Mixed | `feature`, `ui`, `api` | Both E2E + API | ⏳ |

### Auto-Healing Scenarios

| Failure Type | Classification | Fix Applied | Success Rate |
|--------------|----------------|-------------|--------------|
| Locator not found | FLAKE | Add :visible | 85% |
| Strict mode | FLAKE | Add .first() | 90% |
| Timeout (5000ms) | BUG | Use getTimeout() | 80% |
| 401 Unauthorized | ENVIRONMENT | Recreate auth | 70% |

---

## Continuous Monitoring

### Metrics Dashboard

Track these metrics over time:

**Success Rates**:
- Workflow completion rate
- First-run test pass rate
- Auto-healing success rate
- CI integration success rate
- PR creation success rate

**Performance**:
- Average workflow duration
- Step-by-step timing
- MCP response times

**Quality**:
- Type checking pass rate
- Standards compliance rate
- Test flakiness rate

---

## Test Data Management

### Test Fixtures

**Test Linear Tickets**:
- Create dedicated test tickets in Linear
- Prefix with `TEST-` to distinguish from real tickets
- Clean up after tests complete

**Test Branches**:
- Use `test/automated-workflow-*` prefix
- Clean up after tests complete
- Never push to `main` during tests

**Test Users**:
- Use dedicated test accounts
- Rotate credentials regularly
- Never use production data

---

## Failure Analysis

### When Tests Fail

**1. Categorize Failure**:
- Workflow infrastructure issue
- MCP integration issue
- Test generation issue
- Auto-healing issue
- CI integration issue

**2. Collect Debug Info**:
```bash
# Workflow state
cat .workflow-state/TEST-001.json

# Error logs
cat debug-log.txt

# Git history
git log --oneline -10

# MCP logs
cat ~/.claude/logs/mcp-*.log
```

**3. Create Bug Report**:
- Include failure category
- Attach debug information
- Steps to reproduce
- Expected vs actual behavior

---

## Quality Gates

Before merging changes:

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] At least 3 end-to-end tests pass
- [ ] Manual acceptance testing complete
- [ ] Performance metrics within targets
- [ ] Documentation updated

---

**Version**: 1.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
