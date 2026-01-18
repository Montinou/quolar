'use client'

import { useState } from 'react'
import { Terminal, Settings, Play } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'
import { CodeBlock } from './ui/CodeBlock'

const tabs = [
  {
    id: 'clone',
    label: 'Clone Plugin',
    icon: Terminal,
    content: {
      title: '1. Clone the Quolar Plugin',
      description: 'Add Quolar to your Claude Code installation:',
      code: `# Clone the repository
git clone https://github.com/Montinou/quolar.git ~/.claude/plugins/quolar

# Or add as a submodule in your project
git submodule add https://github.com/Montinou/quolar.git .claude-plugin/quolar`,
    },
  },
  {
    id: 'mcp',
    label: 'Configure MCP',
    icon: Settings,
    content: {
      title: '2. Configure MCP Servers',
      description: 'Ensure required MCP servers are connected:',
      code: `# Check connected servers
/mcp

# Required: Linear MCP (add to ~/.claude/settings.json)
{
  "linear": {
    "command": "npx",
    "args": ["-y", "@linear/mcp-server"],
    "env": { "LINEAR_API_KEY": "lin_api_xxx" }
  }
}

# Required: Quoth MCP
claude mcp add --transport http quoth https://quoth.ai-innovation.site/api/mcp

# Optional: Exolar MCP
claude mcp add exolar-qa --transport http https://exolar.ai-innovation.site/api/mcp/mcp -s user`,
    },
  },
  {
    id: 'setup',
    label: 'Run Setup',
    icon: Play,
    content: {
      title: '3. Run the Setup Wizard',
      description: 'Use the interactive setup command to configure Quolar:',
      code: `/quolar-setup`,
      note: 'The setup wizard will:\n- Validate MCP server connections\n- Create quolar.config.ts\n- Set up test directories\n- Verify Linear workspace access',
    },
  },
]

export function SetupInstructions() {
  const [activeTab, setActiveTab] = useState('clone')
  const activeContent = tabs.find(t => t.id === activeTab)?.content

  return (
    <section id="setup" className="section bg-gradient-void">
      <div className="text-center mb-16">
        <h2 className="section-title">Quick Setup</h2>
        <p className="section-subtitle mx-auto">
          Get started with Quolar in three simple steps.
        </p>
      </div>

      <GlassCard variant="quolar" className="max-w-4xl mx-auto">
        {/* Tab headers */}
        <div className="flex border-b border-[oklch(1_0_0_/_0.1)] mb-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id ? 'tab-active' : ''
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeContent && (
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold text-[oklch(0.9_0_0)] mb-2">
              {activeContent.title}
            </h3>
            <p className="text-[oklch(0.55_0_0)] mb-4">
              {activeContent.description}
            </p>

            <CodeBlock
              code={activeContent.code}
              language="bash"
              showCopy={true}
            />

            {activeContent.note && (
              <div className="mt-4 p-4 rounded-lg bg-quolar-emerald/10 border border-quolar-emerald/20">
                <p className="text-sm text-[oklch(0.7_0_0)] whitespace-pre-line">
                  {activeContent.note}
                </p>
              </div>
            )}
          </div>
        )}
      </GlassCard>
    </section>
  )
}
