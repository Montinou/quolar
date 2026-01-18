'use client'

import { ArrowDown, Github } from 'lucide-react'
import { Button } from './ui/Button'

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-grid opacity-40" />

      {/* Radial gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.70 0.17 160 / 0.15), transparent)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-quolar-emerald animate-pulse" />
          <span className="text-sm text-[oklch(0.7_0_0)]">
            Claude Code Plugin
          </span>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-slide-up">
          <span className="text-glow-emerald" style={{ color: 'oklch(0.70 0.17 160)' }}>
            Quolar
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-2xl md:text-3xl font-medium text-[oklch(0.85_0_0)] mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          AI-Powered Test Automation
        </p>

        {/* Subtitle */}
        <p className="text-lg text-[oklch(0.55_0_0)] mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          Convert Linear tickets to self-healing Playwright tests.
          <br />
          Part of the AttorneyShare testing ecosystem.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => document.getElementById('setup')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Get Started
            <ArrowDown className="w-5 h-5 ml-2" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.open('https://github.com/Montinou/quolar', '_blank')}
          >
            <Github className="w-5 h-5 mr-2" />
            View on GitHub
          </Button>
        </div>

        {/* Quick commands preview */}
        <div className="mt-16 glass-panel p-4 max-w-md mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <code className="font-mono text-sm">
            <span className="text-[oklch(0.5_0_0)]">$</span>{' '}
            <span className="text-quolar-emerald">/test-ticket</span>{' '}
            <span className="text-[oklch(0.7_0_0)]">ENG-123</span>
          </code>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 text-[oklch(0.4_0_0)]" />
      </div>
    </section>
  )
}
