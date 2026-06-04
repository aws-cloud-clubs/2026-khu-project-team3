import type { Team } from './game'

export type Position =
  | '투수'
  | '포수'
  | '1루수'
  | '2루수'
  | '3루수'
  | '유격수'
  | '좌익수'
  | '중견수'
  | '우익수'
  | '지명타자'

export interface Player {
  id: string
  name: string
  teamId: string
  teamFullName: string
  positions: Position[]
  imageUrl?: string
  initials: string
}

export interface LineupSlot {
  battingOrder: number
  player: Player
  position: Position
  luckyIndex?: number
}

export interface Lineup {
  gameId: string
  home: { team: Team; slots: LineupSlot[] }
  away: { team: Team; slots: LineupSlot[] }
}
