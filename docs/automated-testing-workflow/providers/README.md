# Quolar Providers

**Version**: 2.0
**Last Updated**: 2026-01-17

---

## Overview

Quolar uses a **provider abstraction layer** to enable swapping between different tools while maintaining the same workflow logic. Each provider type has a defined interface that all adapters must implement.

This approach, inspired by Vibium's protocol-based extensibility, uses MCP (Model Context Protocol) as the universal interface for all external integrations.

---

## Provider Categories

| Category | Interface | Purpose | Default | Status |
|----------|-----------|---------|---------|--------|
| **Tickets** | `TicketProvider` | Issue tracking | Linear | Stable |
| **Documentation** | `DocsProvider` | Pattern search | Quoth | Stable |
| **Analytics** | `AnalyticsProvider` | Test metrics | Exolar | Stable |
| **VCS** | `VCSProvider` | Version control | GitHub | Stable |
| **Test Framework** | `TestFrameworkProvider` | Test execution | Playwright | Stable |

---

## Available Providers

### Ticket Providers

| Provider | Status | Documentation |
|----------|--------|---------------|
| **Linear** | Stable (Default) | [linear.md](./linear.md) |
| **Jira** | In Progress | [jira.md](./jira.md) |
| GitHub Issues | Planned | Coming soon |
| Asana | Future | Not started |

### Documentation Providers

| Provider | Status | Documentation |
|----------|--------|---------------|
| **Quoth** | Stable (Default) | [quoth.md](./quoth.md) |
| Confluence | Planned | Coming soon |
| Notion | Future | Not started |

### Analytics Providers

| Provider | Status | Documentation |
|----------|--------|---------------|
| **Exolar** | Stable (Default) | [exolar.md](./exolar.md) |
| DataDog | Planned | Coming soon |
| Allure | Future | Not started |

### VCS Providers

| Provider | Status | Documentation |
|----------|--------|---------------|
| **GitHub** | Stable (Default) | Built-in (via `gh` CLI) |
| GitLab | Planned | Coming soon |
| Bitbucket | Future | Not started |

### Test Framework Providers

| Provider | Status | Documentation |
|----------|--------|---------------|
| **Playwright** | Stable (Default) | Built-in |
| Vitest | Planned | Coming soon |
| Cypress | Future | Not started |

---

## Provider Interfaces

### TicketProvider

Manages issue tracking integration.

```typescript
interface TicketProvider {
  name: string

  read(ticketId: string): Promise<Ticket>
  update(ticketId: string, data: TicketUpdate): Promise<void>
  linkPR(ticketId: string, prUrl: string): Promise<void>
  addComment(ticketId: string, comment: string): Promise<void>
  getAcceptanceCriteria(ticketId: string): Promise<string[]>
  search(query: string, filters?: Record<string, unknown>): Promise<Ticket[]>
}
```

**Used in Steps**: 1 (Ticket Analysis), 7 (PR Creation)

### DocsProvider

Manages documentation search and pattern retrieval.

```typescript
interface DocsProvider {
  name: string

  searchPatterns(query: string): Promise<PatternResult[]>
  readDocument(docId: string): Promise<Document>
  listTemplates(category?: string): Promise<string[]>
  getTemplate(templateId: string): Promise<string>
  proposeUpdate?(docId: string, content: string, reason: string): Promise<void>
}
```

**Used in Steps**: 2 (Pattern Search), 4 (Test Generation)
**Optional**: Falls back to codebase search if unavailable

### AnalyticsProvider

Manages test analytics, failure classification, and auto-healing insights.

```typescript
interface AnalyticsProvider {
  name: string

  classifyFailure(failure: TestFailure): Promise<Classification>
  reportResults(results: TestResults): Promise<void>
  findSimilarFailures(error: string): Promise<SimilarFailure[]>
  getFlakiness(testSignature: string): Promise<FlakinessData>
  getExecution(executionId: string): Promise<TestResults>
  queryExecutions(branch: string, limit?: number): Promise<TestResults[]>
}
```

**Used in Steps**: 5 (Execution Loop), 7 (PR Validation)
**Optional**: Falls back to basic logging if unavailable

### VCSProvider

Manages version control operations.

```typescript
interface VCSProvider {
  name: string

  createBranch(name: string, from?: string): Promise<void>
  checkout(branchName: string): Promise<void>
  commit(message: string, files: string[]): Promise<CommitInfo>
  push(force?: boolean): Promise<void>
  createPR(options: PROptions): Promise<PRResult>
  getPRStatus(prNumber: number): Promise<PRResult>
  getCommits(branch: string, limit?: number): Promise<CommitInfo[]>
}
```

**Used in Steps**: 4 (Test Generation), 6 (CI Integration), 7 (PR Creation)

### TestFrameworkProvider

Manages test generation and execution.

```typescript
interface TestFrameworkProvider {
  name: string

  detect(): Promise<FrameworkConfig>
  generateTest(plan: TestPlan, template?: string): Promise<string>
  execute(config: ExecutionConfig): Promise<TestResults>
  heal(failure: TestFailure): Promise<HealResult>
  validate(testFile: string): Promise<{ valid: boolean; errors: string[] }>
}
```

**Used in Steps**: 3 (Test Planning), 4 (Test Generation), 5 (Execution Loop)

---

## Configuration

