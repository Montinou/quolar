'use client'

import { CodeBlock } from './ui/CodeBlock'
import { GlassCard } from './ui/GlassCard'
import { Zap, FileCode2, AlertCircle } from 'lucide-react'

export function QuickStart() {
  return (
    <section className="section">
      <div className="text-center mb-16">
        <h2 className="section-title">Quick Start Commands</h2>
        <p className="section-subtitle mx-auto">
          Start generating tests in seconds.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Setup Command */}
        <GlassCard variant="quolar">
          <div className="flex items-center gap-3 mb-4">
            <div className="feature-icon">
              <Zap className="w-5 h-5 text-quolar-emerald" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[oklch(0.9_0_0)]">
                First-time Setup
              </h3>
              <p className="text-sm text-[oklch(0.5_0_0)]">
                Run once to configure Quolar
              </p>
            </div>
          </div>

          <CodeBlock
            code="/quolar-setup"
            language="bash"
            showCopy={true}
          />

          <p className="mt-4 text-xs text-[oklch(0.5_0_0)]">
            Interactive wizard to configure MCP servers, create config file, and set up directories.
          </p>
        </GlassCard>

        {/* Test Generation Command */}
        <GlassCard variant="quolar">
          <div className="flex items-center gap-3 mb-4">
            <div className="feature-icon">
              <FileCode2 className="w-5 h-5 text-quolar-emerald" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[oklch(0.9_0_0)]">
                Generate Tests
              </h3>
              <p className="text-sm text-[oklch(0.5_0_0)]">
                Create tests from a Linear ticket
              </p>
            </div>
          </div>

          <CodeBlock
            code={`# Full workflow
/test-ticket ENG-123

# Preview without executing
/test-ticket ENG-456 --dry-run

# Skip PR creation
/test-ticket ENG-789 --skip-pr`}
            language="bash"
            showCopy={true}
          />
        </GlassCard>
      </div>

      {/* Tip */}
      <div className="max-w-3xl mx-auto mt-8">
        <GlassCard className="border-quolar-emerald/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-quolar-emerald flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-[oklch(0.7_0_0)]">
                <strong className="text-quolar-emerald">Pro Tip:</strong> Quolar automatically consults
                Quoth for test patterns. Ensure your project&apos;s patterns are documented for
                best results.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  )
}
