'use client'

import { useRef, useCallback } from 'react'

export function useHorizontalScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth, behavior: 'smooth' })
  }, [])

  return { scrollRef, scroll }
}
