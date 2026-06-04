export type GameStatus = 'today' | 'scheduled' | 'live' | 'finished'

export interface Team {
  id: string
  name: string
  fullName: string
  logoUrl?: string
  emoji: string
  abbr: string
  gradient: [string, string]
}

export interface Game {
  id: string
  status: GameStatus
  statusLabel: string
  time: string
  stadium: string
  date?: string
  home: Team & { fortuneScore?: number }
  away: Team & { fortuneScore?: number }
}

export interface RankingRow {
  rank: number
  team: Team
  wins: number
  losses: number
  draws: number
  winRate: string
}
