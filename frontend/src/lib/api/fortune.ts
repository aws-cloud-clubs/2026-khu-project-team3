import type { Fortune } from '@/types/fortune'
import { mockFortunes } from '@/lib/data/mockData'

export async function getFortuneByPlayerId(id: string): Promise<Fortune | null> {
  return mockFortunes[id] ?? null
}
