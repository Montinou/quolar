# Jira Provider

**Type**: TicketProvider
**Status**: In Progress
**MCP Server**: `@atlassian/jira-mcp-server` (or REST adapter)

---

## Overview

The Jira provider enables Quolar to work with enterprise Jira installations. It supports both Jira Cloud and Jira Server/Data Center deployments.

**Current Status**: The Jira provider is in active development. Linear remains the recommended default while Jira integration is being stabilized.

---

## Roadmap

### Phase 1: Core Integration (In Progress)

- [ ] Basic ticket reading (`read()`)
- [ ] Ticket updating (`update()`)
- [ ] PR linking (`linkPR()`)
- [ ] Comment creation (`addComment()`)

### Phase 2: Advanced Features (Planned)

- [ ] JQL search support (`search()`)
- [ ] Custom field mapping
- [ ] Sprint/Epic integration
- [ ] Jira Service Management support

### Phase 3: Enterprise Features (Future)

- [ ] Jira Server/Data Center support
- [ ] OAuth 2.0 authentication
- [ ] Webhook integration
- [ ] Automation rules integration

---

## Configuration (Preview)

### quolar.config.ts

```typescript
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  tickets: {
    provider: 'jira',
    baseUrl: 'https://your-org.atlassian.net',
    projectKey: 'ENG',

    // Optional: Custom field IDs for acceptance criteria
    customFields: {
      acceptanceCriteria: 'customfield_10001'
    },

    // Optional: Status mapping
    statusMapping: {
      'To Do': 'pending',
      'In Progress': 'in_progress',
      'Done': 'completed'
    },

    // Optional: Label mapping for test types
    labelMapping: {
      'e2e-test': 'e2e-test',
      'api-test': 'api-test'
    }
  }
})
```

### Environment Variables

```bash
# .env.quolar

# Jira Cloud Authentication
JIRA_BASE_URL=https://your-org.atlassian.net
JIRA_EMAIL=your-email@company.com
JIRA_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxx

# Jira Server/Data Center Authentication (alternative)
# JIRA_PERSONAL_ACCESS_TOKEN=xxxxxxxxxxxxxxxx
```

### MCP Configuration (When Available)

```json
// ~/.claude/mcp.json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@atlassian/jira-mcp-server"],
      "env": {
        "JIRA_BASE_URL": "${JIRA_BASE_URL}",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      }
    }
  }
}
```

---

## Getting Your Jira Token

### Jira Cloud (Recommended)

