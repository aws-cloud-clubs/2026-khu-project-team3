import type { Lineup, Player } from '@/types/player'
import { mockPlayers, mockLineups } from '@/lib/data/mockData'

export async function getPlayerById(id: string): Promise<Player | null> {
  return mockPlayers[id] ?? null
}

export async function getLineup(gameId: string): Promise<Lineup | null> {
  return mockLineups[gameId] ?? null
}
