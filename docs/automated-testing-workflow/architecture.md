# Quolar Architecture - Modular AI Test Automation Framework

**Version**: 2.0
**Last Updated**: 2026-01-17

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Provider Architecture](#provider-architecture)
3. [Provider Interfaces](#provider-interfaces)
4. [MCP Adapter Layer](#mcp-adapter-layer)
5. [Component Architecture](#component-architecture)
6. [Data Flow](#data-flow)
7. [Agent System](#agent-system)
8. [Execution Model](#execution-model)
9. [State Management](#state-management)
10. [Error Handling](#error-handling)
11. [Design Decisions](#design-decisions)

---

## System Overview

**Quolar** (Quoth + Exolar) is a modular, provider-agnostic AI test automation framework that orchestrates the entire test creation lifecycle from ticket analysis to PR validation. Inspired by Vibium's protocol-based extensibility approach, Quolar uses MCP (Model Context Protocol) as the universal interface for all external integrations.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                               │
│                     Claude Code CLI                                 │
│                   Command: /test-ticket LIN-123                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     WORKFLOW ORCHESTRATOR                           │
│  - Manages workflow state (Step 1-7)                               │
│  - Coordinates agent spawning                                       │
│  - Handles error recovery                                           │
│  - Provider-agnostic core logic                                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
          ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
          │  ANALYSIS   │  │  GENERATION │  │ VALIDATION  │
          │   LAYER     │  │    LAYER    │  │   LAYER     │
          └─────────────┘  └─────────────┘  └─────────────┘
                    │             │             │
                    └─────────────┼─────────────┘
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  PROVIDER ABSTRACTION LAYER                         │
│  ┌────────────────┐ ┌────────────────┐ ┌─────────────────────────┐  │
│  │ TicketProvider │ │ DocsProvider   │ │ AnalyticsProvider       │  │
│  │ Interface      │ │ Interface      │ │ Interface               │  │
│  └────────────────┘ └────────────────┘ └─────────────────────────┘  │
│  ┌────────────────┐ ┌────────────────┐                              │
│  │ VCSProvider    │ │ TestFramework  │                              │
│  │ Interface      │ │ Provider       │                              │
│  └────────────────┘ └────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MCP ADAPTER LAYER                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐   │
│  │ Linear  │ │ Jira    │ │ Quoth   │ │ Exolar  │ │ GitHub      │   │
│  │ Adapter │ │ Adapter │ │ Adapter │ │ Adapter │ │ Adapter     │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────────┘   │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌─────────┐                   │
│  │ GitHub  │ │Playwright│ │ Vitest  │ │ Cypress │                   │
│  │ Issues  │ │ Adapter  │ │ Adapter │ │ Adapter │                   │
│  └─────────┘ └──────────┘ └─────────┘ └─────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────────┐     │
│  │  Linear   │  │   Jira    │  │  Exolar   │  │   GitHub     │     │
│  │  API      │  │   REST    │  │Dashboard  │  │   Actions    │     │
│  └───────────┘  └───────────┘  └───────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **Protocol-Based Extensibility**: MCP as universal interface, not proprietary plugins
2. **Zero-Config Defaults**: Works out-of-the-box with sensible defaults
3. **Adapter Pattern**: Core logic is provider-agnostic, adapters are thin wrappers
4. **Standards Over Plugins**: MCP protocol ensures compatibility with any agent
5. **Autonomous Execution**: Minimal human intervention required
6. **Self-Healing**: Automatic failure detection and correction
7. **Standards Compliance**: Enforces TEST_STANDARDS.md patterns
8. **Graceful Degradation**: Works with or without optional providers
9. **Idempotency**: Safe to re-run at any step
10. **Observability**: Full logging and metrics via analytics provider

---

## Provider Architecture

Quolar's provider architecture enables swapping between different tools while maintaining the same workflow logic. Each provider type has a defined interface that all adapters must implement.

### Provider Categories

| Category | Purpose | Default Provider | Alternatives |
|----------|---------|------------------|--------------|
| **Tickets** | Issue tracking | Linear | Jira, GitHub Issues |
| **Documentation** | Pattern search | Quoth | Confluence, Notion |
| **Analytics** | Test metrics | Exolar | DataDog, Allure |
| **VCS** | Version control | GitHub | GitLab, Bitbucket |
| **Test Framework** | Test execution | Playwright | Vitest, Cypress |

### Provider Selection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Configuration Loading                         │
│                                                                  │
│  1. Load quolar.config.ts                                        │
│  2. Detect available MCP servers                                 │
│  3. Validate provider configuration                              │
│  4. Initialize adapters                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Provider Resolution                           │
│                                                                  │
│  For each provider type:                                         │
│    1. Check explicit config (quolar.config.ts)                   │
│    2. Check MCP availability (auto-detect)                       │
│    3. Fall back to default                                       │
│    4. Or skip if optional                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Adapter Initialization                        │
│                                                                  │
│  LinearAdapter.initialize() → TicketProvider                     │
│  QuothAdapter.initialize() → DocsProvider (optional)             │
│  ExolarAdapter.initialize() → AnalyticsProvider (optional)       │
│  GitHubAdapter.initialize() → VCSProvider                        │
│  PlaywrightAdapter.initialize() → TestFrameworkProvider          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Provider Interfaces

All provider adapters must implement these TypeScript interfaces:

### 1. TicketProvider Interface

Manages issue tracking integration (Linear, Jira, GitHub Issues).

```typescript
interface Ticket {
  id: string
  identifier: string          // e.g., "LIN-123", "ENG-456"
  title: string
  description: string
  status: string
  labels: string[]
  assignee?: string
  team?: string
  linkedPRs: string[]
  acceptanceCriteria: string[]
  metadata: Record<string, unknown>
}

interface TicketUpdate {
  status?: string
  labels?: string[]
  comment?: string
  linkedPRs?: string[]
}

interface TicketProvider {
  name: string

  // Read ticket details
  read(ticketId: string): Promise<Ticket>

  // Update ticket
  update(ticketId: string, data: TicketUpdate): Promise<void>

  // Link PR to ticket
  linkPR(ticketId: string, prUrl: string): Promise<void>

  // Add comment to ticket
  addComment(ticketId: string, comment: string): Promise<void>

  // Extract acceptance criteria from description
  getAcceptanceCriteria(ticketId: string): Promise<string[]>

  // Search tickets
  search(query: string, filters?: Record<string, unknown>): Promise<Ticket[]>
}
```

### 2. DocsProvider Interface

Manages documentation search and pattern retrieval (Quoth, Confluence, Notion).

```typescript
interface PatternResult {
  id: string
  title: string
  content: string
  relevance: number         // 0-1 similarity score
  source: string            // file path or URL
  category: string          // e.g., "patterns", "architecture"
}

interface Document {
  id: string
  title: string
  content: string
  metadata: Record<string, unknown>
  lastUpdated: Date
}

interface DocsProvider {
  name: string

  // Search for patterns
  searchPatterns(query: string): Promise<PatternResult[]>

  // Read specific document
  readDocument(docId: string): Promise<Document>

  // List available templates
  listTemplates(category?: string): Promise<string[]>

  // Get template content
  getTemplate(templateId: string): Promise<string>

  // Propose documentation update (optional)
  proposeUpdate?(docId: string, content: string, reason: string): Promise<void>
}
```

### 3. AnalyticsProvider Interface

Manages test analytics, failure classification, and auto-healing insights (Exolar, DataDog, Allure).

```typescript
interface TestFailure {
  testName: string
  error: string
  stackTrace: string
  screenshot?: string
  video?: string
  duration: number
}

interface Classification {
  result: 'FLAKE' | 'BUG' | 'ENVIRONMENT' | 'UNKNOWN'
  confidence: number        // 0-100
  evidence: string[]
  suggestedFix?: string
}

interface TestResults {
  executionId: string
  branch: string
  commit: string
  passed: number
  failed: number
  skipped: number
  duration: number
  failures: TestFailure[]
}

interface SimilarFailure {
  testName: string
  error: string
  occurrences: number
  lastSeen: Date
  resolution?: string
}

interface FlakinessData {
  testSignature: string
  flakinessScore: number    // 0-100
  passRate: number
  recentResults: ('pass' | 'fail')[]
}

interface AnalyticsProvider {
  name: string

  // Classify a test failure
  classifyFailure(failure: TestFailure): Promise<Classification>

  // Report test results
  reportResults(results: TestResults): Promise<void>

  // Find similar failures in history
  findSimilarFailures(error: string): Promise<SimilarFailure[]>

  // Get flakiness data for a test
  getFlakiness(testSignature: string): Promise<FlakinessData>

  // Get execution details
  getExecution(executionId: string): Promise<TestResults>

  // Query executions by branch
  queryExecutions(branch: string, limit?: number): Promise<TestResults[]>
}
```

### 4. VCSProvider Interface

Manages version control operations (GitHub, GitLab, Bitbucket).

```typescript
interface PROptions {
  title: string
  body: string
  base: string
  head: string
  draft?: boolean
  labels?: string[]
  reviewers?: string[]
}

interface PRResult {
  url: string
  number: number
  state: 'open' | 'closed' | 'merged'
}

interface CommitInfo {
  sha: string
  message: string
  author: string
  date: Date
}

interface VCSProvider {
  name: string

  // Create a new branch
  createBranch(name: string, from?: string): Promise<void>

  // Checkout branch
  checkout(branchName: string): Promise<void>

  // Stage and commit files
  commit(message: string, files: string[]): Promise<CommitInfo>

  // Push to remote
  push(force?: boolean): Promise<void>

  // Create pull request
  createPR(options: PROptions): Promise<PRResult>

  // Get PR status
  getPRStatus(prNumber: number): Promise<PRResult>

  // Get recent commits
  getCommits(branch: string, limit?: number): Promise<CommitInfo[]>
}
```

### 5. TestFrameworkProvider Interface

Manages test generation and execution (Playwright, Vitest, Cypress).

```typescript
interface FrameworkConfig {
  name: string
  version: string
  configPath: string
  testDir: string
  pageObjectsDir?: string
}

interface TestPlan {
  scenarios: TestScenario[]
  executionMode: 'serial' | 'parallel'
  project?: string
  workers?: number
}

interface TestScenario {
  name: string
  description: string
  steps: string[]
  assertions: string[]
  tags: string[]
}

interface ExecutionConfig {
  project?: string
  testFiles: string[]
  workers?: number
  timeout?: number
  retries?: number
}

interface HealResult {
  success: boolean
  fixes: string[]
  changedFiles: string[]
}

interface TestFrameworkProvider {
  name: string

  // Detect framework configuration
  detect(): Promise<FrameworkConfig>

  // Generate test code from plan
  generateTest(plan: TestPlan, template?: string): Promise<string>

  // Execute tests
  execute(config: ExecutionConfig): Promise<TestResults>

  // Heal failing tests
  heal(failure: TestFailure): Promise<HealResult>

  // Validate generated code (type checking)
  validate(testFile: string): Promise<{ valid: boolean; errors: string[] }>
}
```

---

## MCP Adapter Layer

Each provider interface has MCP adapters that translate between the interface and actual MCP tool calls.

### Adapter Pattern

```typescript
// Example: Linear adapter implementing TicketProvider
import { TicketProvider, Ticket, TicketUpdate } from '@quolar/core'

export class LinearAdapter implements TicketProvider {
  name = 'linear'

  constructor(private mcpClient: MCPClient) {}

  async read(ticketId: string): Promise<Ticket> {
    const result = await this.mcpClient.call('linear_read_issue', {
      id: ticketId,
      includeRelations: true
    })
    return this.mapToTicket(result)
  }

  async update(ticketId: string, data: TicketUpdate): Promise<void> {
    await this.mcpClient.call('linear_update_issue', {
      id: ticketId,
      ...this.mapFromUpdate(data)
    })
  }

  async linkPR(ticketId: string, prUrl: string): Promise<void> {
    await this.mcpClient.call('linear_update_issue', {
      id: ticketId,
      attachmentUrls: [prUrl]
    })
  }

  async addComment(ticketId: string, comment: string): Promise<void> {
    await this.mcpClient.call('linear_create_comment', {
      issueId: ticketId,
      body: comment
    })
  }

  async getAcceptanceCriteria(ticketId: string): Promise<string[]> {
    const ticket = await this.read(ticketId)
    return this.parseAcceptanceCriteria(ticket.description)
  }

  private mapToTicket(raw: unknown): Ticket {
    // Transform Linear API response to Ticket interface
    const data = raw as LinearIssue
    return {
      id: data.id,
      identifier: data.identifier,
      title: data.title,
      description: data.description ?? '',
      status: data.state?.name ?? 'Unknown',
      labels: data.labels?.nodes?.map(l => l.name) ?? [],
      assignee: data.assignee?.name,
      team: data.team?.name,
      linkedPRs: data.attachments?.nodes?.map(a => a.url) ?? [],
      acceptanceCriteria: this.parseAcceptanceCriteria(data.description),
      metadata: { priority: data.priority, estimate: data.estimate }
    }
  }

  private parseAcceptanceCriteria(description: string): string[] {
    // Parse AC from description (markdown checkboxes)
    const acMatch = description.match(/acceptance criteria:?\n([\s\S]*?)(?:\n\n|$)/i)
    if (!acMatch) return []
    return acMatch[1]
      .split('\n')
      .filter(line => line.match(/^[-*\[\]x ]+/))
      .map(line => line.replace(/^[-*\[\]x ]+/, '').trim())
  }
}
```

### Default Provider Stack

| Provider Type | Default | MCP Tool Prefix |
|---------------|---------|-----------------|
| Tickets | Linear | `linear_` |
| Documentation | Quoth | `quoth_` |
| Analytics | Exolar | `exolar_` |
| VCS | GitHub | `gh` CLI |
| Test Framework | Playwright | Native API |

### MCP Tool Mapping

**Linear MCP Tools**:
- `linear_read_issue` → `TicketProvider.read()`
- `linear_update_issue` → `TicketProvider.update()`
- `linear_create_comment` → `TicketProvider.addComment()`
- `linear_search_issues` → `TicketProvider.search()`

**Quoth MCP Tools**:
- `quoth_search_index` → `DocsProvider.searchPatterns()`
- `quoth_read_doc` → `DocsProvider.readDocument()`
- `quoth_list_templates` → `DocsProvider.listTemplates()`
- `quoth_get_template` → `DocsProvider.getTemplate()`

**Exolar MCP Tools**:
- `query_exolar_data` → `AnalyticsProvider.queryExecutions()`
- `perform_exolar_action(classify)` → `AnalyticsProvider.classifyFailure()`
- `perform_exolar_action(report)` → `AnalyticsProvider.reportResults()`

---

## Component Architecture

### 1. Workflow Orchestrator

**Responsibilities**:
- Execute workflow steps sequentially (1-7)
- Manage state transitions
- Spawn and coordinate agents
- Handle errors and retries
- Track execution metrics
- Route calls through provider abstraction

**Key Functions**:
```typescript
interface WorkflowOrchestrator {
  // Providers (injected via configuration)
  ticketProvider: TicketProvider
  docsProvider?: DocsProvider
  analyticsProvider?: AnalyticsProvider
  vcsProvider: VCSProvider
  testFrameworkProvider: TestFrameworkProvider

  // Main entry point
  executeWorkflow(ticketId: string): Promise<WorkflowResult>

  // Step execution
  executeStep(stepNumber: number, context: WorkflowContext): Promise<StepResult>

  // Agent coordination
  spawnAgent(agentType: AgentType, context: AgentContext): Promise<AgentResult>

  // State management
  saveState(state: WorkflowState): void
  loadState(): WorkflowState | null

  // Error handling
  handleStepFailure(step: number, error: Error): RecoveryStrategy
}
```

### 2. Analysis Layer

**Components**:
- **Ticket Analyzer**: Reads tickets via TicketProvider
- **Pattern Searcher**: Searches codebase and DocsProvider
- **Test Planner**: Generates comprehensive test plan

**Data Flow**:
```
TicketProvider.read(ticketId)
    ↓
Ticket Analysis Document
    ↓
DocsProvider.searchPatterns(query)
    ↓
Pattern Library
    ↓
Test Planner Agent
    ↓
Test Plan Document
```

### 3. Generation Layer

**Components**:
- **Test Writer Agent**: Generates test files using TestFrameworkProvider
- **Template Engine**: Applies templates from DocsProvider
- **Type Checker**: Validates via TestFrameworkProvider.validate()

### 4. Validation Layer

**Components**:
- **Test Executor**: Runs tests via TestFrameworkProvider.execute()
- **Failure Analyzer**: Classifies via AnalyticsProvider.classifyFailure()
- **Test Healer Agent**: Applies fixes via TestFrameworkProvider.heal()
- **CI Integrator Agent**: Updates CI config via VCSProvider

---

## Data Flow

### Complete Workflow Data Flow with Providers

```
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 1: TICKET ANALYSIS                                             │
│                                                                      │
│  TicketProvider.read("LIN-123")                                     │
│      ↓                                                              │
│  Ticket { title, description, labels, acceptanceCriteria }          │
│      ↓                                                              │
│  Write: /docs/test-analysis/LIN-123.md                              │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 2: PATTERN SEARCH                                              │
│                                                                      │
│  Glob Search (automation/playwright/tests/**/*.spec.ts)             │
│      ↓                                                              │
│  Similar Test Files                                                 │
│      ↓                                                              │
│  DocsProvider.searchPatterns("auth test patterns") [if available]   │
│      ↓                                                              │
│  Pattern Library Document                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 3: TEST PLANNING                                               │
│                                                                      │
│  Spawn: test-planner agent                                          │
│      ↓                                                              │
│  TestFrameworkProvider.detect()                                     │
│      ↓                                                              │
│  Generate TestPlan { scenarios, executionMode, workers }            │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 4: TEST GENERATION                                             │
│                                                                      │
│  VCSProvider.createBranch("test/LIN-123-automated-tests")           │
│      ↓                                                              │
│  Spawn: test-writer agents (parallel)                               │
│      ↓                                                              │
│  TestFrameworkProvider.generateTest(plan, template)                 │
│      ↓                                                              │
│  TestFrameworkProvider.validate(testFile)                           │
│      ↓                                                              │
│  VCSProvider.commit("feat: add tests for LIN-123", files)           │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 5: EXECUTION LOOP (max 3 attempts)                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ ATTEMPT N:                                                  │    │
│  │                                                             │    │
│  │  TestFrameworkProvider.execute(config)                      │    │
│  │      ↓                                                      │    │
│  │  TestResults { passed, failed, failures[] }                │    │
│  │      ↓                                                      │    │
│  │  IF ALL PASS: Exit loop → Step 6                            │    │
│  │                                                             │    │
│  │  IF FAILURES:                                               │    │
│  │      ↓                                                      │    │
│  │  AnalyticsProvider.classifyFailure(failure)                 │    │
│  │      ↓                                                      │    │
│  │  Classification { result, confidence, suggestedFix }        │    │
│  │      ↓                                                      │    │
│  │  Spawn: test-healer agent                                   │    │
│  │      ↓                                                      │    │
│  │  TestFrameworkProvider.heal(failure)                        │    │
│  │      ↓                                                      │    │
│  │  VCSProvider.commit("fix: auto-heal attempt N", files)      │    │
│  │      ↓                                                      │    │
│  │  Retry loop                                                 │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 6: CI INTEGRATION                                              │
│                                                                      │
│  Spawn: ci-integrator agent                                         │
│      ↓                                                              │
│  Read current CI config                                             │
│      ↓                                                              │
│  Update .github/workflows/ci.yml                                    │
│      ↓                                                              │
│  VCSProvider.commit("ci: add tests for LIN-123", files)             │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ STEP 7: PR CREATION                                                 │
│                                                                      │
│  VCSProvider.push()                                                 │
│      ↓                                                              │
│  VCSProvider.createPR({ title, body, base, head })                  │
│      ↓                                                              │
│  PRResult { url, number }                                           │
│      ↓                                                              │
│  TicketProvider.linkPR(ticketId, prUrl)                             │
│      ↓                                                              │
│  TicketProvider.addComment(ticketId, "Tests generated: PR #N")      │
│      ↓                                                              │
│  AnalyticsProvider.queryExecutions(branch) [validate CI]            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Agent System

### Agent Architecture

Agents are specialized AI workers spawned via the Task tool. Each agent:
- Receives full context from parent orchestrator
- Executes autonomously within defined scope
- Uses provider interfaces (not direct MCP calls)
- Returns structured results
- Can spawn sub-agents if needed

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW ORCHESTRATOR                        │
│                    (Parent Agent)                               │
│                                                                 │
│  Injected: TicketProvider, DocsProvider, AnalyticsProvider,     │
│            VCSProvider, TestFrameworkProvider                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                ┌──────────────┼──────────────┬─────────────┐
                ▼              ▼              ▼             ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────┐ ┌──────────┐
        │ test-planner │ │ test-writer  │ │  test-   │ │   ci-    │
        │    agent     │ │    agent     │ │ healer   │ │integrator│
        │              │ │              │ │  agent   │ │  agent   │
        │ Uses:        │ │ Uses:        │ │ Uses:    │ │ Uses:    │
        │ - DocsProvider │ - TestFramework│ - Analytics│ - VCSProvider
        │ - TicketProvider│ - DocsProvider│ - TestFrmwk│          │
        └──────────────┘ └──────────────┘ └──────────┘ └──────────┘
```

### Agent Definitions

See [agent-specifications.md](./agent-specifications.md) for detailed agent configurations.

---

## Execution Model

### Sequential Workflow Execution

```typescript
async function executeWorkflow(
  ticketId: string,
  providers: ProviderSet
): Promise<WorkflowResult> {
  const context = new WorkflowContext(ticketId, providers)

  // Step 1: Ticket Analysis (uses TicketProvider)
  await executeStep1_TicketAnalysis(context)

  // Step 2: Pattern Search (uses DocsProvider if available)
  await executeStep2_PatternSearch(context)

  // Step 3: Test Planning (uses TestFrameworkProvider)
  await executeStep3_TestPlanning(context)

  // Step 4: Test Generation (uses VCSProvider, TestFrameworkProvider)
  await executeStep4_TestGeneration(context)

  // Step 5: Execution Loop (uses AnalyticsProvider, TestFrameworkProvider)
  await executeStep5_ExecutionLoop(context)

  // Step 6: CI Integration (uses VCSProvider)
  await executeStep6_CIIntegration(context)

  // Step 7: PR Creation (uses VCSProvider, TicketProvider)
  await executeStep7_PRCreation(context)

  return context.result
}
```

### Parallel Agent Execution

Within each step, agents can run in parallel:

```typescript
// Step 4: Generate tests in parallel (if multiple scenarios)
const testWriterAgents = scenarios.map(scenario =>
  Task({
    subagent_type: "general-purpose",
    description: `Generate ${scenario.name} test`,
    prompt: generateTestPrompt(scenario, context.testFrameworkProvider)
  })
)

// Execute all in parallel
const results = await Promise.all(testWriterAgents)
```

---

## State Management

### Workflow State with Provider Context

```typescript
interface WorkflowState {
  ticketId: string
  currentStep: number
  startTime: Date

  // Provider configuration
  providers: {
    ticket: string         // e.g., "linear"
    docs?: string          // e.g., "quoth"
    analytics?: string     // e.g., "exolar"
    vcs: string            // e.g., "github"
    testFramework: string  // e.g., "playwright"
  }

  // Step outputs
  ticket?: Ticket
  patternLibrary?: PatternResult[]
  testPlan?: TestPlan
  testFiles?: string[]
  executionResults?: TestResults[]
  prResult?: PRResult

  // Metadata
  attemptCount: number
  fixesApplied: string[]
  errors: Error[]
}
```

---

## Error Handling

### Error Categories by Provider

**1. Provider Unavailable**:
- TicketProvider unavailable → Fatal (cannot proceed)
- DocsProvider unavailable → Degraded (codebase search only)
- AnalyticsProvider unavailable → Degraded (no auto-healing insights)
- VCSProvider unavailable → Fatal (cannot create PR)
- TestFrameworkProvider unavailable → Fatal (cannot generate tests)

**2. Provider Rate Limits**:
- Implement exponential backoff
- Fall back to alternative provider if available

**3. Provider Authentication Errors**:
- Clear error message with token refresh instructions
- Suggest running verification command

### Graceful Degradation

```typescript
async function executeStep2_PatternSearch(context: WorkflowContext) {
  const patterns: PatternResult[] = []

  // Always search codebase
  const codebasePatterns = await searchCodebase(context.ticket)
  patterns.push(...codebasePatterns)

  // Try DocsProvider if available
  if (context.docsProvider) {
    try {
      const docPatterns = await context.docsProvider.searchPatterns(
        context.ticket.title
      )
      patterns.push(...docPatterns)
    } catch (error) {
      console.warn(`DocsProvider unavailable: ${error.message}`)
      console.warn('Continuing with codebase patterns only')
      // Continue without documentation patterns
    }
  }

  context.patternLibrary = patterns
}
```

---

## Design Decisions

### 1. Why Provider Abstraction Layer?

**Decision**: Introduce provider interfaces between core logic and MCP adapters

**Rationale**:
- Enables swapping providers without changing workflow logic
- Easier testing with mock providers
- Clear contracts between components
- Future-proofs against new tools

**Trade-off**: Additional abstraction layer vs flexibility and testability

### 2. Why MCP as Universal Interface?

**Decision**: Use MCP protocol for all external integrations

**Rationale**:
- Industry standard for AI agent communication
- Works with any Claude Code compatible agent
- Consistent authentication and error handling
- Protocol ensures future compatibility

**Trade-off**: Dependency on MCP protocol vs standardization benefits

### 3. Why Linear as Default Ticket Provider?

**Decision**: Linear is the default, Jira is first alternative

**Rationale**:
- Linear has excellent MCP support
- AttorneyShare ecosystem uses Linear
- Jira covers enterprise use cases
- Clear migration path

**Trade-off**: Linear-first development vs enterprise adoption

### 4. Why Quoth and Exolar as Defaults?

**Decision**: Quoth (docs) and Exolar (analytics) as ecosystem defaults

**Rationale**:
- Part of AttorneyShare QA tools ecosystem
- Optimized for this workflow
- Alternatives can be added later
- Both are optional with graceful degradation

**Trade-off**: Ecosystem lock-in vs optimal integration

---

## Future Provider Support

### Planned Providers

| Provider Type | Planned | Priority | Status |
|---------------|---------|----------|--------|
| Jira | TicketProvider | High | In Progress |
| GitHub Issues | TicketProvider | Medium | Planned |
| Confluence | DocsProvider | Medium | Planned |
| DataDog | AnalyticsProvider | Low | Future |
| GitLab | VCSProvider | Medium | Planned |
| Cypress | TestFrameworkProvider | Low | Future |
| Vitest | TestFrameworkProvider | Medium | Planned |

### Adding New Providers

1. Implement the provider interface
2. Create MCP adapter (or REST adapter)
3. Add configuration option to quolar.config.ts
4. Write adapter tests
5. Document in providers/ directory

---

**Version**: 2.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
