import type { ReactNode } from 'react'

interface SectionTitleProps {
  children: ReactNode
  className?: string
}

export default function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`flex items-center gap-2 text-[15px] font-[800] text-text-700 tracking-[-0.01em] ${className}`}>
      <span
        className="inline-block w-[7px] h-[7px] rounded-full flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)' }}
        aria-hidden
      />
      {children}
    </h2>
  )
}
