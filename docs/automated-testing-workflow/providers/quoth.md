# Quoth Provider

**Type**: DocsProvider
**Status**: Stable (Default)
**MCP Server**: `@quoth/mcp-server`

---

## Overview

The Quoth provider integrates with the Quoth documentation system to provide AI-optimized pattern search and template retrieval. Quoth acts as a "Single Source of Truth" for documented patterns, preventing AI hallucinations by enforcing canonical examples.

---

## Configuration

### quolar.config.ts

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  documentation: {
    provider: 'quoth',
    endpoint: 'https://quoth.ai-innovation.site/api/mcp',

    // Optional: Filter by categories
    categories: ['patterns', 'architecture'],

    // Optional: Minimum relevance score (0-1)
    minRelevance: 0.5
  }
})
```

### Environment Variables

```bash
# .env.quolar
QUOTH_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### MCP Configuration

```json
// ~/.claude/mcp.json
{
  "mcpServers": {
    "quoth": {
      "command": "npx",
      "args": ["-y", "@quoth/mcp-server"],
      "env": {
        "QUOTH_API_KEY": "${QUOTH_API_KEY}",
        "QUOTH_PROJECT_PATH": "/path/to/your/project"
      }
    }
  }
}
```

---

## Interface Implementation

### Supported Operations

| Method | MCP Tool | Description |
|--------|----------|-------------|
| `searchPatterns()` | `quoth_search_index` | Semantic search for patterns |
| `readDocument()` | `quoth_read_doc` | Get full document content |
| `listTemplates()` | `quoth_list_templates` | List available templates |
| `getTemplate()` | `quoth_get_template` | Get template content |
| `proposeUpdate()` | `quoth_propose_update` | Suggest doc updates |

### Pattern Search

```typescript
// Search for relevant patterns
const patterns = await docsProvider.searchPatterns(
  'playwright authentication test patterns'
)

// Returns:
// [
//   {
//     id: 'patterns/e2e-authentication',
//     title: 'E2E Authentication Testing Patterns',
//     content: '...',
//     relevance: 0.92,
//     source: 'patterns/e2e-authentication.md',
//     category: 'patterns'
//   },
//   ...
// ]
```

### Document Reading

```typescript
// Read full document
const doc = await docsProvider.readDocument('patterns/e2e-authentication')

// Returns:
// {
//   id: 'patterns/e2e-authentication',
//   title: 'E2E Authentication Testing Patterns',
//   content: '# E2E Authentication Testing\n\n## Login Flow...',
//   metadata: { category: 'patterns', lastUpdated: '2026-01-15' },
//   lastUpdated: Date
// }
```

### Template Retrieval

```typescript
// List templates
const templates = await docsProvider.listTemplates('patterns')
// Returns: ['e2e-test', 'api-test', 'unit-test', ...]

// Get specific template
const template = await docsProvider.getTemplate('e2e-test')
// Returns Handlebars template content
```

---

## Workflow Integration

### Step 2: Pattern Search

Quoth is used to find relevant test patterns:

```typescript
async function executeStep2_PatternSearch(context: WorkflowContext) {
  const patterns: PatternResult[] = []

  // Always search codebase first
  const codebasePatterns = await searchCodebase(context.ticket)
  patterns.push(...codebasePatterns)

  // Enhance with Quoth patterns if available
  if (context.docsProvider) {
    try {
      const quothPatterns = await context.docsProvider.searchPatterns(
        `${context.ticket.title} test patterns`
      )
      patterns.push(...quothPatterns)
    } catch (error) {
      console.warn('Quoth unavailable, using codebase patterns only')
    }
  }

  context.patternLibrary = patterns
}
```

### Step 4: Test Generation

Quoth templates are used for consistent test structure:

