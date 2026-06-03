export type OhaengElement = '木' | '火' | '土' | '金' | '水'
export type FortuneCardVariant = 'horoscope' | 'saju'

export interface FortuneCardData {
  variant: FortuneCardVariant
  categoryLabel: string
  title: string
  icon: string
  score?: number
  rank?: number
  element?: OhaengElement
  tags?: string[]
  description: string
}

export interface Fortune {
  playerId: string
  summary: string
  cards: FortuneCardData[]
}
