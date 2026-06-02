import { spawnSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const DATA_DIR = path.join(ROOT, 'data')
const IMAGE_DIR = path.join(DATA_DIR, 'images')
const LEGACY_PLAYER_DIR = path.join(IMAGE_DIR, 'players')
const INSERT_SQL = path.join(DATA_DIR, 'kbo_2026_teams_players_insert.sql')

const ASSET_HOST = 'https://6ptotvmi5753.edge.naverncp.com/KBO_IMAGE'
const REGISTER_ALL_URL = 'https://www.koreabaseball.com/Player/RegisterAll.aspx'
const PLAYER_SEARCH_URL = 'https://www.koreabaseball.com/ws/Controls.asmx/GetSearchPlayer'

const TEAM_CODES = {
  LG: 'LG',
  삼성: 'SS',
  KT: 'KT',
  KIA: 'HT',
  한화: 'HH',
  두산: 'OB',
  NC: 'NC',
  SSG: 'SK',
  롯데: 'LT',
  키움: 'WO',
}

function parseSqlRoster(sql) {
  const players = []
  const rowPattern = /\('([^']+)', '([^']+)', '([^']+)', DATE '([^']+)'\)/g
  for (const match of sql.matchAll(rowPattern)) {
    players.push({
      team: match[1],
      name: match[2],
      position: match[3],
      birthDate: match[4],
    })
  }
  return players
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
}

function textBetween(text, tag) {
  const match = text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return match ? decodeHtml(match[1]) : ''
}

function parsePlayerIdsFromViewState(html) {
  const state = html.match(/id="__VIEWSTATE" value="([^"]+)"/)?.[1]
  if (!state) {
    throw new Error('KBO RegisterAll page did not include __VIEWSTATE')
  }

  const decoded = Buffer.from(state, 'base64').toString('utf8')
  const byTeamAndName = new Map()
  for (const table of decoded.matchAll(/<Table\b[\s\S]*?<\/Table>/g)) {
    const row = table[0]
    if (textBetween(row, 'JOB_SC') !== '선수') {
      continue
    }

    const teamCode = textBetween(row, 'T_ID')
    const name = textBetween(row, 'P_NM')
    const playerId = textBetween(row, 'P_ID')
    if (!teamCode || !name || !playerId) {
      continue
    }

    const key = `${teamCode}:${name}`
    if (!byTeamAndName.has(key)) {
      byTeamAndName.set(key, [])
    }
    byTeamAndName.get(key).push(playerId)
  }

  return byTeamAndName
}

async function fetchBytes(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 KBOImageFetcher/1.0',
      Referer: 'https://www.koreabaseball.com/',
    },
  })
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return Buffer.from(await response.arrayBuffer())
}

async function searchPlayerIds(teamCode, name) {
  const body = new URLSearchParams({ name })
  const response = await fetch(PLAYER_SEARCH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
      Referer: 'https://www.koreabaseball.com/Player/Register.aspx',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 KBOImageFetcher/1.0',
    },
    body,
  })
  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return [...(data.now ?? []), ...(data.retire ?? [])]
    .filter((player) => player.T_ID === teamCode && player.P_NM === name)
    .map((player) => String(player.P_ID))
}

async function downloadTeamImages(teams) {
  const results = []
  for (const team of teams) {
    const code = TEAM_CODES[team]
    const outputDir = path.join(IMAGE_DIR, team)
    const outputPath = path.join(outputDir, `${team}.png`)
    await mkdir(outputDir, { recursive: true })

    try {
      const url = `${ASSET_HOST}/emblem/regular/2026/emblem_${code}.png`
      await writeFile(outputPath, await fetchBytes(url))
      results.push({ team, ok: true, path: outputPath })
    } catch (error) {
      results.push({ team, ok: false, error: error.message })
    }
  }
  return results
}

async function convertJpgToPng(inputPath, outputPath) {
  const result = spawnSync('sips', ['-s', 'format', 'png', inputPath, '--out', outputPath], {
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'sips conversion failed').trim())
  }
}

async function downloadPlayerImages(players, playerIds) {
  const results = []
  const usedKeys = new Map()

  for (const player of players) {
    const key = `${player.team}:${player.name}`
    usedKeys.set(key, (usedKeys.get(key) ?? 0) + 1)
  }

  const downloadedKeys = new Set()
  for (const player of players) {
    const key = `${player.team}:${player.name}`
    if (downloadedKeys.has(key)) {
      continue
    }

    const teamCode = TEAM_CODES[player.team]
    const ids = playerIds.get(`${teamCode}:${player.name}`) ?? await searchPlayerIds(teamCode, player.name)
    const outputDir = path.join(IMAGE_DIR, player.team, 'players')
    const outputPath = path.join(outputDir, `${player.name}.png`)
    await mkdir(outputDir, { recursive: true })
    if (ids.length === 0) {
      results.push({ player, ok: false, error: 'missing playerId' })
      continue
    }

    let success = false
    for (const playerId of ids) {
      const tempPath = path.join(outputDir, `.${player.name}.${playerId}.jpg`)
      try {
        const url = `${ASSET_HOST}/person/middle/2026/${playerId}.jpg`
        await writeFile(tempPath, await fetchBytes(url))
        await convertJpgToPng(tempPath, outputPath)
        await rm(tempPath, { force: true })
        downloadedKeys.add(key)
        results.push({ player, ok: true, playerId, path: outputPath })
        success = true
        break
      } catch (error) {
        await rm(tempPath, { force: true })
        if (ids.indexOf(playerId) === ids.length - 1) {
          results.push({ player, ok: false, playerId, error: error.message })
        }
      }
    }

    if (!success && existsSync(outputPath)) {
      await rm(outputPath, { force: true })
    }
  }

  return { results, duplicateKeys: [...usedKeys].filter(([, count]) => count > 1) }
}

const sql = await readFile(INSERT_SQL, 'utf8')
const players = parseSqlRoster(sql)
const teams = [...new Set(players.map((player) => player.team))]

await mkdir(IMAGE_DIR, { recursive: true })
const registerHtml = await (await fetch(REGISTER_ALL_URL)).text()
const playerIds = parsePlayerIdsFromViewState(registerHtml)

const teamResults = await downloadTeamImages(teams)
const { results: playerResults, duplicateKeys } = await downloadPlayerImages(players, playerIds)
if (playerResults.every((result) => result.ok)) {
  await rm(LEGACY_PLAYER_DIR, { recursive: true, force: true })
}

const summary = {
  teams: {
    total: teamResults.length,
    ok: teamResults.filter((result) => result.ok).length,
    failed: teamResults.filter((result) => !result.ok),
  },
  players: {
    totalRows: players.length,
    uniqueTeamNames: new Set(players.map((player) => `${player.team}:${player.name}`)).size,
    ok: playerResults.filter((result) => result.ok).length,
    failed: playerResults.filter((result) => !result.ok).map((result) => ({
      team: result.player.team,
      name: result.player.name,
      error: result.error,
    })),
    duplicateTeamNames: duplicateKeys.map(([key, count]) => {
      const [team, name] = key.split(':')
      return { team, name, count }
    }),
  },
}

console.log(JSON.stringify(summary, null, 2))