Providers are configured in `quolar.config.ts`:

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  // Ticket Provider (required)
  tickets: {
    provider: 'linear',     // 'linear' | 'jira' | 'github-issues'
    workspace: 'your-workspace'
  },

  // Documentation Provider (optional)
  documentation: {
    provider: 'quoth',      // 'quoth' | 'confluence' | null
    endpoint: 'https://quoth.ai-innovation.site/api/mcp'
  },

  // Analytics Provider (optional)
  analytics: {
    provider: 'exolar',     // 'exolar' | 'datadog' | null
    endpoint: 'https://exolar.ai-innovation.site/api/mcp'
  },

  // VCS Provider (auto-detected)
  vcs: {
    provider: 'github',     // 'github' | 'gitlab' | 'bitbucket'
    ciSystem: 'github-actions'
  },

  // Test Framework (required)
  testFramework: {
    provider: 'playwright', // 'playwright' | 'vitest' | 'cypress'
    config: './playwright.config.ts',
    testDir: './tests'
  }
})
```

---

## Provider Selection Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    Configuration Loading                     │
│                                                             │
│  1. Load quolar.config.ts                                   │
│  2. Detect available MCP servers                            │
│  3. Validate provider configuration                         │
│  4. Initialize adapters                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Provider Resolution                       │
│                                                             │
│  For each provider type:                                    │
│    1. Check explicit config (quolar.config.ts)              │
│    2. Check MCP availability (auto-detect)                  │
│    3. Fall back to default                                  │
│    4. Or skip if optional                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Required vs Optional Providers

### Required Providers

These must be configured for Quolar to function:

| Provider | Why Required |
|----------|--------------|
| **TicketProvider** | Source of requirements (what to test) |
| **VCSProvider** | Git operations (branches, commits, PRs) |
| **TestFrameworkProvider** | Test generation and execution |

### Optional Providers

These enhance functionality but aren't required:

| Provider | Fallback Behavior |
|----------|-------------------|
| **DocsProvider** | Codebase Glob/Grep search only |
| **AnalyticsProvider** | Basic logging, no auto-healing insights |

---

## MCP Tool Mapping

Each provider maps to specific MCP tools:

### Linear MCP Tools

```
linear_read_issue       → TicketProvider.read()
linear_update_issue     → TicketProvider.update()
linear_create_comment   → TicketProvider.addComment()
linear_search_issues    → TicketProvider.search()
```

### Quoth MCP Tools

```
quoth_search_index      → DocsProvider.searchPatterns()
quoth_read_doc          → DocsProvider.readDocument()
quoth_list_templates    → DocsProvider.listTemplates()
quoth_get_template      → DocsProvider.getTemplate()
```

### Exolar MCP Tools

```
query_exolar_data       → AnalyticsProvider.queryExecutions()
perform_exolar_action   → AnalyticsProvider.classifyFailure()
                        → AnalyticsProvider.reportResults()
```

---

## Adding New Providers

### Step 1: Implement the Interface

```typescript
// providers/my-provider/src/adapter.ts
import { TicketProvider, Ticket } from '@quolar/core'

export class MyProviderAdapter implements TicketProvider {
  name = 'my-provider'

  async read(ticketId: string): Promise<Ticket> {
    // Implement using your provider's API/MCP
  }

  async update(ticketId: string, data: TicketUpdate): Promise<void> {
    // Implement
  }

  // ... implement all required methods
}
```

### Step 2: Create MCP Adapter (if using MCP)

```typescript
// providers/my-provider/src/mcp-adapter.ts
export class MyProviderMCPAdapter implements TicketProvider {
  constructor(private mcpClient: MCPClient) {}

  async read(ticketId: string): Promise<Ticket> {
    const result = await this.mcpClient.call('my_provider_get_issue', {
      id: ticketId
    })
    return this.mapToTicket(result)
  }
}
```

### Step 3: Register Provider

Add configuration option in `quolar.config.ts` types:

```typescript
tickets: {
  provider: 'linear' | 'jira' | 'github-issues' | 'my-provider'
}
```

### Step 4: Document the Provider

Create documentation file at `providers/my-provider.md`.

### Step 5: Write Tests

```typescript
// providers/my-provider/src/adapter.test.ts
describe('MyProviderAdapter', () => {
  it('should read ticket', async () => {
    const adapter = new MyProviderAdapter(mockMcpClient)
    const ticket = await adapter.read('TICKET-123')
    expect(ticket.title).toBeDefined()
  })
})
```

---

## Error Handling

### Provider Unavailable

```typescript
// Graceful degradation example
async function executeStep2_PatternSearch(context: WorkflowContext) {
  const patterns: PatternResult[] = []

  // Always search codebase
  patterns.push(...await searchCodebase(context.ticket))

  // Try DocsProvider if available
  if (context.docsProvider) {
    try {
      patterns.push(...await context.docsProvider.searchPatterns(query))
    } catch (error) {
      console.warn(`DocsProvider unavailable: ${error.message}`)
      // Continue with codebase patterns only
    }
  }

  context.patternLibrary = patterns
}
```

### Authentication Errors

Providers should throw descriptive errors:

```typescript
class ProviderAuthError extends Error {
  constructor(provider: string, hint: string) {
    super(`${provider} authentication failed: ${hint}`)
    this.name = 'ProviderAuthError'
  }
}
```

---

## Provider Documentation Index

1. [Linear Provider](./linear.md) - Default ticket provider
2. [Jira Provider](./jira.md) - Enterprise ticket provider
3. [Quoth Provider](./quoth.md) - Documentation patterns
4. [Exolar Provider](./exolar.md) - Test analytics

---

**Version**: 2.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
