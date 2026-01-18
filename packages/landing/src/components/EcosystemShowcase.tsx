'use client'

import { BookText, TestTube2, BarChart3, ArrowRight } from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const ecosystemItems = [
  {
    name: 'Quoth',
    description: 'Documentation & Patterns',
    subtitle: 'Single source of truth for test patterns',
    icon: BookText,
    variant: 'quoth' as const,
    color: 'text-quoth-violet',
    glowClass: 'text-glow-violet',
  },
  {
    name: 'Quolar',
    description: 'Test Automation',
    subtitle: 'Convert tickets to self-healing tests',
    icon: TestTube2,
    variant: 'quolar' as const,
    color: 'text-quolar-emerald',
    glowClass: 'text-glow-emerald',
  },
  {
    name: 'Exolar',
    description: 'Test Analytics',
    subtitle: 'Track and analyze test results',
    icon: BarChart3,
    variant: 'exolar' as const,
    color: 'text-exolar-cyan',
    glowClass: 'text-glow-cyan',
  },
]

export function EcosystemShowcase() {
  return (
    <section className="section">
      <div className="text-center mb-16">
        <h2 className="section-title">The Ecosystem</h2>
        <p className="section-subtitle mx-auto">
          Quolar integrates seamlessly with Quoth and Exolar to provide a complete test automation workflow.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 relative">
        {/* Connection lines for desktop */}
        <div className="hidden md:block absolute top-1/2 left-[33%] right-[33%] h-[2px] bg-gradient-to-r from-quoth-violet via-quolar-emerald to-exolar-cyan opacity-30" />

        {ecosystemItems.map((item, index) => (
          <GlassCard key={item.name} variant={item.variant} className="relative">
            {/* Arrow between cards on mobile */}
            {index < ecosystemItems.length - 1 && (
              <div className="md:hidden absolute -bottom-6 left-1/2 -translate-x-1/2">
                <ArrowRight className="w-5 h-5 text-[oklch(0.4_0_0)] rotate-90" />
              </div>
            )}

            <div className={`feature-icon mb-4 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>

            <h3 className={`text-2xl font-bold mb-2 ${item.color} ${item.glowClass}`}>
              {item.name}
            </h3>

            <p className="text-lg font-medium text-[oklch(0.8_0_0)] mb-2">
              {item.description}
            </p>

            <p className="text-sm text-[oklch(0.5_0_0)]">
              {item.subtitle}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* Integration flow */}
      <div className="mt-16 text-center">
        <p className="text-[oklch(0.5_0_0)] text-sm">
          <span className="text-quoth-violet">Quoth</span>
          {' '}<span className="text-[oklch(0.3_0_0)]">provides patterns</span>{' '}
          <ArrowRight className="w-4 h-4 inline mx-1 text-[oklch(0.3_0_0)]" />
          {' '}<span className="text-quolar-emerald">Quolar</span>
          {' '}<span className="text-[oklch(0.3_0_0)]">generates tests</span>{' '}
          <ArrowRight className="w-4 h-4 inline mx-1 text-[oklch(0.3_0_0)]" />
          {' '}<span className="text-exolar-cyan">Exolar</span>
          {' '}<span className="text-[oklch(0.3_0_0)]">tracks results</span>
        </p>
      </div>
    </section>
  )
}
