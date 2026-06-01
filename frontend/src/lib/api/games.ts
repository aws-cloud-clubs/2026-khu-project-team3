import type { Game, RankingRow, Team } from '@/types/game'
import { TEAMS } from '@/lib/constants/teams'
import { mockGames, mockRanking, mockLineupGame } from '@/lib/data/mockData'

const BASE_URL = process.env.API_BASE_URL

interface ApiTeam {
  id: number
  name: string
  logo_url?: string
}
interface ApiHomeGame {
  game_id: number
  game_date: string
  game_time: string
  stadium: string
  home_team: ApiTeam
  away_team: ApiTeam
}
interface HomeData {
  today_games: ApiHomeGame[]
  team_luck_rankings: { rank: number; team: ApiTeam; luck_score: number }[]
  kbo_rankings: { rank: number; team: ApiTeam }[]
}

function findTeamByName(apiName: string): Team | null {
  const teams = Object.values(TEAMS)
  return (
    teams.find((t) => t.name === apiName) ??
    teams.find((t) => apiName.includes(t.name)) ??
    teams.find((t) => t.fullName.includes(apiName)) ??
    null
  )
}

function toStatus(gameDate: string): Pick<Game, 'status' | 'statusLabel'> {
  const today = new Date().toISOString().slice(0, 10)
  return gameDate === today
    ? { status: 'today', statusLabel: '오늘' }
    : { status: 'scheduled', statusLabel: '예정' }
}

async function fetchHomeData(): Promise<HomeData | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/home`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json() as Promise<HomeData>
  } catch {
    return null
  }
}

export async function getGames(): Promise<Game[]> {
  if (!BASE_URL) return mockGames

  const data = await fetchHomeData()
  if (!data) return []

  const luckMap = new Map(
    (data.team_luck_rankings ?? []).map((r) => [r.team.name, r.luck_score])
  )

  const games: Game[] = []
  for (const g of data.today_games ?? []) {
    const home = findTeamByName(g.home_team.name)
    const away = findTeamByName(g.away_team.name)
    if (!home || !away) continue
    const { status, statusLabel } = toStatus(g.game_date)
    games.push({
      id: String(g.game_id),
      status,
      statusLabel,
      time: g.game_time,
      stadium: g.stadium,
      date: g.game_date,
      home: { ...home, fortuneScore: luckMap.get(g.home_team.name) },
      away: { ...away, fortuneScore: luckMap.get(g.away_team.name) },
    })
  }
  return games
}

export async function getGameById(id: string): Promise<Game | null> {
  if (!BASE_URL) {
    if (id === 'game-1') return mockLineupGame
    return mockGames.find((g) => g.id === id) ?? null
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/saju/games/${id}`)
    if (!res.ok) return null
    const data = await res.json()

    const home = findTeamByName(data.home_team?.name ?? '')
    const away = findTeamByName(data.away_team?.name ?? '')
    if (!home || !away) return null

    const { status, statusLabel } = toStatus(data.game?.game_date ?? '')
    return {
      id: String(data.game.id),
      status,
      statusLabel,
      time: data.game.game_time,
      stadium: data.game.stadium,
      date: data.game.game_date,
      home: { ...home, fortuneScore: data.home_team.luck_score },
      away: { ...away, fortuneScore: data.away_team.luck_score },
    }
  } catch {
    return null
  }
}

export async function getRanking(): Promise<RankingRow[]> {
  if (!BASE_URL) return mockRanking

  const data = await fetchHomeData()
  if (!data) return []

  return (data.kbo_rankings ?? []).map((entry) => {
    const team: Team = findTeamByName(entry.team.name) ?? {
      id: String(entry.team.id),
      name: entry.team.name,
      fullName: entry.team.name,
      emoji: '',
      abbr: '',
      gradient: ['#000', '#000'],
    }
    return {
      rank: entry.rank,
      team,
      // TODO: API does not provide wins/losses/draws/winRate
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: '',
    } satisfies RankingRow
  })
}
