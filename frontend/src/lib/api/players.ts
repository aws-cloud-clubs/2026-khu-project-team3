import type { Lineup, LineupSlot, Player } from '@/types/player'
import type { Position } from '@/types/player'
import { TEAMS } from '@/lib/constants/teams'
import { mockPlayers, mockLineups } from '@/lib/data/mockData'

const BASE_URL = process.env.API_BASE_URL
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL ?? 'https://d2gi9i8g5kw08c.cloudfront.net/'

function buildImageUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  const base = IMAGE_BASE_URL.endsWith('/') ? IMAGE_BASE_URL : IMAGE_BASE_URL + '/'
  return encodeURI(base + path)
}

interface ApiPlayer {
  id: number
  name: string
  position: string
  profile_image_url?: string | null
}

function findTeamByName(apiName: string) {
  const teams = Object.values(TEAMS)
  return (
    teams.find((t) => t.name === apiName) ??
    teams.find((t) => apiName.includes(t.name)) ??
    teams.find((t) => t.fullName.includes(apiName)) ??
    null
  )
}

function getInitials(name: string): string {
  if (/[가-힣]/.test(name)) {
    return name[0] + name[name.length - 1]
  }
  return name.slice(0, 2).toUpperCase()
}

function mapPlayer(raw: ApiPlayer, teamId: string, teamFullName: string): Player {
  return {
    id: String(raw.id),
    name: raw.name,
    teamId,
    teamFullName,
    positions: [raw.position as Position],
    imageUrl: buildImageUrl(raw.profile_image_url),
    initials: getInitials(raw.name),
  }
}

function buildSlots(players: ApiPlayer[], teamId: string, teamFullName: string): LineupSlot[] {
  return players.map((raw, i) => {
    const player = mapPlayer(raw, teamId, teamFullName)
    const isLast = i === players.length - 1
    const isPitcher = raw.position === '투수' || raw.position === 'P'
    return {
      battingOrder: isLast && isPitcher ? 'P' : i + 1,
      player,
      position: raw.position as Position,
    }
  })
}

export async function getLineup(gameId: string): Promise<Lineup | null> {
  if (!BASE_URL) return mockLineups[gameId] ?? null

  try {
    const res = await fetch(`${BASE_URL}/api/v1/saju/games/${gameId}`)
    if (!res.ok) return null
    const data = await res.json()

    const homeTeam = findTeamByName(data.home_team?.name ?? '')
    const awayTeam = findTeamByName(data.away_team?.name ?? '')
    if (!homeTeam || !awayTeam) return null

    const homeId = String(data.home_team.id)
    const awayId = String(data.away_team.id)
    const homeFullName = homeTeam.fullName
    const awayFullName = awayTeam.fullName

    return {
      gameId,
      home: {
        team: { ...homeTeam, logoUrl: buildImageUrl(data.home_team.logo_url) },
        slots: buildSlots(data.home_team.players ?? [], homeId, homeFullName),
      },
      away: {
        team: { ...awayTeam, logoUrl: buildImageUrl(data.away_team.logo_url) },
        slots: buildSlots(data.away_team.players ?? [], awayId, awayFullName),
      },
    }
  } catch {
    return null
  }
}

export async function getPlayerById(id: string): Promise<Player | null> {
  if (!BASE_URL) return mockPlayers[id] ?? null

  try {
    const res = await fetch(`${BASE_URL}/api/v1/saju/players/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json()

    const p = data.player
    const team = findTeamByName(p.team?.name ?? '')
    const teamId = String(p.team?.id ?? '')
    const teamFullName = team?.fullName ?? p.team?.name ?? ''

    return {
      id: String(p.id),
      name: p.name,
      teamId,
      teamFullName,
      positions: [p.position as Position],
      imageUrl: buildImageUrl(p.profile_image_url),
      initials: getInitials(p.name),
    }
  } catch {
    return null
  }
}
