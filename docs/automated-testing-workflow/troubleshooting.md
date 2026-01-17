# Troubleshooting Guide - Automated Testing Workflow

**Version**: 1.0
**Last Updated**: 2026-01-17

---

## Table of Contents

1. [Common Error Messages](#common-error-messages)
2. [Step-Specific Issues](#step-specific-issues)
3. [MCP Connection Issues](#mcp-connection-issues)
4. [Test Execution Issues](#test-execution-issues)
5. [Auto-Healing Issues](#auto-healing-issues)
6. [CI Integration Issues](#ci-integration-issues)
7. [PR Creation Issues](#pr-creation-issues)
8. [Debug Mode](#debug-mode)
9. [Recovery Procedures](#recovery-procedures)

---

## Common Error Messages

### Error: "Linear ticket not found"

**Full Error**:
```
Error: Linear ticket LIN-123 not found
```

**Causes**:
1. Ticket ID is incorrect
2. Ticket is in different workspace
3. Linear API token lacks permissions
4. Ticket was deleted

**Solutions**:
```bash
# 1. Verify ticket exists in Linear
open "https://linear.app/attorney-share/issue/LIN-123"

# 2. Check workspace in .env
grep LINEAR_WORKSPACE .env
# Should match ticket workspace

# 3. Verify API token permissions
curl -H "Authorization: Bearer $LINEAR_TOKEN" \
  https://api.linear.app/graphql \
  -d '{"query": "{ viewer { name admin } }"}'

# 4. Try with full team key
/test-ticket AS-123  # Instead of LIN-123
```

---

### Error: "GitHub authentication failed"

**Full Error**:
```
Error: HTTP 401: Bad credentials (GitHub)
```

**Causes**:
1. GitHub token expired
2. GitHub token lacks required scopes
3. Token not set in environment

**Solutions**:
```bash
# 1. Check token expiration
gh auth status

# 2. Regenerate token with correct scopes
# Go to https://github.com/settings/tokens
# Create new token with: repo, workflow, write:packages

# 3. Update .env
echo "GITHUB_TOKEN=ghp_new_token_here" >> .env

# 4. Re-authenticate gh CLI
gh auth login
```

---

### Error: "Playwright test execution failed"

**Full Error**:
```
Error: Command failed: npx playwright test
Exit code: 1
```

**Causes**:
1. Playwright browsers not installed
2. Test file has syntax errors
3. Environment variables missing
4. Network connectivity issues

**Solutions**:
```bash
# 1. Install Playwright browsers
npx playwright install --with-deps chromium

# 2. Check test file syntax
yarn check:types

# 3. Verify environment variables
source .env
echo $FRONTEND_URL
echo $BACKEND_URL

# 4. Run single test to debug
npx playwright test automation/playwright/tests/authentication/login-flow.spec.ts --debug
```

---

### Error: "Type checking failed"

**Full Error**:
```
Error: TypeScript compilation failed
automation/playwright/tests/authentication/login-flow.spec.ts:15:23 - error TS2304: Cannot find name 'PO_LoginPage'.
```

**Causes**:
1. Missing import statement
2. Page object doesn't exist
3. Incorrect import path

**Solutions**:
```bash
# 1. Check page object exists
ls automation/playwright/page-objects/PO_LoginPage.ts

# 2. Verify import path
# Should be: import { PO_LoginPage } from '../../page-objects/PO_LoginPage'

# 3. Re-generate types
yarn gql-compile

# 4. Fix manually and re-run type check
yarn check:types
```

---

## Step-Specific Issues

### STEP 1: Ticket Analysis Failures

#### Issue: "Unable to parse ticket description"

**Symptoms**:
- Ticket analysis document incomplete
- Missing acceptance criteria

**Solutions**:
```bash
# 1. Check ticket has description
# In Linear: Edit ticket and add detailed description

# 2. Verify ticket has labels
# Add labels: feature, ui, api, bug, etc.

# 3. Re-run workflow
/test-ticket LIN-123
```

#### Issue: "No related PR found"

**Symptoms**:
- Warning: "No PR linked to ticket"
- Test generation uses only ticket description

**Solutions**:
```bash
# This is not an error - workflow continues without PR

# If PR exists but not linked:
# 1. Go to Linear ticket
# 2. Click "Add link"
# 3. Paste PR URL
# 4. Re-run workflow
```

---

### STEP 2: Pattern Search Failures

#### Issue: "No similar tests found"

**Symptoms**:
- Pattern library document empty or minimal
- Warning: "Falling back to generic templates"

**Solutions**:
```bash
# 1. Check tests directory exists
ls automation/playwright/tests/

# 2. Search manually
grep -r "authentication" automation/playwright/tests/

# 3. If truly no similar tests exist:
# - Workflow will use generic templates
# - First test for this feature type
# - Review generated tests carefully
```

#### Issue: "Quoth MCP unavailable"

**Symptoms**:
```
Warning: Quoth MCP not responding, using codebase patterns only
```

**Solutions**:
```bash
# This is graceful degradation - not an error

# To fix Quoth MCP:
# 1. Check Quoth server running
ps aux | grep quoth

# 2. Restart Quoth MCP
# (Instructions depend on Quoth installation)

# 3. Verify connection
# In Claude Code: "Search Quoth for test patterns"
```

---

### STEP 3: Test Planning Failures

#### Issue: "Test planner agent failed"

**Symptoms**:
```
Error: test-planner agent exited with error
```

**Solutions**:
```bash
# 1. Check agent logs
cat .workflow-state/LIN-123-agent-logs.txt

# 2. Common causes:
# - Insufficient context (ticket description too vague)
# - Pattern library empty
# - No test type determined

# 3. Fix:
# - Add more detail to Linear ticket
# - Manually specify test type in ticket labels
# - Re-run workflow
```

#### Issue: "Cannot determine execution mode"

**Symptoms**:
- Test plan shows "Execution mode: Unknown"

**Solutions**:
```bash
# Default to parallel execution

# To force serial:
# Add to playwright.config.ts:
{
  name: 'chrome-feature-name',
  testMatch: '**/feature-name/**/*.spec.ts',
  workers: 1,
  fullyParallel: false
}
```

---

### STEP 4: Test Generation Failures

#### Issue: "Git branch creation failed"

**Symptoms**:
```
Error: Branch 'test/LIN-123-automated-tests' already exists
```

**Solutions**:
```bash
# 1. Delete existing branch
git branch -D test/LIN-123-automated-tests

# 2. Or use existing branch
git checkout test/LIN-123-automated-tests

# 3. Re-run workflow (will detect existing branch)
```

#### Issue: "Test writer agent produced invalid code"

**Symptoms**:
- Type checking fails
- Linting errors
- Syntax errors

**Solutions**:
```bash
# 1. Review generated test
code automation/playwright/tests/authentication/login-flow.spec.ts

# 2. Common issues:
# - Missing imports (add manually)
# - Incorrect locator syntax (fix pattern)
# - Hardcoded values (replace with constants)

# 3. Fix manually
# Edit test file

# 4. Verify
yarn check:types
yarn lint

# 5. Commit fix
git add .
git commit -m "fix: manual corrections to generated tests"
```

---

### STEP 5: Execution Loop Failures

#### Issue: "All retry attempts exhausted"

**Symptoms**:
```
Error: Maximum retry attempts (3) exceeded
Tests marked as test.fixme()
```

**Solutions**:
```bash
# 1. Review failures
cat automation/test-results/playwright-results.json

# 2. Check Exolar dashboard
open https://exolar.ai-innovation.site/dashboard

# 3. Common unfixable issues:
# - Page object doesn't match UI
# - Test data conflicts
# - Environment differences

# 4. Manual fixes required:
# - Update page objects
# - Create unique test data
# - Fix environment configuration

# 5. Remove test.fixme() annotations
grep -r "test.fixme" automation/playwright/tests/
# Edit files and change test.fixme() → test()

# 6. Re-run tests
npx playwright test
```

#### Issue: "Exolar MCP classification failed"

**Symptoms**:
```
Warning: Exolar classification unavailable
Proceeding without auto-healing
```

**Solutions**:
```bash
# 1. Check Exolar dashboard accessible
curl $DASHBOARD_URL/health

# 2. Verify API key
curl -H "Authorization: Bearer $DASHBOARD_API_KEY" \
  $DASHBOARD_URL/api/mcp/health

# 3. Check execution was sent to dashboard
# Look for dashboard reporter output in test logs

# 4. If unavailable:
# - Workflow continues without auto-healing
# - Manual debugging required
# - Review test failure logs manually
```

---

### STEP 6: CI Integration Failures

#### Issue: "CI workflow update failed"

**Symptoms**:
```
Error: Cannot parse .github/workflows/ci.yml
```

**Solutions**:
```bash
# 1. Check YAML syntax
yamllint .github/workflows/ci.yml

# 2. Common issues:
# - Invalid indentation
# - Missing quotes
# - Duplicate keys

# 3. Fix manually
code .github/workflows/ci.yml

# 4. Validate
yamllint .github/workflows/ci.yml

# 5. Commit
git add .github/workflows/ci.yml
git commit -m "fix: correct CI workflow syntax"
```

#### Issue: "Playwright config merge conflict"

**Symptoms**:
```
Error: Conflicting Playwright project configuration
```

**Solutions**:
```bash
# 1. Review current config
code playwright.config.ts

# 2. Check for conflicts
# - Duplicate project names
# - Overlapping testMatch patterns

# 3. Manually merge
# Edit playwright.config.ts

# 4. Test config
npx playwright test --list

# 5. Commit
git add playwright.config.ts
git commit -m "fix: merge Playwright config"
```

---

### STEP 7: PR Creation Failures

#### Issue: "PR creation failed"

**Symptoms**:
```
Error: gh pr create failed
Exit code: 1
```

**Solutions**:
```bash
# 1. Check GitHub CLI authentication
gh auth status

# 2. Verify branch pushed
git remote -v
git branch -r | grep test/LIN-123

# 3. Create PR manually
gh pr create \
  --title "test: automated tests for LIN-123" \
  --body-file pr-description.md \
  --label automated-tests

# 4. Update Linear ticket
# Add PR link manually in Linear
```

#### Issue: "CI validation timeout"

**Symptoms**:
```
Warning: CI not started after 2 minutes
Manual verification required
```

**Solutions**:
```bash
# 1. Check GitHub Actions tab
open "https://github.com/attorneyshare/mvp/actions"

# 2. Common causes:
# - GitHub Actions delayed
# - Workflow file has errors
# - Repository settings prevent auto-run

# 3. Trigger manually
gh workflow run playwright-tests.yml

# 4. Monitor
gh run watch
```

---

## MCP Connection Issues

### Linear MCP Not Responding

**Symptoms**:
```
Error: MCP server 'linear' not responding
```

**Solutions**:
```bash
# 1. Check MCP configuration
cat ~/.claude/mcp.json

# 2. Verify Linear token
echo $LINEAR_TOKEN

# 3. Test Linear API directly
curl -H "Authorization: Bearer $LINEAR_TOKEN" \
  https://api.linear.app/graphql \
  -d '{"query": "{ viewer { name } }"}'

# 4. Restart Claude Code
claude-code restart

# 5. Check Claude Code logs
tail -f ~/.claude/logs/mcp-linear.log
```

### Exolar MCP Connection Refused

**Symptoms**:
```
Error: Connection refused to Exolar dashboard
```

**Solutions**:
```bash
# 1. Ping dashboard
curl $DASHBOARD_URL/health

# 2. Check firewall
# Ensure port 443 (HTTPS) not blocked

# 3. Verify API key format
echo $DASHBOARD_API_KEY
# Should not have quotes or spaces

# 4. Test MCP endpoint
curl -H "Authorization: Bearer $DASHBOARD_API_KEY" \
  $DASHBOARD_URL/api/mcp/health

# 5. If local dashboard:
# Start dashboard server
docker-compose up -d exolar-dashboard
```

---

## Test Execution Issues

### Locator Not Found Errors

**Symptoms**:
```
Error: Locator not found: button:visible
```

**Causes**:
1. UI changed since pattern was created
2. Element not rendered
3. Wrong selector

**Solutions**:
```bash
# 1. Debug with Playwright Inspector
npx playwright test --debug

# 2. Update page object
code automation/playwright/page-objects/PO_LoginPage.ts

# 3. Use more specific locator
# Before: button:visible
# After: button:visible.filter({ hasText: 'Login' }).first()

# 4. Add smart wait
await page.waitForSelector('button:visible', { state: 'visible' })
```

### Timeout Errors

**Symptoms**:
```
TimeoutError: page.waitForSelector: Timeout 5000ms exceeded
```

**Solutions**:
```bash
# 1. Replace hardcoded timeout
# Before: page.waitForSelector('div', { timeout: 5000 })
# After: page.waitForSelector('div', { timeout: getTimeout('navigation') })

# 2. Check environment
# Staging may be slower than local

# 3. Increase timeout in timeout-manager.ts
# For CI environment only
```

---

## Auto-Healing Issues

### Auto-Healing Not Triggered

**Symptoms**:
- Test fails but no healing attempted
- No "Spawning test-healer agent" message

**Causes**:
1. Exolar MCP unavailable
2. Failure not classifiable
3. Max retries already reached

**Solutions**:
```bash
# 1. Check Exolar MCP connection
# (See MCP Connection Issues section)

# 2. Review failure details
# Some errors not auto-fixable:
# - Environment issues
# - Test data problems
# - Page object completely wrong

# 3. Manual intervention required
# Fix the root cause manually
```

### Auto-Healing Applied Wrong Fix

**Symptoms**:
- Test still fails after healing
- Wrong fix applied

**Causes**:
1. Misclassification by Exolar
2. Complex failure pattern
3. Multiple issues in same test

**Solutions**:
```bash
# 1. Review healing history
git log --grep="auto-heal" --oneline

# 2. Revert bad fix
git revert HEAD~1

# 3. Apply correct fix manually
# Based on actual error message

# 4. Report to QA team
# Helps improve auto-healing patterns
```

---

## CI Integration Issues

### CI Tests Pass Locally But Fail in CI

**Common Causes & Solutions**:

| Cause | Detection | Solution |
|-------|-----------|----------|
| Different Node version | Check `.nvmrc` | Add `node-version: 22` to workflow |
| Missing env vars | Check CI logs | Add to workflow `env:` section |
| Timing issues | Intermittent failures | Increase timeouts for CI |
| Parallel conflicts | Serial tests running parallel | Set `workers: 1` for project |
| Browser differences | Screenshots differ | Use consistent browser version |

**Debug Steps**:
```bash
# 1. Reproduce CI environment locally
docker run -it node:22 bash
npm install
npx playwright test

# 2. Check CI logs
gh run view --log

# 3. Download CI artifacts
gh run download <run-id>

# 4. Compare screenshots
code test-results/*/videos/
```

---

## PR Creation Issues

### PR Description Too Long

**Symptoms**:
```
Error: PR description exceeds GitHub limit (65536 characters)
```

**Solutions**:
```bash
# 1. Edit PR description template
code .claude/skills/test-ticket/templates/pr-description.md.template

# 2. Reduce detail:
# - Shorten test scenario descriptions
# - Remove verbose logs
# - Link to external docs

# 3. Recreate PR
gh pr create --body-file pr-description-short.md
```

### Linear Ticket Not Updated

**Symptoms**:
- PR created but Linear ticket has no link

**Solutions**:
```bash
# 1. Check Linear MCP connection
# (See MCP Connection Issues)

# 2. Update manually via Linear UI
# Or via API:
curl -X POST https://api.linear.app/graphql \
  -H "Authorization: Bearer $LINEAR_TOKEN" \
  -d '{
    "query": "mutation { issueUpdate(id: \"LIN-123\", input: { links: [{ url: \"PR_URL\", title: \"Test PR\" }] }) { success } }"
  }'
```

---

## Debug Mode

### Enabling Full Debug Output

```bash
# .env
DEBUG=true
VERBOSE_LOGGING=true
NODE_DEBUG=*

# Run workflow
/test-ticket LIN-123 2>&1 | tee debug-log.txt
```

**Debug Output Includes**:
- All MCP requests/responses
- Agent spawn parameters
- File operations
- Git commands
- API calls
- Error stack traces

### Analyzing Debug Logs

```bash
# Search for errors
grep -i "error" debug-log.txt

# Find slow operations
grep "Duration:" debug-log.txt | sort -k2 -n

# Check MCP calls
grep "MCP:" debug-log.txt

# Review agent activity
grep "Agent:" debug-log.txt
```

---

## Recovery Procedures

### Recover from Partial Workflow

```bash
# Scenario: Workflow stopped at Step 4

# 1. Check current state
git status
git log --oneline -5

# 2. Review generated artifacts
ls docs/test-analysis/
ls docs/test-plans/
ls automation/playwright/tests/

# 3. Continue manually from failed step
# Read workflow-steps.md for step details

# 4. Or re-run entire workflow
git checkout main
git branch -D test/LIN-123-automated-tests
/test-ticket LIN-123
```

### Clean Up Failed Workflow

```bash
# Remove all workflow artifacts
rm -rf docs/test-analysis/LIN-123*
rm -rf docs/test-plans/LIN-123*
rm -rf .workflow-state/LIN-123*

# Delete test branch
git checkout main
git branch -D test/LIN-123-automated-tests

# Clean remote (if pushed)
git push origin --delete test/LIN-123-automated-tests

# Clean test files (if generated)
rm -rf automation/playwright/tests/authentication/login-flow.spec.ts

# Reset to clean state
git reset --hard HEAD
```

---

## Getting Help

If you can't resolve the issue:

### Collect Debug Information

```bash
# 1. Workflow state
cat .workflow-state/LIN-123.json

# 2. Error logs
cat debug-log.txt

# 3. Git status
git status
git log --oneline -10

# 4. Environment
env | grep -E "GITHUB|LINEAR|DASHBOARD"

# 5. System info
node --version
yarn --version
npx playwright --version
```

### Contact Support

**GitHub Issue**:
- Create issue with debug info
- Link to Linear ticket
- Include error logs

**Slack**:
- Post in #qa-automation
- Tag @qa-team

**Email**:
- qa-team@attorneyshare.com
- Include all debug information

---

**Version**: 1.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
