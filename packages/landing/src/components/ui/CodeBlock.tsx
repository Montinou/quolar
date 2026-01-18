'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import clsx from 'clsx'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showCopy?: boolean
  className?: string
}

export function CodeBlock({
  code,
  language = 'bash',
  filename,
  showCopy = true,
  className
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className={clsx('code-block overflow-hidden', className)}>
      {(filename || showCopy) && (
        <div className="code-block-header">
          <div className="flex items-center gap-2">
            {filename && (
              <span className="text-[oklch(0.6_0_0)] text-sm font-medium">
                {filename}
              </span>
            )}
            {language && !filename && (
              <span className="text-[oklch(0.5_0_0)] text-xs uppercase tracking-wider">
                {language}
              </span>
            )}
          </div>
          {showCopy && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[oklch(0.5_0_0)] hover:text-[oklch(0.7_0_0)] transition-colors text-sm"
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-quolar-emerald" />
                  <span className="text-quolar-emerald">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          )}
        </div>
      )}
      <pre className="p-4 overflow-x-auto">
        <code className="text-[oklch(0.85_0_0)]">{code}</code>
      </pre>
    </div>
  )
}
