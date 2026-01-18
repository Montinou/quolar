'use client'

import { Github, BookOpen, ExternalLink } from 'lucide-react'

const links = [
  {
    label: 'Documentation',
    href: 'https://github.com/Montinou/quolar/blob/main/README.md',
    icon: BookOpen,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Montinou/quolar',
    icon: Github,
  },
]

const ecosystemLinks = [
  {
    label: 'Quoth',
    href: 'https://quoth.ai-innovation.site',
    color: 'text-quoth-violet',
  },
  {
    label: 'Exolar',
    href: 'https://exolar.ai-innovation.site',
    color: 'text-exolar-cyan',
  },
]

export function Footer() {
  return (
    <footer className="border-t border-[oklch(1_0_0_/_0.1)] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo & Description */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold text-quolar-emerald text-glow-emerald mb-2">
              Quolar
            </h3>
            <p className="text-sm text-[oklch(0.5_0_0)] max-w-xs">
              AI-Powered Test Automation for Claude Code
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col sm:flex-row gap-8">
            {/* Main links */}
            <div className="flex gap-6">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[oklch(0.6_0_0)] hover:text-[oklch(0.85_0_0)] transition-colors"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </a>
              ))}
            </div>

            {/* Ecosystem links */}
            <div className="flex gap-6">
              {ecosystemLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 text-sm ${link.color} hover:underline transition-colors`}
                >
                  {link.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-[oklch(1_0_0_/_0.05)] text-center">
          <p className="text-xs text-[oklch(0.4_0_0)]">
            Part of the AttorneyShare Testing Ecosystem
          </p>
          <p className="text-xs text-[oklch(0.3_0_0)] mt-1">
            Built with Next.js, Tailwind CSS, and Claude Code
          </p>
        </div>
      </div>
    </footer>
  )
}
