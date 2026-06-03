import type { Fortune } from '@/types/fortune'
import { mockFortunes } from '@/lib/data/mockData'

const BASE_URL = process.env.API_BASE_URL

function formatDate(dateStr: string | undefined): string | undefined {
  if (!dateStr) return undefined
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return undefined
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

export async function getFortuneByPlayerId(id: string): Promise<Fortune | null> {
  if (!BASE_URL) return mockFortunes[id] ?? null

  try {
    const res = await fetch(`${BASE_URL}/api/v1/saju/players/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()

    const { daily_fortune, zodiac_fortune } = data

    return {
      playerId: id,
      summary: daily_fortune.fortune_text ?? '',
      cards: [
        {
          variant: 'horoscope',
          categoryLabel: '오하아사 · 별자리 운세',
          title: `${zodiac_fortune.zodiac_sign} ${zodiac_fortune.rank}위`,
          icon: 'auto_awesome',
          rank: zodiac_fortune.rank,
          description: zodiac_fortune.fortune_text ?? '',
          referenceDate: formatDate(zodiac_fortune.fortune_date),
        },
        {
          variant: 'saju',
          categoryLabel: '사주팔자 · 경기일 운세',
          title: '금일 사주 점수',
          icon: 'local_fire_department',
          score: daily_fortune.lucky_index ?? undefined,
          description: daily_fortune.fortune_text ?? '',
          referenceDate: formatDate(daily_fortune.generated_at),
        },
      ],
    }
  } catch {
    return null
  }
}
