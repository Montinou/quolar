# Quolar Installation Guide

**Version**: 2.0
**Last Updated**: 2026-01-17

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Configuration File](#configuration-file)
4. [Environment Setup](#environment-setup)
5. [MCP Configuration](#mcp-configuration)
6. [Provider Setup](#provider-setup)
7. [Verification](#verification)
8. [Troubleshooting Setup](#troubleshooting-setup)

---

## Prerequisites

### System Requirements

**Operating System**:
- macOS (tested on macOS 14+)
- Linux (Ubuntu 20.04+, Debian 11+)
- Windows (via WSL2)

**Required Software**:

| Software | Minimum Version | Installation |
|----------|----------------|--------------|
| Node.js | 22.0.0 | `brew install node@22` |
| Yarn | 1.22.0 | `npm install -g yarn` |
| Git | 2.30.0 | `brew install git` |
| GitHub CLI | 2.20.0 | `brew install gh` |
| Claude Code | Latest | `npm install -g @anthropic/claude-code` |

**Optional Software**:
- Docker (for local Exolar dashboard)
- PostgreSQL client (for database debugging)

### Account Requirements

**Required Accounts**:

1. **Ticket Provider** (one of):
   - **Linear** (default) - Create account at https://linear.app
   - **Jira** (enterprise) - Your organization's Jira instance
   - **GitHub Issues** - Use existing GitHub account

2. **GitHub** - For repository access
   - Ensure you have write access to the repository
   - Generate Personal Access Token: Settings → Developer settings → Personal access tokens
   - Scopes needed: `repo`, `workflow`, `write:packages`

**Optional Accounts**:

3. **Exolar Dashboard** - For test analytics and auto-healing
   - Access at https://exolar.ai-innovation.site
   - Request API key from QA team

4. **Quoth** - For documentation patterns
   - Usually project-local, no separate account needed

---

## Installation Methods

### Method 1: Claude Code Skill (Recommended)

**Step 1: Install the skill**

```bash
# Create Claude Code skills directory
mkdir -p ~/.claude/skills

# Clone the Quolar skill
cd ~/.claude/skills
git clone https://github.com/attorneyshare/quolar.git quolar
```

**Step 2: Verify skill structure**

```bash
ls -la ~/.claude/skills/quolar/

# Expected structure:
# skill.json              # Skill metadata
# README.md              # Documentation
# workflow/              # Workflow orchestration
# agents/                # Agent definitions
# templates/             # Test templates
# providers/             # Provider adapters
# config/                # Default configuration
```

**Step 3: Reload Claude Code**

```bash
# Restart Claude Code to load new skill
claude-code reload

# Verify skill is loaded
claude-code skills list

# Expected output:
# Available skills:
#   - quolar v2.0.0 (Modular AI Test Automation Framework)
```

### Method 2: npm Package (Global)

```bash
# Install globally
npm install -g @attorneyshare/quolar

# Initialize configuration in your project
cd /path/to/your/project
npx quolar init

# This creates:
# - quolar.config.ts (configuration file)
# - .env.quolar.example (environment template)
```

### Method 3: Project-Local Installation

For project-specific customization:

```bash
# Navigate to project
cd /path/to/your/project

# Install as dev dependency
npm install --save-dev @attorneyshare/quolar

# Or with yarn
yarn add --dev @attorneyshare/quolar

# Initialize configuration
npx quolar init
```

### Method 4: Manual Setup (Development)

For contributing to Quolar development:

```bash
# Clone Quolar repository
git clone https://github.com/attorneyshare/quolar.git
cd quolar

# Install dependencies
yarn install

# Build packages
yarn build

# Link for local development
yarn link

# In your project
cd /path/to/your/project
yarn link @attorneyshare/quolar
```

---

## Configuration File

Quolar uses a TypeScript configuration file for type-safe provider setup.

### Creating Configuration

Create `quolar.config.ts` in your project root:

```typescript
// quolar.config.ts
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  // ═══════════════════════════════════════════════════════════════
  // REQUIRED: Test Framework Configuration
  // ═══════════════════════════════════════════════════════════════
  testFramework: {
    provider: 'playwright',        // 'playwright' | 'vitest' | 'cypress'
    config: './playwright.config.ts',
    testDir: './automation/playwright/tests',
    pageObjectsDir: './automation/playwright/page-objects'
  },

  // ═══════════════════════════════════════════════════════════════
  // REQUIRED: Ticket Provider Configuration
  // ═══════════════════════════════════════════════════════════════
  tickets: {
    provider: 'linear',            // 'linear' | 'jira' | 'github-issues'

    // Linear-specific options
    workspace: 'attorney-share',

    // Jira-specific options (when provider: 'jira')
    // baseUrl: 'https://your-org.atlassian.net',
    // projectKey: 'ENG',

    // GitHub Issues options (when provider: 'github-issues')
    // owner: 'your-org',
    // repo: 'your-repo',
  },

  // ═══════════════════════════════════════════════════════════════
  // OPTIONAL: Documentation Provider Configuration
  // Falls back to codebase search if not configured
  // ═══════════════════════════════════════════════════════════════
  documentation: {
    provider: 'quoth',             // 'quoth' | 'confluence' | 'notion' | null
    endpoint: 'https://quoth.ai-innovation.site/api/mcp',

    // Confluence options (when provider: 'confluence')
    // baseUrl: 'https://your-org.atlassian.net/wiki',
    // spaceKey: 'DEV',
  },

  // ═══════════════════════════════════════════════════════════════
  // OPTIONAL: Analytics Provider Configuration
  // Falls back to basic logging if not configured
  // ═══════════════════════════════════════════════════════════════
  analytics: {
    provider: 'exolar',            // 'exolar' | 'datadog' | 'allure' | null
    endpoint: 'https://exolar.ai-innovation.site/api/mcp',

    // DataDog options (when provider: 'datadog')
    // apiKey: process.env.DD_API_KEY,
    // appKey: process.env.DD_APP_KEY,
  },

  // ═══════════════════════════════════════════════════════════════
  // VCS Provider Configuration (auto-detected by default)
  // ═══════════════════════════════════════════════════════════════
  vcs: {
    provider: 'github',            // 'github' | 'gitlab' | 'bitbucket'
    ciSystem: 'github-actions',    // 'github-actions' | 'gitlab-ci' | 'jenkins'
  },

  // ═══════════════════════════════════════════════════════════════
  // Workflow Settings
  // ═══════════════════════════════════════════════════════════════
  workflow: {
    maxRetries: 3,                 // Max auto-healing attempts
    autoHealingThreshold: 70,      // Min confidence % to auto-heal
    parallelAgents: 3,             // Max parallel test-writer agents
    branchPrefix: 'test/',         // Git branch prefix
    commitPrefix: 'test:',         // Commit message prefix
  },

  // ═══════════════════════════════════════════════════════════════
  // Test Execution Settings
  // ═══════════════════════════════════════════════════════════════
  execution: {
    defaultProject: 'chrome',      // Playwright project
    defaultWorkers: 4,             // Parallel workers
    timeout: 60000,                // Test timeout in ms
    retries: 2,                    // Playwright retries
  },

  // ═══════════════════════════════════════════════════════════════
  // Output Settings
  // ═══════════════════════════════════════════════════════════════
  output: {
    analysisDir: './docs/test-analysis',
    plansDir: './docs/test-plans',
    verbose: false,
  }
})
```

### Minimal Configuration

For quick setup with defaults:

```typescript
// quolar.config.ts (minimal)
import { defineConfig } from '@attorneyshare/quolar'

export default defineConfig({
  testFramework: {
    provider: 'playwright',
    config: './playwright.config.ts',
    testDir: './tests'
  },
  tickets: {
    provider: 'linear',
    workspace: 'your-workspace'
  }
})
```

### Configuration Validation

Quolar validates configuration on startup:

```bash
# Validate configuration
npx quolar validate

# Output:
# ✓ Configuration file found: quolar.config.ts
# ✓ Test framework: playwright (valid)
# ✓ Ticket provider: linear (valid)
# ✓ Documentation provider: quoth (optional, valid)
# ✓ Analytics provider: exolar (optional, valid)
# ✓ VCS provider: github (auto-detected)
#
# Configuration is valid!
```

---

## Environment Setup

### Step 1: Create Environment File

```bash
cd /path/to/your/project
cp .env.quolar.example .env.quolar

# Or create manually
touch .env.quolar
```

### Step 2: Configure Environment Variables

```bash
# .env.quolar
# ═══════════════════════════════════════════════════════════════
# REQUIRED ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════

# GitHub Configuration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Ticket Provider (choose one based on your config)
# Linear
LINEAR_TOKEN=<YOUR_LINEAR_API_KEY>

# Jira (if using Jira provider)
# JIRA_EMAIL=your-email@company.com
# JIRA_API_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxx

# ═══════════════════════════════════════════════════════════════
# OPTIONAL ENVIRONMENT VARIABLES
# ═══════════════════════════════════════════════════════════════

# Exolar Dashboard (for test analytics and auto-healing)
DASHBOARD_URL=https://exolar.ai-innovation.site
DASHBOARD_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Quoth MCP (for documentation patterns)
QUOTH_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ═══════════════════════════════════════════════════════════════
# TEST ENVIRONMENT CONFIGURATION
# ═══════════════════════════════════════════════════════════════

# Frontend URL (for E2E tests)
FRONTEND_URL=https://app.yoursite.com

# Backend URL (for API tests)
BACKEND_URL=https://api.yoursite.com/graphql
```

### Step 3: Secure Environment File

```bash
# Add to .gitignore
echo ".env.quolar" >> .gitignore

# Verify not tracked
git status .env.quolar
# Should show: nothing to commit

# Set proper permissions
chmod 600 .env.quolar
```

---

## MCP Configuration

Quolar uses MCP (Model Context Protocol) servers for provider integrations.

### Step 1: Locate MCP Configuration

Claude Code MCP configuration is at:
```bash
~/.claude/mcp.json
```

### Step 2: Configure MCPs Based on Providers

**For Linear + Quoth + Exolar (Default Stack):**

```json
{
  "mcpServers": {
    "linear": {
      "command": "npx",
      "args": ["-y", "@linear/mcp-server"],
      "env": {
        "LINEAR_API_KEY": "${LINEAR_TOKEN}"
      }
    },
    "exolar-qa": {
      "transport": "http",
      "url": "https://exolar.ai-innovation.site/api/mcp/mcp",
      "headers": {
        "Authorization": "Bearer ${DASHBOARD_API_KEY}"
      }
    },
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

**For Jira (Enterprise Alternative):**

```json
{
  "mcpServers": {
    "jira": {
      "command": "npx",
      "args": ["-y", "@atlassian/jira-mcp-server"],
      "env": {
        "JIRA_BASE_URL": "https://your-org.atlassian.net",
        "JIRA_EMAIL": "${JIRA_EMAIL}",
        "JIRA_API_TOKEN": "${JIRA_API_TOKEN}"
      }
    }
  }
}
```

### Step 3: Install MCP Dependencies

```bash
# Linear MCP (auto-installed via npx)
npx @linear/mcp-server --version

# Verify MCP health
claude-code --verbose
# Should show:
# ✓ Loaded MCP: linear
# ✓ Loaded MCP: exolar-qa
# ✓ Loaded MCP: quoth
```

---

## Provider Setup

### Linear Provider (Default)

**1. Get Linear API Token:**
- Navigate to https://linear.app/settings/api
- Click "Create new personal API key"
- Name: `Quolar Automation`
- Copy token to `.env.quolar`

**2. Verify Connection:**
```bash
npx quolar test-connection --provider linear

# Output:
# ✓ Linear API connected
# ✓ Workspace: attorney-share
# ✓ User: your-name
# ✓ Teams accessible: 3
```

### Jira Provider (Enterprise)

**1. Get Jira API Token:**
- Navigate to https://id.atlassian.com/manage-profile/security/api-tokens
- Click "Create API token"
- Name: `Quolar Automation`
- Copy token to `.env.quolar`

**2. Configure Jira in quolar.config.ts:**
```typescript
tickets: {
  provider: 'jira',
  baseUrl: 'https://your-org.atlassian.net',
  projectKey: 'ENG',
}
```

**3. Verify Connection:**
```bash
npx quolar test-connection --provider jira

# Output:
# ✓ Jira API connected
# ✓ Base URL: https://your-org.atlassian.net
# ✓ Project: ENG (Engineering)
# ✓ User: your-email@company.com
```

### Exolar Provider (Analytics)

**1. Request API Key:**
- Contact QA team lead
- Request API key for Exolar dashboard
- Receive key via secure channel

**2. Verify Connection:**
```bash
npx quolar test-connection --provider exolar

# Output:
# ✓ Exolar API connected
# ✓ Dashboard: https://exolar.ai-innovation.site
# ✓ Recent executions: 42
```

### Quoth Provider (Documentation)

**1. Configure Quoth MCP** (see MCP Configuration above)

**2. Verify Connection:**
```bash
npx quolar test-connection --provider quoth

# Output:
# ✓ Quoth API connected
# ✓ Documents indexed: 156
# ✓ Templates available: 12
```

---

## Verification

### Step 1: Verify Prerequisites

```bash
#!/bin/bash
# verify-quolar.sh

echo "Checking Quolar prerequisites..."

# Node.js
node_version=$(node --version | cut -d'v' -f2)
if [ "$(printf '%s\n' "22.0.0" "$node_version" | sort -V | head -n1)" = "22.0.0" ]; then
  echo "✅ Node.js: $node_version"
else
  echo "❌ Node.js: $node_version (need >= 22.0.0)"
fi

# Yarn
if command -v yarn &> /dev/null; then
  echo "✅ Yarn: $(yarn --version)"
else
  echo "❌ Yarn: not installed"
fi

# GitHub CLI
if command -v gh &> /dev/null; then
  echo "✅ GitHub CLI: $(gh --version | head -n1)"

  # Check authentication
  if gh auth status &> /dev/null; then
    echo "✅ GitHub CLI: authenticated"
  else
    echo "❌ GitHub CLI: not authenticated (run: gh auth login)"
  fi
else
  echo "❌ GitHub CLI: not installed"
fi

# Claude Code
if command -v claude-code &> /dev/null; then
  echo "✅ Claude Code: installed"
else
  echo "❌ Claude Code: not installed"
fi

# Quolar configuration
if [ -f "quolar.config.ts" ]; then
  echo "✅ quolar.config.ts: found"
else
  echo "❌ quolar.config.ts: missing (run: npx quolar init)"
fi

# Environment file
if [ -f ".env.quolar" ]; then
  echo "✅ .env.quolar: found"
else
  echo "❌ .env.quolar: missing"
fi
```

### Step 2: Verify All Providers

```bash
# Test all configured providers
npx quolar test-connection --all

# Output:
# Testing provider connections...
#
# Ticket Provider (linear):
# ✓ Connected to Linear API
# ✓ Workspace: attorney-share
#
# Documentation Provider (quoth):
# ✓ Connected to Quoth API
# ✓ 156 documents indexed
#
# Analytics Provider (exolar):
# ✓ Connected to Exolar API
# ✓ Dashboard accessible
#
# VCS Provider (github):
# ✓ GitHub CLI authenticated
# ✓ Repository access confirmed
#
# Test Framework (playwright):
# ✓ Playwright config found
# ✓ Test directory exists
#
# All providers connected successfully!
```

### Step 3: Run Test Workflow

```bash
# Start Claude Code
claude-code

# Run the workflow with a test ticket
/test-ticket TEST-001

# Verify each step completes:
# ✓ Step 1: Ticket analysis (via TicketProvider)
# ✓ Step 2: Pattern search (via DocsProvider)
# ✓ Step 3: Test planning
# ✓ Step 4: Test generation (via TestFrameworkProvider)
# ✓ Step 5: Execution loop (via AnalyticsProvider)
# ✓ Step 6: CI integration (via VCSProvider)
# ✓ Step 7: PR creation (via VCSProvider, TicketProvider)
```

---

## Troubleshooting Setup

### Issue 1: Configuration File Not Found

**Symptom**:
```
Error: Could not find quolar.config.ts
```

**Solution**:
```bash
# Initialize configuration
npx quolar init

# Or create manually with defineConfig
```

### Issue 2: Provider Connection Failed

**Symptom**:
```
Error: Failed to connect to Linear API
```

**Solution**:
```bash
# Verify token is set
echo $LINEAR_TOKEN

# Test token directly
curl -H "Authorization: Bearer $LINEAR_TOKEN" \
  https://api.linear.app/graphql \
  -d '{"query": "{ viewer { name } }"}'

# If invalid, regenerate in Linear settings
```

### Issue 3: MCP Server Failed to Start

**Symptom**:
```
Error: MCP server 'linear' failed to start
```

**Solution**:
```bash
# Clear MCP cache
rm -rf ~/.claude/mcp-cache

# Test MCP server directly
npx @linear/mcp-server --test

# Reload Claude Code
claude-code reload
```

### Issue 4: Skill Not Found

**Symptom**:
```
Error: Unknown command: /test-ticket
```

**Solution**:
```bash
# Verify skill installation
ls ~/.claude/skills/quolar/

# If missing, reinstall
cd ~/.claude/skills
git clone https://github.com/attorneyshare/quolar.git quolar

# Reload Claude Code
claude-code reload
```

### Issue 5: Provider Fallback Mode

**Symptom**:
```
Warning: DocsProvider unavailable, using codebase search only
```

**This is expected behavior** when optional providers are not configured.
Quolar will continue with reduced functionality.

To resolve:
1. Configure the missing provider in `quolar.config.ts`
2. Add required environment variables
3. Configure MCP server if needed

---

## Post-Installation

### Recommended Setup

**1. Add Git Aliases:**
```bash
# Add to ~/.gitconfig
[alias]
  quolar-branch = "!f() { git checkout -b test/TICKET-$1-automated-tests; }; f"
```

**2. Configure Editor Integration:**
```bash
# VS Code
export EDITOR="code --wait"
```

**3. Create Shell Aliases:**
```bash
# Add to ~/.zshrc or ~/.bashrc
alias qt="npx quolar test-connection --all"
alias qv="npx quolar validate"
```

### Next Steps

After installation is complete:

1. Read [Usage Guide](./usage-guide.md) for command syntax
2. Review [Provider Documentation](./providers/README.md)
3. Explore [Configuration Reference](./configuration-reference.md)
4. Try a test run with a real ticket

---

## Maintenance

### Updating Quolar

```bash
# Via npm
npm update -g @attorneyshare/quolar

# Via skill
cd ~/.claude/skills/quolar
git pull origin main
claude-code reload
```

### Rotating API Keys

Rotate API keys every 90 days:

```bash
# 1. Generate new tokens in respective services
# 2. Update .env.quolar
# 3. Test connections
npx quolar test-connection --all
# 4. Delete old tokens from services
```

---

## Support

**Documentation**:
- [README](./README.md) - Overview and quick start
- [Architecture](./architecture.md) - System design
- [Providers](./providers/README.md) - Provider configuration
- [Troubleshooting](./troubleshooting.md) - Common issues

**Community**:
- GitHub Issues: https://github.com/attorneyshare/quolar/issues
- Internal Slack: #qa-automation

---

**Version**: 2.0
**Last Updated**: 2026-01-17
**Maintainer**: AttorneyShare QA Tools Team
