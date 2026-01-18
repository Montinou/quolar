# Quolar Complete Analysis & Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Architecture Deep Dive](#3-architecture-deep-dive)
4. [Plugin Mode: How It Works](#4-plugin-mode-how-it-works)
5. [Quoth Integration Details](#5-quoth-integration-details)
6. [Exolar Integration Details](#6-exolar-integration-details)
7. [Playwright Integration Details](#7-playwright-integration-details)
8. [The 7-Step Workflow](#8-the-7-step-workflow)
9. [Configuration System](#9-configuration-system)
10. [Self-Healing Mechanism](#10-self-healing-mechanism)
11. [MCP Dependencies](#11-mcp-dependencies)
12. [TypeScript Packages (Future API)](#12-typescript-packages-future-api)
13. [Gap Analysis](#13-gap-analysis)
14. [Installation Guide](#14-installation-guide)

---

## 1. Project Overview

### What is Quolar?

Quolar is an **AI-powered test automation framework** that converts Linear tickets into self-healing Playwright E2E tests. It operates as a **Claude Code plugin** where Claude reads markdown skill files and orchestrates the entire workflow.

### Key Capabilities

- **Ticket Analysis**: Reads Linear tickets, extracts acceptance criteria
- **Pattern Search**: Consults Quoth documentation for existing test patterns
- **Test Generation**: Creates Playwright test files following best practices
- **Auto-Healing**: Fixes failing tests automatically (up to 3 attempts)
- **CI Integration**: Updates GitHub Actions workflow
- **PR Creation**: Creates pull request linked to Linear ticket
- **Documentation Updates**: Proposes new patterns to Quoth

### Technology Stack

| Component | Technology |
|-----------|------------|
| Plugin Framework | Claude Code Skills (markdown-based) |
| Test Framework | Playwright |
| Ticket System | Linear |
| Documentation | Quoth MCP |
| Analytics | Exolar MCP (optional) |
| VCS | GitHub |
| CI/CD | GitHub Actions |

---

## 2. Repository Structure

```
/Quolar/
├── .claude-plugin/
│   └── plugin.json              # Claude Code plugin manifest
├── docs/
│   ├── QUOLAR-COMPLETE-ANALYSIS.md  # This file
│   └── automated-testing-workflow/
│       ├── README.md
│       ├── architecture.md
│       ├── installation.md
│       ├── usage-guide.md
│       ├── workflow-steps.md
│       ├── agent-specifications.md
│       ├── template-specifications.md
│       ├── configuration-reference.md
│       ├── testing-strategy.md
│       ├── troubleshooting.md
│       ├── providers/
│       │   ├── linear.md
│       │   ├── quoth.md
│       │   └── exolar.md
│       └── integration/
│           └── exolar-mcp.md
├── examples/
│   ├── quolar.config.ts         # Full config example
│   ├── quolar.config.minimal.ts # Minimal config
│   └── quolar.config.jira.ts    # Jira alternative
├── packages/
│   ├── core/                    # Core orchestrator (future API)
│   ├── skill/                   # Skill implementation (future API)
│   └── providers/
│       ├── linear/              # Linear adapter
│       ├── github/              # GitHub adapter
│       ├── playwright/          # Playwright adapter
│       ├── quoth/               # Quoth adapter
│       └── exolar/              # Exolar adapter
├── skills/
│   ├── test-ticket/
│   │   ├── SKILL.md             # Main skill definition
│   │   ├── reference.md         # Configuration reference
│   │   ├── troubleshooting.md   # Common issues
│   │   ├── scripts/
│   │   │   └── check-mcp.sh     # MCP validation script
│   │   └── steps/
│   │       ├── 01-ticket-analysis.md
│   │       ├── 02-pattern-search.md
│   │       ├── 03-test-planning.md
│   │       ├── 04-test-generation.md
│   │       ├── 05-execution-loop.md
│   │       ├── 06-ci-integration.md
│   │       └── 07-pr-creation.md
│   └── quolar-setup/
│       └── SKILL.md             # Setup wizard skill
├── templates/
│   └── playwright/
│       └── e2e-test.ts.hbs      # Handlebars test template
├── CLAUDE.md                    # Claude instructions
├── README.md                    # Project documentation
├── marketplace.json             # Marketplace listing
├── package.json                 # Root package (private)
├── pnpm-workspace.yaml          # Monorepo config
├── tsconfig.json                # TypeScript config
├── tsconfig.build.json          # Build config
└── vitest.config.ts             # Test config
```

### Key Directories Explained

#### `/skills/` - The Actual Plugin
This is where the Claude Code plugin lives. Claude reads these markdown files to understand what to do.

- `test-ticket/SKILL.md` - Main skill definition with workflow overview
- `test-ticket/steps/*.md` - Detailed instructions for each workflow step
- `quolar-setup/SKILL.md` - Configuration wizard

#### `/packages/` - Future Programmatic API
TypeScript packages for a future npm-installable API. **NOT used in plugin mode**.

- `core/` - Workflow orchestrator, interfaces, configuration
- `providers/*/` - Adapters for Linear, GitHub, Playwright, Quoth, Exolar
- `skill/` - Command implementations

#### `/docs/` - Extended Documentation
Detailed documentation for architecture, providers, and integration patterns.

#### `/templates/` - Test Templates
Handlebars templates used as reference for test generation patterns.

---

## 3. Architecture Deep Dive

### Two Operating Modes

Quolar is designed to work in two modes:

#### Mode 1: Claude Code Plugin (CURRENT)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Claude Code Runtime                          │
├─────────────────────────────────────────────────────────────────┤
│  User: /test-ticket ENG-123                                     │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────┐                                        │
│  │ Read SKILL.md       │ ◄── Claude reads markdown              │
│  └─────────────────────┘                                        │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────┐     ┌──────────────────────────────┐   │
│  │ Follow workflow     │────►│ Call MCP tools directly:     │   │
│  │ instructions        │     │ - linear_read_issue          │   │
│  └─────────────────────┘     │ - quoth_search_index         │   │
│           │                  │ - Bash: npx playwright test  │   │
│           ▼                  │ - Write/Edit: test files     │   │
│  ┌─────────────────────┐     │ - Bash: git, gh commands     │   │
│  │ Generate output     │     └──────────────────────────────┘   │
│  └─────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Claude interprets markdown instructions
- Claude calls MCP tools and Bash directly
- No TypeScript code executes at runtime
- All orchestration is in Claude's reasoning

#### Mode 2: npm Package (FUTURE)

```
┌─────────────────────────────────────────────────────────────────┐
│                    User's Node.js Application                   │
├─────────────────────────────────────────────────────────────────┤
│  import { WorkflowOrchestrator } from '@quolar/core'            │
│  import { QuothAdapter } from '@quolar/provider-quoth'          │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────┐     ┌──────────────────────────────┐   │
│  │ WorkflowOrchestrator│────►│ Adapter Instances:           │   │
│  │ .run('ENG-123')     │     │ - LinearAdapter              │   │
│  └─────────────────────┘     │ - QuothAdapter               │   │
│           │                  │ - ExolarAdapter              │   │
│           │                  │ - PlaywrightAdapter          │   │
│           │                  └──────────────────────────────┘   │
│           │                             │                       │
│           │                             ▼                       │
│           │                  ┌──────────────────────────────┐   │
│           │                  │ MCP Client (MISSING)         │   │
│           │                  │ - Needs factory function     │   │
│           │                  │ - Needs auth handling        │   │
│           │                  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- TypeScript orchestrator controls workflow
- Adapters wrap MCP tool calls
- Requires MCP client factory (NOT IMPLEMENTED)
- Packages not published to npm

### Provider Interface Architecture

The TypeScript packages define clean interfaces for extensibility:

```typescript
// packages/core/src/interfaces/

// Ticket management (Linear, Jira, GitHub Issues)
interface TicketProvider {
  read(ticketId: string): Promise<Ticket>
  update(ticketId: string, data: TicketUpdate): Promise<void>
  linkPR(ticketId: string, prUrl: string): Promise<void>
  addComment(ticketId: string, comment: string): Promise<void>
}

// Documentation (Quoth)
interface DocsProvider {
  searchPatterns(query: string): Promise<Pattern[]>
  readDocument(docId: string): Promise<Document>
  proposeUpdate(docId: string, content: string): Promise<void>
}

// Analytics (Exolar, DataDog)
interface AnalyticsProvider {
  classifyFailure(failure: TestFailure): Promise<Classification>
  reportResults(results: TestResults): Promise<void>
  findSimilarFailures(error: string): Promise<SimilarFailure[]>
  getFlakiness(testSignature: string): Promise<FlakinessMetrics>
}

// Version Control (GitHub, GitLab)
interface VCSProvider {
  createBranch(name: string): Promise<void>
  push(branch: string): Promise<void>
  createPR(config: PRConfig): Promise<PR>
}

// Test Framework (Playwright, Cypress, Vitest)
interface TestFrameworkProvider {
  detect(): Promise<FrameworkConfig>
  generateTest(plan: TestPlan): Promise<string>
  execute(config: ExecutionConfig): Promise<TestResults>
  heal(failure: TestFailure): Promise<HealResult>
}
```

---

## 4. Plugin Mode: How It Works

### Skill Registration

The plugin is registered via `.claude-plugin/plugin.json`:

```json
{
  "name": "quolar",
  "version": "0.1.0",
  "description": "AI-Powered Test Automation - Convert Linear tickets into self-healing Playwright E2E tests",
  "author": "Montinou",
  "repository": "https://github.com/Montinou/quolar",
  "license": "MIT",
  "skills": [
    "skills/test-ticket",
    "skills/quolar-setup"
  ],
  "mcpDependencies": {
    "required": ["linear"],
    "optional": ["quoth", "exolar"]
  },
  "keywords": ["testing", "automation", "playwright", "linear", "e2e", "self-healing"]
}
```

### Skill Invocation

When user types `/test-ticket ENG-123`:

1. Claude Code loads `skills/test-ticket/SKILL.md`
2. Claude reads the frontmatter:
   ```yaml
   ---
   name: test-ticket
   description: Generate Playwright E2E tests from Linear tickets...
   allowed-tools: Read, Grep, Glob, Write, Edit, Bash(git:*), Bash(npx:*), Bash(yarn:*), Bash(gh:*)
   user-invocable: true
   ---
   ```
3. Claude follows the workflow instructions in the markdown
4. Claude uses allowed tools to complete each step

### Allowed Tools

The skill defines what Claude can use:

| Tool | Pattern | Usage |
|------|---------|-------|
| Read | Any file | Read tickets, code, docs |
| Grep | Any pattern | Search codebase |
| Glob | Any pattern | Find files |
| Write | Any file | Create test files |
| Edit | Any file | Modify existing files |
| Bash | `git:*` | Git operations |
| Bash | `npx:*` | Run Playwright, tools |
| Bash | `yarn:*` | Package management |
| Bash | `gh:*` | GitHub CLI |

### Workflow Step Files

Each step has detailed instructions in `skills/test-ticket/steps/`:

```
01-ticket-analysis.md   - How to read and analyze Linear ticket
02-pattern-search.md    - How to search Quoth for patterns
03-test-planning.md     - How to create test scenarios
04-test-generation.md   - How to write Playwright test code
05-execution-loop.md    - How to run tests and auto-heal
06-ci-integration.md    - How to update CI configuration
07-pr-creation.md       - How to create PR and update docs
```

---

## 5. Quoth Integration Details

### Purpose

Quoth is the documentation system that stores test patterns. Per project rules, Quoth MUST be consulted:
- **Before** generating test code (search for existing patterns)
- **After** generating tests (propose new patterns)

### MCP Tools Used

| Tool | Purpose | When Called |
|------|---------|-------------|
| `quoth_search_index` | Search for existing test patterns | Step 2 |
| `quoth_read_doc` | Read full documentation | Step 2 |
| `quoth_propose_update` | Suggest new patterns | Step 7 |

### Step 2: Pattern Search

From `skills/test-ticket/steps/02-pattern-search.md`:

```markdown
## Quoth Pattern Search

### Required: Search Documentation First

Before generating ANY test code, you MUST search Quoth for existing patterns:

1. **Search for feature-specific patterns**:
   ```
   Tool: quoth_search_index
   Query: "playwright test {feature_area} patterns"
   ```

2. **Search for interaction patterns**:
   ```
   Tool: quoth_search_index
   Query: "playwright {action_type} best practices"
   ```
   Where action_type is: navigation, form filling, assertions, etc.

3. **Read relevant documents**:
   ```
   Tool: quoth_read_doc
   Doc ID: {doc_id_from_search}
   ```

### Pattern Categories to Search

| Ticket Type | Search Queries |
|-------------|----------------|
| Login/Auth | "authentication test patterns", "login flow testing" |
| Forms | "form validation testing", "input handling patterns" |
| Navigation | "page navigation testing", "routing test patterns" |
| API | "API testing playwright", "network mocking patterns" |

### Error Handling

If Quoth is unavailable:
- Log warning: "Quoth MCP not connected - patterns may be inconsistent"
- Continue with codebase grep as fallback
- Note in PR description that Quoth was not consulted
```

### Step 7: Documentation Update

From `skills/test-ticket/steps/07-pr-creation.md`:

```markdown
## Evaluate Documentation Needs

After tests pass, evaluate if new patterns should be documented:

### Decision Criteria

| Condition | Action |
|-----------|--------|
| Used existing Quoth pattern | No update needed |
| Created reusable pattern | Propose update |
| Found better approach | Propose update |
| Pattern not in Quoth | Propose addition |

### Propose Update

If new pattern discovered:

1. **Search existing docs** to avoid duplicates:
   ```
   Tool: quoth_search_index
   Query: "{pattern_description}"
   ```

2. **Propose update**:
   ```
   Tool: quoth_propose_update
   Doc ID: "patterns/playwright-testing.md"
   Content: |
     ## {Pattern Name}

     ### When to Use
     {scenarios}

     ### Example
     ```typescript
     {code_example}
     ```

     ### Notes
     {additional_context}
   Reasoning: "Discovered during {ticket_id} implementation"
   Evidence: "{code_snippet_or_commit}"
   ```
```

### TypeScript Adapter (Future API)

Location: `packages/providers/quoth/src/adapter.ts`

```typescript
import type { DocsProvider, Pattern, Document } from '@quolar/core/interfaces'

interface QuothMCPClient {
  call<T>(method: string, params: Record<string, unknown>): Promise<T>
}

export class QuothAdapter implements DocsProvider {
  constructor(private mcpClient: QuothMCPClient) {}

  async searchPatterns(query: string): Promise<Pattern[]> {
    const result = await this.mcpClient.call<{chunks: Array<{id: string, content: string, similarity: number}>}>(
      'quoth_search_index',
      { query }
    )
    return result.chunks.map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      relevance: chunk.similarity
    }))
  }

  async readDocument(docId: string): Promise<Document> {
    const result = await this.mcpClient.call<{content: string, metadata: Record<string, unknown>}>(
      'quoth_read_doc',
      { doc_id: docId }
    )
    return {
      id: docId,
      content: result.content,
      metadata: result.metadata
    }
  }

  async proposeUpdate(docId: string, content: string, reasoning: string, evidence: string): Promise<void> {
    await this.mcpClient.call(
      'quoth_propose_update',
      {
        doc_id: docId,
        new_content: content,
        reasoning,
        evidence_snippet: evidence
      }
    )
  }
}
```

---

## 6. Exolar Integration Details

### Purpose

Exolar provides test analytics and failure classification. It's **optional** - the workflow continues without it, but benefits from:
- Failure classification (FLAKE vs BUG vs ENVIRONMENT)
- Historical failure patterns
- Flakiness metrics

### MCP Tools Used

| Tool | Purpose | When Called |
|------|---------|-------------|
| `query_exolar_data` | Get test metrics, history | Step 5 |
| `perform_exolar_action` | Classify failures, report results | Step 5 |

### Step 5: Failure Analysis

From `skills/test-ticket/steps/05-execution-loop.md`:

```markdown
## Auto-Healing with Exolar

### Failure Classification (if Exolar available)

When a test fails, classify the failure:

1. **Call Exolar classification**:
   ```
   Tool: perform_exolar_action
   Action: classify
   Params: {
     test_name: "{test_name}",
     error_message: "{error}",
     stack_trace: "{stack}"
   }
   ```

2. **Interpret classification**:

   | Classification | Confidence | Action |
   |----------------|------------|--------|
   | FLAKE | >70% | Retry without changes |
   | BUG | >70% | Report as potential code issue |
   | ENVIRONMENT | >70% | Check setup, retry |
   | UNKNOWN | <70% | Apply selector healing |

3. **Find similar failures**:
   ```
   Tool: query_exolar_data
   Query: "similar_failures"
   Params: { error_signature: "{error_hash}" }
   ```

### Without Exolar

If Exolar is not connected:
- Apply rule-based healing (see healing rules below)
- Log: "Exolar unavailable - using rule-based classification"
- Continue workflow normally
```

### TypeScript Adapter (Future API)

Location: `packages/providers/exolar/src/adapter.ts`

```typescript
import type { AnalyticsProvider, TestFailure, Classification, TestResults } from '@quolar/core/interfaces'

interface ExolarMCPClient {
  call<T>(method: string, params: Record<string, unknown>): Promise<T>
}

type FailureType = 'FLAKE' | 'BUG' | 'ENVIRONMENT' | 'UNKNOWN'

export class ExolarAdapter implements AnalyticsProvider {
  constructor(private mcpClient: ExolarMCPClient) {}

  async classifyFailure(failure: TestFailure): Promise<Classification> {
    const result = await this.mcpClient.call<{
      classification: FailureType
      confidence: number
      reasoning: string
    }>('perform_exolar_action', {
      action: 'classify',
      test_name: failure.testName,
      error_message: failure.error,
      stack_trace: failure.stack
    })

    return {
      type: result.classification,
      confidence: result.confidence,
      reasoning: result.reasoning
    }
  }

  async reportResults(results: TestResults): Promise<void> {
    await this.mcpClient.call('perform_exolar_action', {
      action: 'report',
      test_run_id: results.runId,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      duration: results.duration
    })
  }

  async findSimilarFailures(error: string): Promise<Array<{testName: string, count: number, lastSeen: Date}>> {
    const result = await this.mcpClient.call<{failures: Array<{test_name: string, count: number, last_seen: string}>}>(
      'query_exolar_data',
      {
        query: 'similar_failures',
        error_signature: this.hashError(error)
      }
    )

    return result.failures.map(f => ({
      testName: f.test_name,
      count: f.count,
      lastSeen: new Date(f.last_seen)
    }))
  }

  async getFlakiness(testSignature: string): Promise<{flakinessScore: number, recentFailures: number}> {
    const result = await this.mcpClient.call<{flakiness_score: number, recent_failures: number}>(
      'query_exolar_data',
      {
        query: 'flakiness',
        test_signature: testSignature
      }
    )

    return {
      flakinessScore: result.flakiness_score,
      recentFailures: result.recent_failures
    }
  }

  private hashError(error: string): string {
    // Simple hash for error grouping
    return error.replace(/\d+/g, 'N').replace(/['"]/g, '').substring(0, 100)
  }
}
```

---

## 7. Playwright Integration Details

### Purpose

Playwright is the test framework. Quolar:
- Detects existing Playwright configuration
- Generates test files following project patterns
- Executes tests and parses results
- Auto-heals failing tests

### Configuration Detection

Claude looks for these files to understand Playwright setup:

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Main configuration |
| `playwright.config.js` | Alternative JS config |
| `playwright.config.mjs` | ES module config |

### Test Generation

From `skills/test-ticket/steps/04-test-generation.md`:

```markdown
## Generate Playwright Test Files

### Test Structure

Generate tests following this pattern:

```typescript
import { test, expect } from '@playwright/test'

/**
 * {Test Description}
 * Generated from ticket: {ticket_id}
 * Acceptance criteria: {criteria_summary}
 */
test.describe('{Feature Name}', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: navigate to starting point
    await page.goto('{base_url}')
  })

  test('{scenario_name}', async ({ page }) => {
    // Step 1: {action_description}
    await page.locator('{selector}').click()

    // Step 2: {action_description}
    await page.locator('{selector}').fill('{value}')

    // Assertion
    await expect(page.locator('{selector}')).toBeVisible()
  })
})
```

### Selector Strategy

Use selectors in this priority order:

1. **data-testid** (most stable)
   ```typescript
   page.locator('[data-testid="submit-button"]')
   ```

2. **Role + Name** (accessible)
   ```typescript
   page.getByRole('button', { name: 'Submit' })
   ```

3. **Text content** (readable)
   ```typescript
   page.getByText('Click here')
   ```

4. **CSS selectors** (last resort)
   ```typescript
   page.locator('.btn-primary')
   ```

### File Placement

| Ticket Labels | Test Type | Location |
|---------------|-----------|----------|
| `feature`, `ui` | E2E UI | `automation/playwright/tests/{feature}/` |
| `bug`, `ui` | Regression | `automation/playwright/tests/{feature}/` |
| `api`, `backend` | API | `automation/playwright/tests/{feature}-api/` |
```

### Test Execution

From `skills/test-ticket/steps/05-execution-loop.md`:

```markdown
## Execute Tests

### Run Command

```bash
npx playwright test {test_file} --reporter=json --output=test-results.json
```

### Configuration Options

| Option | Purpose | Value |
|--------|---------|-------|
| `--reporter=json` | Machine-readable output | Required for parsing |
| `--workers=1` | Serial execution | For auth-dependent tests |
| `--headed` | Show browser | For debugging |
| `--project=chromium` | Specific browser | When needed |

### Parse Results

After execution, read `test-results.json` to understand:
- Which tests passed
- Which tests failed
- Error messages and stack traces
- Duration and timing
```

### TypeScript Adapter (Future API)

Location: `packages/providers/playwright/src/adapter.ts`

```typescript
import type { TestFrameworkProvider, TestPlan, TestResults, TestFailure, HealResult } from '@quolar/core/interfaces'

interface ShellInterface {
  exec(command: string): Promise<{stdout: string, stderr: string, exitCode: number}>
}

interface FSInterface {
  read(path: string): Promise<string>
  write(path: string, content: string): Promise<void>
}

export class PlaywrightAdapter implements TestFrameworkProvider {
  constructor(
    private shell: ShellInterface,
    private fs: FSInterface
  ) {}

  async detect(): Promise<{configPath: string, testDir: string} | null> {
    const configPaths = [
      'playwright.config.ts',
      'playwright.config.js',
      'playwright.config.mjs'
    ]

    for (const configPath of configPaths) {
      try {
        await this.fs.read(configPath)
        return { configPath, testDir: './tests' }
      } catch {
        continue
      }
    }
    return null
  }

  async generateTest(plan: TestPlan): Promise<string> {
    // Generate test from plan using template
    return `
import { test, expect } from '@playwright/test'

test.describe('${plan.name}', () => {
  ${plan.scenarios.map(s => `
  test('${s.name}', async ({ page }) => {
    ${s.steps.map(step => this.stepToCode(step)).join('\n    ')}
  })
  `).join('\n')}
})
`
  }

  async execute(config: {testFile: string, headed?: boolean}): Promise<TestResults> {
    const command = `npx playwright test ${config.testFile} --reporter=json`
    const result = await this.shell.exec(command)

    // Parse JSON output
    const report = JSON.parse(result.stdout)
    return {
      passed: report.suites.flatMap(s => s.specs.filter(sp => sp.ok)).length,
      failed: report.suites.flatMap(s => s.specs.filter(sp => !sp.ok)).length,
      failures: report.suites.flatMap(s =>
        s.specs.filter(sp => !sp.ok).map(sp => ({
          testName: sp.title,
          error: sp.tests[0]?.results[0]?.error?.message || '',
          stack: sp.tests[0]?.results[0]?.error?.stack || ''
        }))
      )
    }
  }

  async heal(failure: TestFailure): Promise<HealResult> {
    // Extract selector from error
    const selectorMatch = failure.error.match(/locator\(['"]([^'"]+)['"]\)/)
    if (!selectorMatch) {
      return { success: false, confidence: 0 }
    }

    const originalSelector = selectorMatch[1]
    const alternatives = this.generateAlternatives(originalSelector)

    return {
      success: true,
      confidence: 60,
      suggestion: {
        original: originalSelector,
        alternatives
      }
    }
  }

  private generateAlternatives(selector: string): string[] {
    const alternatives: string[] = []

    // ID -> data-testid
    if (selector.startsWith('#')) {
      const id = selector.substring(1)
      alternatives.push(`[data-testid="${id}"]`)
      alternatives.push(`[data-test="${id}"]`)
    }

    // Class -> role
    if (selector.startsWith('.')) {
      const className = selector.substring(1)
      alternatives.push(`role=button[name="${className}"]`)
      alternatives.push(`[aria-label="${className}"]`)
    }

    return alternatives
  }

  private stepToCode(step: {action: string, selector?: string, value?: string}): string {
    switch (step.action) {
      case 'navigate':
        return `await page.goto('${step.value}')`
      case 'click':
        return `await page.locator('${step.selector}').click()`
      case 'fill':
        return `await page.locator('${step.selector}').fill('${step.value}')`
      case 'expect_visible':
        return `await expect(page.locator('${step.selector}')).toBeVisible()`
      default:
        return `// Unknown action: ${step.action}`
    }
  }
}
```

---

## 8. The 7-Step Workflow

### Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                    /test-ticket ENG-123                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  STEP 1: Ticket Analysis (~30 seconds)                           │
│  ─────────────────────────────────────                           │
│  - Call linear_read_issue to fetch ticket                        │
│  - Extract: title, description, acceptance criteria, labels      │
│  - Determine test type from labels                               │
│  - Create docs/test-analysis/{ticket-id}.md                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  STEP 2: Pattern Search (~1-2 minutes) - QUOTH REQUIRED          │
│  ────────────────────────────────────────────────────────        │
│  - Call quoth_search_index for existing patterns                 │
│  - Read relevant documentation with quoth_read_doc               │
│  - Search codebase with Grep for similar tests                   │
│  - Build pattern library for generation                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  STEP 3: Test Planning (~2 minutes)                              │
│  ──────────────────────────────────                              │
│  - Read playwright.config.ts for configuration                   │
│  - Generate test scenarios from acceptance criteria              │
│  - Determine execution mode (serial/parallel)                    │
│  - Create docs/test-plans/{ticket-id}-test-plan.md               │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  STEP 4: Test Generation (~3 minutes)                            │
│  ────────────────────────────────────                            │
│  - Create git branch: test/{ticket-id}-automated-tests           │
│  - Generate Playwright test file(s)                              │
│  - Follow patterns from Step 2                                   │
│  - Commit changes                                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  STEP 5: Execution Loop (~4-8 minutes)                           │
│  ─────────────────────────────────────                           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  FOR attempt IN 1..3:                                      │  │
│  │    - Run: npx playwright test {file} --reporter=json       │  │
│  │    - IF all pass -> EXIT loop                              │  │
│  │    - IF failures:                                          │  │
│  │      - Classify with Exolar (if available)                 │  │
│  │      - Apply healing rules                                 │  │
│  │      - Commit fix                                          │  │
│  │    - IF attempt == 3 -> Mark test.fixme()                  │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  STEP 6: CI Integration (~1 minute)                              │
│  ──────────────────────────────────                              │
│  - Read .github/workflows/ci.yml                                 │
│  - Add test execution if not present                             │
│  - Commit changes                                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│  STEP 7: PR Creation (~1-2 minutes) - QUOTH REQUIRED             │
│  ─────────────────────────────────────────────────────           │
│  - Evaluate if new patterns should be documented                 │
│  - Call quoth_propose_update for new patterns                    │
│  - Push branch to remote                                         │
│  - Create PR with gh pr create                                   │
│  - Link PR to Linear ticket                                      │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                         COMPLETE
              (~12-15 minutes total)
```

### Step Details

#### Step 1: Ticket Analysis

**File**: `skills/test-ticket/steps/01-ticket-analysis.md`

**MCP Call**:
```
Tool: linear_read_issue
Params: { issue_id: "ENG-123" }
```

**Output Structure**:
```markdown
# Test Analysis: ENG-123

## Ticket Information
- **Title**: {title}
- **Description**: {description}
- **Labels**: {labels}
- **Priority**: {priority}

## Acceptance Criteria
1. {criterion_1}
2. {criterion_2}
...

## Test Type Determination
Based on labels: {E2E UI | API | Regression}

## Target Test Location
`automation/playwright/tests/{feature}/`
```

#### Step 2: Pattern Search

**File**: `skills/test-ticket/steps/02-pattern-search.md`

**MCP Calls**:
```
Tool: quoth_search_index
Query: "playwright test {feature} patterns"

Tool: quoth_read_doc
Doc ID: "{doc_id_from_search}"
```

**Codebase Search**:
```
Tool: Grep
Pattern: "test.describe.*{feature}"
Path: "automation/playwright/"
```

#### Step 3: Test Planning

**File**: `skills/test-ticket/steps/03-test-planning.md`

**Output Structure**:
```markdown
# Test Plan: ENG-123

## Scenarios

### Scenario 1: {name}
- **Given**: {precondition}
- **When**: {action}
- **Then**: {expected_result}

### Scenario 2: {name}
...

## Execution Mode
{Serial | Parallel} because {reason}

## Dependencies
- {fixture_or_setup_needed}
```

#### Step 4: Test Generation

**File**: `skills/test-ticket/steps/04-test-generation.md`

**Git Operations**:
```bash
git checkout -b test/ENG-123-automated-tests
```

**Test Creation**:
```typescript
// automation/playwright/tests/{feature}/ENG-123.spec.ts
import { test, expect } from '@playwright/test'

test.describe('{Feature}', () => {
  // Generated from Step 3 plan
})
```

**Commit**:
```bash
git add .
git commit -m "test(ENG-123): add automated e2e tests"
```

#### Step 5: Execution Loop

**File**: `skills/test-ticket/steps/05-execution-loop.md`

**Execution**:
```bash
npx playwright test automation/playwright/tests/{feature}/ENG-123.spec.ts --reporter=json
```

**Failure Classification** (with Exolar):
```
Tool: perform_exolar_action
Action: classify
Params: { test_name, error_message, stack_trace }
```

**Healing Rules** (without Exolar):
| Error Pattern | Fix |
|---------------|-----|
| `locator.*not found` | Add `:visible` filter |
| `Timeout.*exceeded` | Use `getTimeout()` helper |
| `strict mode violation` | Add `.first()` |
| `401 Unauthorized` | Delete `.auth/`, recreate |

#### Step 6: CI Integration

**File**: `skills/test-ticket/steps/06-ci-integration.md`

**Check CI config**:
```
Tool: Read
File: .github/workflows/ci.yml
```

**Add test step if missing**:
```yaml
- name: Run E2E Tests
  run: npx playwright test
```

#### Step 7: PR Creation

**File**: `skills/test-ticket/steps/07-pr-creation.md`

**Documentation Update** (if new pattern):
```
Tool: quoth_propose_update
Doc ID: "patterns/playwright-testing.md"
Content: "{new_pattern}"
Reasoning: "Discovered during ENG-123"
Evidence: "{code_example}"
```

**Create PR**:
```bash
git push -u origin test/ENG-123-automated-tests
gh pr create --title "test(ENG-123): automated e2e tests" --body "..."
```

**Link to Linear**:
```
Tool: linear_update_issue
Params: { issue_id: "ENG-123", comment: "PR created: {url}" }
```

---

## 9. Configuration System

### Configuration File

Location: `quolar.config.ts` (project root)

```typescript
import { defineConfig } from '@quolar/core'

export default defineConfig({
  // Test framework configuration
  testFramework: {
    provider: 'playwright',           // 'playwright' | 'cypress' | 'vitest'
    config: './playwright.config.ts', // Path to framework config
    testDir: './automation/playwright/tests', // Test output directory
    pageObjectsDir: './tests/page-objects'    // Optional: page objects
  },

  // Ticket system configuration
  tickets: {
    provider: 'linear',               // 'linear' | 'jira' | 'github'
    workspace: 'your-workspace-slug', // Linear workspace
    // For Jira:
    // host: 'https://your-domain.atlassian.net',
    // project: 'PROJ'
  },

  // Documentation system (MANDATORY per project rules)
  documentation: {
    provider: 'quoth',                // 'quoth' | null
    // endpoint: 'https://...'        // Optional: custom endpoint
  },

  // Analytics system (optional)
  analytics: {
    provider: 'exolar',               // 'exolar' | 'datadog' | null
    // endpoint: 'https://...'        // Optional: custom endpoint
  },

  // VCS configuration (auto-detected)
  vcs: {
    provider: 'github',               // 'github' | 'gitlab'
    ciSystem: 'github-actions'        // 'github-actions' | 'gitlab-ci'
  },

  // Workflow settings
  workflow: {
    maxRetries: 3,                    // Max test retry attempts
    maxHealingAttempts: 3,            // Max healing attempts per failure
    autoHealingThreshold: 70,         // Confidence threshold for auto-heal
    parallelAgents: 3                 // Max parallel operations
  }
})
```

### Configuration Schema

Location: `packages/core/src/config/schema.ts`

```typescript
import { z } from 'zod'

export const testFrameworkConfigSchema = z.object({
  provider: z.enum(['playwright', 'cypress', 'vitest']),
  config: z.string(),
  testDir: z.string(),
  pageObjectsDir: z.string().optional()
})

export const ticketConfigSchema = z.object({
  provider: z.enum(['linear', 'jira', 'github']),
  workspace: z.string().optional(),
  host: z.string().optional(),
  project: z.string().optional()
})

export const documentationConfigSchema = z.object({
  provider: z.enum(['quoth']).nullable(),
  endpoint: z.string().optional()
}).nullable()

export const analyticsConfigSchema = z.object({
  provider: z.enum(['exolar', 'datadog']).nullable(),
  endpoint: z.string().optional()
}).nullable()

export const vcsConfigSchema = z.object({
  provider: z.enum(['github', 'gitlab']),
  ciSystem: z.enum(['github-actions', 'gitlab-ci'])
})

export const workflowConfigSchema = z.object({
  maxRetries: z.number().default(3),
  maxHealingAttempts: z.number().default(3),
  autoHealingThreshold: z.number().default(70),
  parallelAgents: z.number().default(3)
})

export const quolarConfigSchema = z.object({
  testFramework: testFrameworkConfigSchema,
  tickets: ticketConfigSchema,
  documentation: documentationConfigSchema.optional(),
  analytics: analyticsConfigSchema.optional(),
  vcs: vcsConfigSchema.optional(),
  workflow: workflowConfigSchema.optional()
})
```

### Example Configurations

**Minimal** (`examples/quolar.config.minimal.ts`):
```typescript
export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './tests'
  },
  tickets: {
    provider: 'linear',
    workspace: 'my-workspace'
  }
})
```

**Full** (`examples/quolar.config.ts`):
```typescript
export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './automation/playwright/tests',
    pageObjectsDir: './automation/playwright/page-objects'
  },
  tickets: {
    provider: 'linear',
    workspace: 'attorneyshare'
  },
  documentation: {
    provider: 'quoth'
  },
  analytics: {
    provider: 'exolar'
  },
  vcs: {
    provider: 'github',
    ciSystem: 'github-actions'
  },
  workflow: {
    maxRetries: 3,
    maxHealingAttempts: 3,
    autoHealingThreshold: 70,
    parallelAgents: 3
  }
})
```

---

## 10. Self-Healing Mechanism

### Overview

The self-healing system attempts to fix failing tests automatically. It operates in Step 5 of the workflow with up to 3 attempts.

### Healing Rules

| Error Pattern | Detection Regex | Fix Applied |
|---------------|-----------------|-------------|
| Locator not found | `/locator.*not found/` | Add `:visible` filter to selector |
| Timeout exceeded | `/Timeout.*exceeded/` | Use `getTimeout()` helper function |
| Strict mode violation | `/strict mode violation/` | Add `.first()` to selector |
| 401 Unauthorized | `/401\|Unauthorized/` | Delete `.auth/` directory, recreate auth |
| Element not interactable | `/not interactable/` | Add `.scrollIntoViewIfNeeded()` |
| Navigation failed | `/Navigation.*failed/` | Use `waitUntil: 'domcontentloaded'` |

### Selector Alternative Generation

When a selector fails, generate alternatives:

```typescript
// Original: #submit-button
// Alternatives:
[
  '[data-testid="submit-button"]',
  '[data-test="submit-button"]',
  'button[type="submit"]'
]

// Original: .btn-primary
// Alternatives:
[
  'role=button[name="btn-primary"]',
  '[aria-label="btn-primary"]',
  'button.btn-primary'
]

// Original: [name="email"]
// Alternatives:
[
  '[data-testid="email"]',
  'input[placeholder*="email"]',
  '#email'
]
```

### Healing Flow

```
Test Failure Detected
        │
        ▼
┌───────────────────────────────────────────────────────┐
│ IF Exolar available:                                  │
│   -> Classify failure (FLAKE/BUG/ENVIRONMENT/UNKNOWN) │
│   -> IF FLAKE with >70% confidence: just retry        │
│   -> IF BUG: report, don't auto-heal                  │
│ ELSE:                                                 │
│   -> Use rule-based classification                    │
└───────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────┐
│ Parse error message                                   │
│   -> Extract selector if locator error                │
│   -> Identify error pattern                           │
└───────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────┐
│ Apply fix based on pattern                            │
│   -> Generate selector alternatives                   │
│   -> Apply code transformation                        │
│   -> Commit changes                                   │
└───────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────┐
│ Re-run test                                           │
│   -> IF pass: continue to next step                   │
│   -> IF fail AND attempts < 3: retry healing          │
│   -> IF fail AND attempts == 3: mark test.fixme()     │
└───────────────────────────────────────────────────────┘
```

### Confidence Scoring

| Condition | Confidence |
|-----------|------------|
| Selector found + alternatives generated | 60% |
| Pattern matches known healing rule | 70% |
| Exolar classifies with high confidence | 80%+ |
| No selector found | 30% |
| Unknown error pattern | 20% |

### test.fixme() Marking

After 3 failed attempts, the test is marked for manual review:

```typescript
// Before
test('should submit form', async ({ page }) => {
  // ...
})

// After 3 failed attempts
test.fixme('should submit form', async ({ page }) => {
  // TODO: Auto-healing failed after 3 attempts
  // Error: {last_error_message}
  // Attempted fixes:
  // 1. {fix_1}
  // 2. {fix_2}
  // 3. {fix_3}
})
```

---

## 11. MCP Dependencies

### Required MCP Servers

#### Linear MCP

**Purpose**: Fetch tickets, update status, link PRs

**Installation**:
```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": {
        "LINEAR_API_KEY": "lin_api_xxx"
      }
    }
  }
}
```

**Tools Used**:
| Tool | Purpose |
|------|---------|
| `linear_read_issue` | Fetch ticket details |
| `linear_update_issue` | Update status, add comments |
| `linear_search_issues` | Search for related tickets |

#### Quoth MCP

**Purpose**: Search documentation, read patterns, propose updates

**Installation**:
```bash
claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp
```

**Tools Used**:
| Tool | Purpose |
|------|---------|
| `quoth_search_index` | Search for patterns |
| `quoth_read_doc` | Read full documentation |
| `quoth_propose_update` | Suggest new patterns |

### Optional MCP Servers

#### Exolar MCP

**Purpose**: Test analytics, failure classification

**Installation**:
```bash
claude mcp add exolar-qa --transport http https://exolar.ai-innovation.site/api/mcp/mcp -s user
```

**Tools Used**:
| Tool | Purpose |
|------|---------|
| `query_exolar_data` | Get test metrics |
| `perform_exolar_action` | Classify failures, report results |

### Checking MCP Status

Use the provided script:

```bash
# skills/test-ticket/scripts/check-mcp.sh
#!/bin/bash

echo "Checking MCP server status..."

# Check Linear
if claude mcp list | grep -q "linear"; then
  echo "✓ Linear MCP connected"
else
  echo "✗ Linear MCP NOT connected (REQUIRED)"
fi

# Check Quoth
if claude mcp list | grep -q "quoth"; then
  echo "✓ Quoth MCP connected"
else
  echo "⚠ Quoth MCP NOT connected (recommended)"
fi

# Check Exolar
if claude mcp list | grep -q "exolar"; then
  echo "✓ Exolar MCP connected"
else
  echo "○ Exolar MCP NOT connected (optional)"
fi
```

---

## 12. TypeScript Packages (Future API)

### Package Overview

The TypeScript packages under `/packages/` are designed for a future programmatic API. They are NOT used in plugin mode.

| Package | Purpose | Status |
|---------|---------|--------|
| `@quolar/core` | Workflow orchestrator, interfaces | Complete |
| `@quolar/provider-linear` | Linear ticket adapter | Complete |
| `@quolar/provider-github` | GitHub VCS adapter | Complete |
| `@quolar/provider-playwright` | Playwright adapter | Complete |
| `@quolar/provider-quoth` | Quoth documentation adapter | Complete |
| `@quolar/provider-exolar` | Exolar analytics adapter | Complete |
| `@quolar/skill` | Skill command implementation | Partial |

### Package Structure

```
packages/
├── core/
│   ├── src/
│   │   ├── index.ts           # Main exports
│   │   ├── interfaces/        # Provider interfaces
│   │   │   ├── index.ts
│   │   │   ├── ticket.ts      # TicketProvider
│   │   │   ├── docs.ts        # DocsProvider
│   │   │   ├── analytics.ts   # AnalyticsProvider
│   │   │   ├── vcs.ts         # VCSProvider
│   │   │   └── test.ts        # TestFrameworkProvider
│   │   ├── config/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts      # Zod schemas
│   │   │   └── loader.ts      # Config file loading (incomplete)
│   │   └── orchestrator/
│   │       ├── index.ts
│   │       └── workflow.ts    # Workflow orchestration
│   ├── dist/                  # Built output
│   ├── package.json
│   └── tsconfig.json
├── providers/
│   ├── linear/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── adapter.ts     # LinearAdapter
│   │   ├── dist/
│   │   └── package.json
│   ├── github/
│   │   └── ...                # Similar structure
│   ├── playwright/
│   │   └── ...
│   ├── quoth/
│   │   └── ...
│   └── exolar/
│       └── ...
└── skill/
    ├── src/
    │   ├── index.ts
    │   └── commands/
    │       └── test-ticket.ts # Command implementation
    ├── dist/
    └── package.json
```

### Build Configuration

**Root** (`tsconfig.build.json`):
```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/providers/linear" },
    { "path": "./packages/providers/github" },
    { "path": "./packages/providers/playwright" },
    { "path": "./packages/providers/quoth" },
    { "path": "./packages/providers/exolar" },
    { "path": "./packages/skill" }
  ]
}
```

**Build Command**:
```bash
pnpm build  # Runs tsc --build tsconfig.build.json
```

### npm Configuration

Each package has proper npm configuration:

```json
// packages/core/package.json
{
  "name": "@quolar/core",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./interfaces": {
      "types": "./dist/interfaces/index.d.ts",
      "import": "./dist/interfaces/index.js"
    },
    "./config": {
      "types": "./dist/config/index.d.ts",
      "import": "./dist/config/index.js"
    }
  },
  "files": ["dist", "README.md"],
  "peerDependencies": {
    "typescript": "^5.0.0"
  },
  "dependencies": {
    "zod": "^3.23.0"
  }
}
```

### Publishing Status

**Currently DISABLED** in `.github/workflows/ci.yml`:

```yaml
# Uncomment when ready to publish
# - name: Publish
#   run: pnpm -r publish --no-git-checks
#   env:
#     NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Missing: MCP Client Factory

To use these packages programmatically, a user needs to provide an MCP client:

```typescript
// This interface exists in the adapters
interface MCPClient {
  call<T>(method: string, params: Record<string, unknown>): Promise<T>
}

// But no factory to create it
// Users would need to implement:
function createMCPClient(config: MCPConfig): MCPClient {
  // Connect to MCP server
  // Handle authentication
  // Return client instance
}

// Then use:
const mcpClient = createMCPClient({ server: 'quoth', ... })
const quothAdapter = new QuothAdapter(mcpClient)
```

---

## 13. Gap Analysis

### Plugin Mode Gaps (Minor)

| Gap | Severity | Impact | Workaround |
|-----|----------|--------|------------|
| No automated tests for skills | Low | Can't validate without manual testing | Manual QA |
| Config not auto-loaded | Low | Claude reads manually | Claude uses Read tool |
| Self-healing is rule-based | Medium | Complex failures need manual intervention | Mark as test.fixme() |

### npm Mode Gaps (Critical for Future)

| Gap | Severity | Impact | Required Work |
|-----|----------|--------|---------------|
| MCP client factory missing | Critical | Can't instantiate adapters | Implement factory |
| npm publishing disabled | Critical | Can't install via npm | Uncomment CI step |
| Linear state ID mapping | High | Status updates fail | Query workspace states |
| No test coverage | High | Can't validate behavior | Write tests |
| Config loader incomplete | Medium | Can't auto-load config | Implement file loading |
| maxRetries not implemented | Low | Config ignored | Add retry logic |

---

## 14. Installation Guide

### Prerequisites

1. **Claude Code** installed and configured
2. **MCP servers** connected:
   - Linear (required)
   - Quoth (required per project rules)
   - Exolar (optional)
3. **Playwright** installed in target project

### Installation Steps

#### Step 1: Clone Plugin

```bash
# Clone to Claude Code skills directory
git clone https://github.com/Montinou/quolar.git ~/.claude/skills/quolar
```

#### Step 2: Verify MCP Connections

```bash
# In Claude Code, check MCP status
/mcp

# You should see:
# ✓ linear
# ✓ quoth (or warning if not connected)
# ○ exolar (optional)
```

#### Step 3: Run Setup Wizard

```bash
# In your project directory
/quolar-setup
```

This will:
- Validate MCP connections
- Create `quolar.config.ts`
- Set up test directories
- Verify Linear workspace access

#### Step 4: Configure Linear API Key

If not already configured:

```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": {
        "LINEAR_API_KEY": "lin_api_your_key_here"
      }
    }
  }
}
```

#### Step 5: Configure Quoth (if not connected)

```bash
claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp
```

#### Step 6: Test the Installation

```bash
# Generate tests from a ticket
/test-ticket ENG-123 --dry-run

# Full workflow
/test-ticket ENG-456
```

### Verification Checklist

- [ ] Plugin cloned to `~/.claude/skills/quolar`
- [ ] Linear MCP connected with valid API key
- [ ] Quoth MCP connected
- [ ] Playwright installed in project (`npm ls @playwright/test`)
- [ ] `quolar.config.ts` created in project root
- [ ] `/test-ticket --dry-run` executes without errors

---

## Summary

**Quolar as Claude Code Plugin**: READY for use with Exolar, Quoth, and Playwright integration.

**Key Points**:
1. Skills are markdown files Claude interprets
2. Claude calls MCP tools directly (not through adapters)
3. TypeScript packages are future API, not runtime code
4. Requires Linear MCP (required) and Quoth MCP (required per project rules)
5. Exolar is optional but enhances failure classification
6. Self-healing uses rule-based logic with 3 retry attempts
