import type { Fortune, FortuneCardData } from '@/types/fortune'
import { mockFortunes } from '@/lib/data/mockData'

const BASE_URL = process.env.API_BASE_URL

// Saju card placeholder reused from mockData until the API provides saju data
const MOCK_SAJU_CARD: FortuneCardData =
  Object.values(mockFortunes)[0]?.cards.find((c) => c.variant === 'saju') ?? {
    variant: 'saju',
    categoryLabel: '사주팔자 · 오행 분석',
    title: '금일 사주팔자',
    icon: 'local_fire_department',
    description: '',
  }

export async function getFortuneByPlayerId(id: string): Promise<Fortune | null> {
  if (!BASE_URL) return mockFortunes[id] ?? null

  try {
    const res = await fetch(`${BASE_URL}/api/v1/saju/players/${id}`)
    if (!res.ok) return null
    const data = await res.json()

    const { daily_fortune, zodiac_fortune } = data

    return {
      playerId: id,
      summary: daily_fortune.report_text,
      cards: [
        {
          variant: 'horoscope',
          categoryLabel: '오하아사 · 별자리 운세',
          title: `${zodiac_fortune.zodiac_sign} ${zodiac_fortune.rank}위`,
          icon: 'auto_awesome',
          score: daily_fortune.lucky_index,
          rank: zodiac_fortune.rank,
          description: zodiac_fortune.fortune_text,
        },
        // TODO: 사주 데이터가 API에 없음 - 실제 연동 시 업데이트 필요
        MOCK_SAJU_CARD,
      ],
    }
  } catch {
    return null
  }
}
