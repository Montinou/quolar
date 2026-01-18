'use client'

import { CheckCircle2 } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const workflowSteps = [
  {
    step: 1,
    title: 'Analyze Ticket',
    description: 'Read Linear ticket details, extract requirements and acceptance criteria',
    status: 'complete',
  },
  {
    step: 2,
    title: 'Search Patterns',
    description: 'Query Quoth for existing test patterns, locators, and conventions',
    status: 'complete',
  },
  {
    step: 3,
    title: 'Plan Tests',
    description: 'Create test scenarios and document the testing strategy',
    status: 'complete',
  },
  {
    step: 4,
    title: 'Generate Code',
    description: 'Write Playwright tests following project patterns',
    status: 'complete',
  },
  {
    step: 5,
    title: 'Execute & Heal',
    description: 'Run tests and auto-fix failures (up to 3 attempts)',
    status: 'complete',
  },
  {
    step: 6,
    title: 'Update CI',
    description: 'Configure GitHub Actions to run new tests',
    status: 'complete',
  },
  {
    step: 7,
    title: 'Create PR',
    description: 'Open pull request with linked Linear ticket',
    status: 'complete',
  },
]

export function WorkflowDiagram() {
  return (
    <section className="section">
      <div className="text-center mb-16">
        <h2 className="section-title">7-Step Workflow</h2>
        <p className="section-subtitle mx-auto">
          From ticket to pull request, fully automated.
        </p>
      </div>

      <GlassCard variant="quolar" className="relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 100%, oklch(0.70 0.17 160 / 0.1), transparent)'
          }}
        />

        <div className="relative grid md:grid-cols-7 gap-4 md:gap-2">
          {workflowSteps.map((item, index) => (
            <div key={item.step} className="relative group">
              {/* Connection line */}
              {index < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-6 left-full w-full h-[2px] bg-gradient-to-r from-quolar-emerald/40 to-quolar-emerald/10 z-0" />
              )}

              {/* Step content */}
              <div className="relative z-10 text-center p-3">
                {/* Step number */}
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-quolar-emerald/20 border border-quolar-emerald/40 flex items-center justify-center group-hover:bg-quolar-emerald/30 transition-colors">
                  <span className="text-quolar-emerald font-bold text-lg">
                    {item.step}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-semibold text-[oklch(0.85_0_0)] mb-1">
                  {item.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-[oklch(0.5_0_0)] leading-relaxed hidden md:block">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile descriptions */}
        <div className="md:hidden mt-6 space-y-4 border-t border-[oklch(1_0_0_/_0.1)] pt-6">
          {workflowSteps.map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-quolar-emerald flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-[oklch(0.8_0_0)]">
                  Step {item.step}: {item.title}
                </span>
                <p className="text-xs text-[oklch(0.5_0_0)] mt-0.5">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </section>
  )
}
