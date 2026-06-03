import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: string
}

export default function Card({ children, className = '', padding = 'p-5' }: CardProps) {
  return (
    <div className={`bg-card rounded-[20px] shadow-card transition-shadow duration-200 hover:shadow-card-hover ${padding} ${className}`}>
      {children}
    </div>
  )
}
