'use client'

import { ReactNode, CSSProperties } from 'react'
import clsx from 'clsx'

interface GlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'quolar' | 'quoth' | 'exolar'
  hover?: boolean
  style?: CSSProperties
}

export function GlassCard({
  children,
  className,
  variant = 'default',
  hover = true,
  style
}: GlassCardProps) {
  return (
    <div
      className={clsx(
        'glass-panel p-6',
        hover && 'glass-panel-hover',
        variant === 'quolar' && 'glass-panel-quolar',
        variant === 'quoth' && 'glass-panel-quoth',
        variant === 'exolar' && 'glass-panel-exolar',
        className
      )}
      style={style}
    >
      {children}
    </div>
  )
}
