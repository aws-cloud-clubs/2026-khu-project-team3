import type { Game, RankingRow } from '@/types/game'
import { mockGames, mockRanking, mockLineupGame } from '@/lib/data/mockData'

export async function getGames(): Promise<Game[]> {
  return mockGames
}

export async function getGameById(id: string): Promise<Game | null> {
  if (id === 'game-1') return mockLineupGame
  return mockGames.find((g) => g.id === id) ?? null
}

export async function getRanking(): Promise<RankingRow[]> {
  return mockRanking
}