1. Navigate to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. Name: `Quolar Automation`
4. Click "Create"
5. Copy the token
6. Add to `.env.quolar`:
   ```bash
   JIRA_EMAIL=your-email@company.com
   JIRA_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Jira Server/Data Center

1. Navigate to your profile: `{jira-url}/secure/ViewProfile.jspa`
2. Click "Personal Access Tokens"
3. Click "Create token"
4. Name: `Quolar Automation`
5. Set expiration (recommend 90 days)
6. Copy the token
7. Add to `.env.quolar`:
   ```bash
   JIRA_PERSONAL_ACCESS_TOKEN=xxxxxxxxxxxxxxxx
   ```

---

## Interface Implementation (Planned)

### Ticket Mapping

Jira fields will be mapped to the `Ticket` interface:

```typescript
// Jira API response → Ticket interface
{
  id: issue.id,
  identifier: issue.key,               // e.g., "ENG-123"
  title: issue.fields.summary,
  description: issue.fields.description,
  status: issue.fields.status.name,    // e.g., "In Progress"
  labels: issue.fields.labels,
  assignee: issue.fields.assignee?.displayName,
  team: issue.fields.project?.name,
  linkedPRs: extractPRsFromLinks(issue.fields.issuelinks),
  acceptanceCriteria: parseAC(issue.fields.description, issue.fields.customfield_10001),
  metadata: {
    priority: issue.fields.priority?.name,
    estimate: issue.fields.timeestimate,
    sprint: issue.fields.sprint?.name,
    epic: issue.fields.parent?.key
  }
}
```

### Acceptance Criteria Sources

Jira acceptance criteria can come from multiple sources:

1. **Description field** - Parsed from markdown/wiki markup
2. **Custom field** - Dedicated AC field (configurable)
3. **Checklist plugin** - If using Jira checklist plugins

```typescript
function parseAcceptanceCriteria(
  description: string,
  customField?: string
): string[] {
  // Try custom field first
  if (customField) {
    return parseCustomFieldAC(customField)
  }

  // Fall back to description parsing
  return parseDescriptionAC(description)
}
```

---

## Jira-Specific Features (Planned)

### JQL Search Support

```typescript
// Search with JQL
const tickets = await ticketProvider.search(
  'project = ENG AND labels = "needs-tests" AND status = "Ready for QA"',
  { maxResults: 50 }
)
```

### Sprint Integration

```typescript
// Get tickets from current sprint
const sprintTickets = await ticketProvider.search(
  'project = ENG AND sprint in openSprints()',
  { includeSubtasks: true }
)
```

### Epic Linking

```typescript
// Get all tickets in an epic
const epicTickets = await ticketProvider.search(
  '"Epic Link" = ENG-100',
  { maxResults: 100 }
)
```

---

## Comparison: Linear vs Jira

| Feature | Linear | Jira |
|---------|--------|------|
| Setup complexity | Simple | Moderate |
| MCP support | Native | In progress |
| Custom fields | Limited | Extensive |
| Enterprise SSO | Yes | Yes |
| Self-hosted | No | Yes (Server/DC) |
| Workflow complexity | Simple | Highly configurable |
| API rate limits | Generous | Moderate |

### When to Use Jira

- Enterprise environments with existing Jira investment
- Complex workflow requirements
- Need for extensive custom fields
- Self-hosted requirement (Jira Server/DC)
- Integration with Confluence, Bitbucket

### When to Use Linear

- Startups and small teams
- Simple, fast setup
- Modern API and MCP support
- Better developer experience

---

## Migration from Linear to Jira

If you need to switch from Linear to Jira:

1. **Update configuration:**
   ```typescript
   tickets: {
     provider: 'jira',  // Changed from 'linear'
     baseUrl: 'https://your-org.atlassian.net',
     projectKey: 'ENG'
   }
   ```

2. **Update environment variables:**
   ```bash
   # Remove
   # LINEAR_TOKEN=...

   # Add
   JIRA_BASE_URL=https://your-org.atlassian.net
   JIRA_EMAIL=your-email@company.com
   JIRA_API_TOKEN=your-token
   ```

3. **Update MCP configuration** (when Jira MCP is available)

4. **Test connection:**
   ```bash
   npx quolar test-connection --provider jira
   ```

---

## Troubleshooting

### Authentication Errors

```bash
# Test Jira connection directly
curl -u your-email@company.com:$JIRA_API_TOKEN \
  https://your-org.atlassian.net/rest/api/3/myself

# Should return your user profile
```

### Permission Issues

Ensure your Jira user has:
- Browse Projects permission
- Edit Issues permission (for updates)
- Add Comments permission

### Custom Field Not Found

```bash
# List available custom fields
curl -u your-email@company.com:$JIRA_API_TOKEN \
  https://your-org.atlassian.net/rest/api/3/field | jq '.[] | {id, name}'

# Find your acceptance criteria field ID
```

---

## Contributing

The Jira provider is actively being developed. Contributions are welcome:

1. **Report issues**: https://github.com/attorneyshare/quolar/issues
2. **Submit PRs**: Implement missing features
3. **Test with your Jira**: Report compatibility issues

### Development Setup

```bash
# Clone the repo
git clone https://github.com/attorneyshare/quolar.git
cd quolar

# Install dependencies
yarn install

# Run Jira provider tests
yarn test:providers:jira
```

---

## Related Documentation

- [Linear Provider](./linear.md) - Default ticket provider
- [Architecture](../architecture.md) - Provider abstraction layer
- [Installation](../installation.md) - Setup instructions

---

**Version**: 2.0
**Status**: In Progress
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
