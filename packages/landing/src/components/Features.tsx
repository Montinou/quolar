'use client'

import {
  FileSearch,
  Search,
  Code2,
  RefreshCw,
  GitBranch,
  GitPullRequest
} from 'lucide-react'
import { GlassCard } from './ui/GlassCard'

const features = [
  {
    icon: FileSearch,
    title: 'Ticket Analysis',
    description: 'Automatically reads Linear tickets and extracts test requirements, acceptance criteria, and user flows.',
  },
  {
    icon: Search,
    title: 'Pattern Search',
    description: 'Consults Quoth documentation for existing test patterns, locators, and best practices.',
  },
  {
    icon: Code2,
    title: 'Test Generation',
    description: 'Generates Playwright E2E tests following project conventions and documented patterns.',
  },
  {
    icon: RefreshCw,
    title: 'Self-Healing',
    description: 'Automatically fixes failing tests with up to 3 retry attempts, adapting to UI changes.',
  },
  {
    icon: GitBranch,
    title: 'CI Integration',
    description: 'Updates GitHub Actions workflows and ensures tests run in your CI/CD pipeline.',
  },
  {
    icon: GitPullRequest,
    title: 'PR Creation',
    description: 'Creates pull requests with linked Linear tickets and comprehensive test documentation.',
  },
]

export function Features() {
  return (
    <section className="section bg-gradient-void">
      <div className="text-center mb-16">
        <h2 className="section-title">Features</h2>
        <p className="section-subtitle mx-auto">
          Everything you need to automate your E2E testing workflow.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <GlassCard
            key={feature.title}
            variant="quolar"
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="feature-icon mb-4">
              <feature.icon className="w-5 h-5 text-quolar-emerald" />
            </div>

            <h3 className="text-xl font-semibold text-[oklch(0.9_0_0)] mb-2">
              {feature.title}
            </h3>

            <p className="text-[oklch(0.55_0_0)] text-sm leading-relaxed">
              {feature.description}
            </p>
          </GlassCard>
        ))}
      </div>
    </section>
  )
}