```typescript
async function generateTest(context: WorkflowContext, scenario: TestScenario) {
  // Get template from Quoth
  const template = await context.docsProvider?.getTemplate('e2e-test')
    ?? getDefaultTemplate()

  // Apply template with scenario data
  const testCode = applyTemplate(template, {
    testName: scenario.name,
    steps: scenario.steps,
    assertions: scenario.assertions
  })

  return testCode
}
```

---

## Document Categories

Quoth organizes documentation into categories:

### Architecture

High-level system documentation:
- `project-overview.md` - System overview, tech stack
- `repo-structure.md` - Folder organization
- `tech-stack.md` - Dependencies, frameworks

### Patterns

Canonical code examples:
- `testing-patterns.md` - Vitest/Playwright examples
- `coding-conventions.md` - Code style, naming
- `error-handling.md` - Error boundaries, try-catch
- `security-patterns.md` - Auth, validation, RBAC

### Contracts

API and data specifications:
- `api-schemas.md` - REST/GraphQL endpoints
- `database-models.md` - Tables, relations, RLS
- `shared-types.md` - TypeScript interfaces

---

## Graceful Degradation

Quoth is an **optional** provider. When unavailable, Quolar falls back to codebase search:

```typescript
async function searchPatterns(query: string): Promise<PatternResult[]> {
  const results: PatternResult[] = []

  // Try Quoth first
  if (this.docsProvider) {
    try {
      results.push(...await this.docsProvider.searchPatterns(query))
    } catch (error) {
      console.warn(`Quoth unavailable: ${error.message}`)
    }
  }

  // Always supplement with codebase search
  const codebaseResults = await this.searchCodebase(query)
  results.push(...codebaseResults)

  // Deduplicate and sort by relevance
  return deduplicateByRelevance(results)
}
```

### Fallback Behavior

| Quoth Status | Behavior |
|--------------|----------|
| Available | Full pattern search + templates |
| Unavailable | Codebase Glob/Grep only |
| Partial (some docs) | Mixed sources |

---

## Verification

```bash
# Test Quoth connection
npx quolar test-connection --provider quoth

# Expected output:
# ✓ Quoth API connected
# ✓ Documents indexed: 156
# ✓ Templates available: 12
# ✓ Categories: architecture, patterns, contracts
```

### Manual MCP Test

```bash
# Test Quoth MCP directly
claude-code

# In Claude Code session:
# "Search Quoth for playwright authentication patterns"

# Should return relevant documentation results
```

---

## Best Practices

### 1. Keep Documentation Updated

Use Quoth's propose update feature:

```typescript
await docsProvider.proposeUpdate(
  'patterns/e2e-authentication',
  updatedContent,
  'Added new session persistence test pattern'
)
```

### 2. Use Consistent Chunk Boundaries

Structure documents with clear sections for better semantic search:

```markdown
# Pattern Title

## Problem
What problem does this solve?

## Solution
The canonical approach.

## Example
```typescript
// Code example
```

## When to Use
When is this pattern appropriate?
```

### 3. Tag Documents Appropriately

Use frontmatter for better categorization:

```markdown
---
title: E2E Authentication Patterns
category: patterns
tags: [playwright, authentication, e2e]
lastUpdated: 2026-01-17
---
```

---

## Troubleshooting

### Search Returns No Results

1. Check Quoth connection:
   ```bash
   npx quolar test-connection --provider quoth
   ```

2. Verify documents are indexed:
   ```bash
   # In Claude Code
   "List all Quoth documents"
   ```

3. Try broader search terms

### MCP Server Not Starting

```bash
# Test MCP server directly
npx @quoth/mcp-server --help

# Clear cache and reload
rm -rf ~/.claude/mcp-cache
claude-code reload
```

### Low Relevance Scores

- Add more specific search terms
- Update document content with relevant keywords
- Check document chunk boundaries

---

## Related Documentation

- [Architecture](../architecture.md) - Provider abstraction layer
- [Installation](../installation.md) - Setup instructions
- [Linear Provider](./linear.md) - Ticket provider

---

**Version**: 2.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
