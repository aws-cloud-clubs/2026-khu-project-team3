type BadgeVariant = 'scheduled' | 'today' | 'home' | 'away' | 'position-home' | 'position-away'

import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  scheduled:       'bg-sage-100 text-text-300 text-[10px] font-bold tracking-[0.04em] px-[10px] py-[3px]',
  today:           'bg-g-100 text-g-700 text-[10px] font-bold tracking-[0.04em] px-[10px] py-[3px]',
  home:            'bg-white/25 text-white text-[10px] font-bold px-[10px] py-[2px]',
  away:            'bg-white/18 text-white text-[10px] font-bold px-[10px] py-[2px]',
  'position-home': 'bg-g-100 text-g-800 text-[10px] font-bold px-[8px] py-[2px]',
  'position-away': 'bg-purple-100/30 text-[#7a568f] text-[10px] font-bold px-[8px] py-[2px]',
}

export default function Badge({ children, variant = 'scheduled', className = '' }: BadgeProps) {
  return (
    <span className={`inline-block rounded-full whitespace-nowrap ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
