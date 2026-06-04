import type { Game, RankingRow } from '@/types/game'
import type { Lineup, Player } from '@/types/player'
import type { Fortune } from '@/types/fortune'
import { TEAMS } from '@/lib/constants/teams'

export const mockGames: Game[] = [
  {
    id: 'game-1',
    status: 'today',
    statusLabel: '오늘',
    time: '18:30',
    stadium: '잠실구장',
    date: '2026.05.28',
    home: { ...TEAMS.hanwha, fortuneScore: 78 },
    away: { ...TEAMS.doosan, fortuneScore: 65 },
  },
  {
    id: 'game-2',
    status: 'scheduled',
    statusLabel: '예정',
    time: '18:30',
    stadium: '수원',
    home: { ...TEAMS.ssg },
    away: { ...TEAMS.kt },
  },
  {
    id: 'game-3',
    status: 'scheduled',
    statusLabel: '예정',
    time: '18:30',
    stadium: '광주',
    home: { ...TEAMS.kia },
    away: { ...TEAMS.samsung },
  },
  {
    id: 'game-4',
    status: 'scheduled',
    statusLabel: '예정',
    time: '18:30',
    stadium: '창원',
    home: { ...TEAMS.nc },
    away: { ...TEAMS.lotte },
  },
]

export const mockRanking: RankingRow[] = [
  { rank: 1,  team: TEAMS.kia,    wins: 87, losses: 55, draws: 2, winRate: '.613' },
  { rank: 2,  team: TEAMS.samsung, wins: 78, losses: 64, draws: 2, winRate: '.549' },
  { rank: 3,  team: TEAMS.lg,     wins: 76, losses: 66, draws: 2, winRate: '.535' },
  { rank: 4,  team: TEAMS.doosan,  wins: 74, losses: 68, draws: 2, winRate: '.521' },
  { rank: 5,  team: TEAMS.kt,     wins: 72, losses: 70, draws: 2, winRate: '.507' },
  { rank: 6,  team: TEAMS.ssg,    wins: 72, losses: 71, draws: 2, winRate: '.503' },
  { rank: 7,  team: TEAMS.lotte,  wins: 66, losses: 74, draws: 4, winRate: '.471' },
  { rank: 8,  team: TEAMS.hanwha, wins: 66, losses: 76, draws: 2, winRate: '.465' },
  { rank: 9,  team: TEAMS.nc,     wins: 61, losses: 81, draws: 2, winRate: '.430' },
  { rank: 10, team: TEAMS.kiwoom, wins: 58, losses: 86, draws: 0, winRate: '.403' },
]

// 한화 선수들
const jeongEunwon: Player = {
  id: 'jeong-eunwon', name: '정은원', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['2루수'],
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDu37Er5pFu9SR7aej-7ZWRzGZ-6bJ2B_twMt8ezUmV-0BplefqP2gSVsl0BUlCOsTnXfCpzCE2-cN100JXzhkCIDlpleUGX4W-V_SjZ5KpXqe52hIdlqLlul9HSUiuFTUw4Nt-Mtkv3ldntHvaEfJupA9jFGqgi40XfjED6f2EcFL1pOXBETsbg1xjiv1qpOZL9ito05PAgUNW6nsJh3J7oQZKteBOwZnD93Zp7awaKsTy49zS7R-X_DZsJCUZEtNZEBYwBsO3Dnqc',
  initials: 'JE',
}
const choiJaehun: Player = {
  id: 'choi-jaehun', name: '최재훈', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['포수'],
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMeiW73NplwQqAg7EjyKJmU81TFeP1MW4FebRWNkuU64a4YifqTZqQsqY59rCdtKvi7POQo6J0vo7qdZPfPa0zh5no94Ng0lE2i6sGECOV2pT3kp4cFkX6SXM70zoTKB3o8aSKClk4Wf4RglPlhtEHKTeyeDu1GBwdF4QfPsC0knuqDfNY2eqquLt5B18JvWdaRD01L3CYNpsa3XqqPkQln9bHifPeY-7ZSlReXFbrDxY_ox-fVuJXMz9KDBzj6K5EMM2jEei50oHI',
  initials: 'CJ',
}
const noSihwan: Player = {
  id: 'no-sihwan', name: '노시환', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['3루수'],
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAX0wqBGlEj8v3joNoqKkgVjjdOCnTpa8WQcD8dtZS48cE_87TKiB5kF9V9qfN79Adtwuv0mlQ7nriUNYdRaKuXvncCcB-zmJ5zBiwfChH0Pg3q2cbXD9jGeHNRNPXx-maRH5Z4HFzt8eg2lehl-wNoCX40I2NpOGTQW6i98YOKAmRLjhbNYZtPLKvIau66NKO1RtttsV3RjuiDD2t6JNzmnilI4_w1lqERBHUwKVsgs-4V6b9GFxoqsfSx1BYeQ1sXv8qUx2IF9eMp',
  initials: 'NS',
}
const chaeEunsung: Player = {
  id: 'chae-eunsung', name: '채은성', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['1루수'], initials: 'CE',
}
const peraza: Player = {
  id: 'peraza', name: '페라자', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['우익수'], initials: 'P',
}
const ahnChihong: Player = {
  id: 'ahn-chihong', name: '안치홍', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['지명타자'], initials: 'AC',
}
const moonHyunbin: Player = {
  id: 'moon-hyunbin', name: '문현빈', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['중견수'], initials: 'MH',
}
const leeDoyoon: Player = {
  id: 'lee-doyoon', name: '이도윤', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['유격수'], initials: 'LD',
}
const choiInho: Player = {
  id: 'choi-inho', name: '최인호', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['좌익수'], initials: 'CI',
}
const ryuHyunjin: Player = {
  id: 'ryu-hyunjin', name: '류현진', teamId: 'hanwha', teamFullName: '한화 이글스',
  positions: ['투수'],
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm4UQUCGcVF71lWBKr7CeQ6eO6xcgg0AMDuU2KW0TItQrJp3fM5CbIbM0tIkZmpx86VK7TE4V8VTpYchZ_xJHyugQByZZqCTGU6lrJxZoy2B7rWdx_1jvNwMeCDyfGZKSaXOe-jBJqYumEANIgnzcQHPsIC0Xk9d4WS1VOnXariNNT5jL0iBjyy44Z24TXG9y7OYjLrRAoUDVJkNMtYyAGbeSOaFU9CaWKHDihV-Ga45awLGenLS9q9ywFk5mqO9eywhmCPcKyF8-k',
  initials: 'RY',
}

// 롯데 선수들
const yoonDonghee: Player = {
  id: 'yoon-donghee', name: '윤동희', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['우익수'],
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAX0wqBGlEj8v3joNoqKkgVjjdOCnTpa8WQcD8dtZS48cE_87TKiB5kF9V9qfN79Adtwuv0mlQ7nriUNYdRaKuXvncCcB-zmJ5zBiwfChH0Pg3q2cbXD9jGeHNRNPXx-maRH5Z4HFzt8eg2lehl-wNoCX40I2NpOGTQW6i98YOKAmRLjhbNYZtPLKvIau66NKO1RtttsV3RjuiDD2t6JNzmnilI4_w1lqERBHUwKVsgs-4V6b9GFxoqsfSx1BYeQ1sXv8qUx2IF9eMp',
  initials: 'YD',
}
const koSeungmin: Player = {
  id: 'ko-seungmin', name: '고승민', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['2루수'],
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMkFmes7JbT8aVr-EgJF7KW5zoRM0FCF7NEx423cGDdkJdWl_-LiAhPnjq6bEFfgitddkFIT3YFmVk4AKPpziqcY9HrQ4abNBlU1Vy4K2p0_JNXMsE06KK_CDyKp-T-sfxxxZodRO_B_rlf6wlBynpEBZwkFTkWm1sukgXaPLclS8eWzZMPJnhGUGugWv62bEklzpgZ6BQ6APVfHoy3hyVONmF4DCLP-aZod6j8RZVESiHVXSzcA1ch5tNADWkZqYmZSJ8GRM0HFBW',
  initials: 'KS',
}
const reyes: Player = {
  id: 'reyes', name: '레이예스', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['좌익수'], initials: 'VR',
}
const jeonJunwoo: Player = {
  id: 'jeon-junwoo', name: '전준우', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['지명타자'], initials: 'JW',
}
const jeongHun: Player = {
  id: 'jeong-hun', name: '정훈', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['1루수'], initials: 'JH',
}
const sonHoyoung: Player = {
  id: 'son-hoyoung', name: '손호영', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['3루수'], initials: 'SH',
}
const yooGangnam: Player = {
  id: 'yoo-gangnam', name: '유강남', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['포수'], initials: 'GN',
}
const parkSeungwook: Player = {
  id: 'park-seungwook', name: '박승욱', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['유격수'], initials: 'SW',
}
const hwangSeongbin: Player = {
  id: 'hwang-seongbin', name: '황성빈', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['중견수'], initials: 'SB',
}
const wilkerson: Player = {
  id: 'wilkerson', name: '윌커슨', teamId: 'lotte', teamFullName: '롯데 자이언츠',
  positions: ['투수'], initials: 'AW',
}

export const mockPlayers: Record<string, Player> = {
  'jeong-eunwon': jeongEunwon,
  'choi-jaehun':  choiJaehun,
  'no-sihwan':    noSihwan,
  'chae-eunsung': chaeEunsung,
  'peraza':       peraza,
  'ahn-chihong':  ahnChihong,
  'moon-hyunbin': moonHyunbin,
  'lee-doyoon':   leeDoyoon,
  'choi-inho':    choiInho,
  'ryu-hyunjin':  ryuHyunjin,
  'yoon-donghee': yoonDonghee,
  'ko-seungmin':  koSeungmin,
  'reyes':        reyes,
  'jeon-junwoo':  jeonJunwoo,
  'jeong-hun':    jeongHun,
  'son-hoyoung':  sonHoyoung,
  'yoo-gangnam':  yooGangnam,
  'park-seungwook': parkSeungwook,
  'hwang-seongbin': hwangSeongbin,
  'wilkerson':    wilkerson,
}

export const mockLineups: Record<string, Lineup> = {
  'game-1': {
    gameId: 'game-1',
    home: {
      team: { ...TEAMS.hanwha },
      slots: [
        { battingOrder: 1, player: jeongEunwon, position: '2루수' },
        { battingOrder: 2, player: choiJaehun,  position: '포수' },
        { battingOrder: 3, player: noSihwan,    position: '3루수' },
        { battingOrder: 4, player: chaeEunsung, position: '1루수' },
        { battingOrder: 5, player: peraza,      position: '우익수' },
        { battingOrder: 6, player: ahnChihong,  position: '지명타자' },
        { battingOrder: 7, player: moonHyunbin, position: '중견수' },
        { battingOrder: 8, player: leeDoyoon,   position: '유격수' },
        { battingOrder: 9, player: choiInho,    position: '좌익수' },
        { battingOrder: 10, player: ryuHyunjin, position: '투수' },
      ],
    },
    away: {
      team: { ...TEAMS.lotte },
      slots: [
        { battingOrder: 1, player: yoonDonghee,   position: '우익수' },
        { battingOrder: 2, player: koSeungmin,     position: '2루수' },
        { battingOrder: 3, player: reyes,          position: '좌익수' },
        { battingOrder: 4, player: jeonJunwoo,     position: '지명타자' },
        { battingOrder: 5, player: jeongHun,       position: '1루수' },
        { battingOrder: 6, player: sonHoyoung,     position: '3루수' },
        { battingOrder: 7, player: yooGangnam,     position: '포수' },
        { battingOrder: 8, player: parkSeungwook,  position: '유격수' },
        { battingOrder: 9, player: hwangSeongbin,  position: '중견수' },
        { battingOrder: 10, player: wilkerson,    position: '투수' },
      ],
    },
  },
}

export const mockLineupGame: Game = {
  id: 'game-1',
  status: 'today',
  statusLabel: '오늘',
  time: '18:30',
  stadium: '대전 한화생명이글스파크',
  date: '2026.05.28',
  home: { ...TEAMS.hanwha, fortuneScore: 78 },
  away: { ...TEAMS.lotte,  fortuneScore: 65 },
}

export const mockFortunes: Record<string, Fortune> = {
  'ryu-hyunjin': {
    playerId: 'ryu-hyunjin',
    summary: '🍀 오늘의 종합 운세 1위! 모든 기운이 정점에 달했습니다. 집중력과 체력 모두 최상의 상태로, 경기에 강한 집중력을 발휘할 수 있는 날입니다.',
    cards: [
      {
        variant: 'horoscope',
        categoryLabel: '오하아사 · 별자리 운세',
        title: '전갈자리 1위',
        icon: 'auto_awesome',
        rank: 1,
        description: '모든 일이 뜻대로 풀리는 최고의 하루입니다. 긍정적인 에너지가 가득하며, 경기에 임하기에 매우 좋은 운 흐름을 보이고 있습니다.',
        referenceDate: '2026.06.01',
      },
      {
        variant: 'saju',
        categoryLabel: '사주팔자 · 오행 분석',
        title: '금일 사주팔자',
        icon: 'local_fire_department',
        score: 78,
        element: '火',
        tags: ['추진력 ↑', '활동량 ↑'],
        description: '오늘의 기운은 강한 불(火)의 성질을 띠고 있습니다. 평소보다 활동적이고 추진력이 강해지는 시기입니다.\n\n에너지가 넘치는 하루이지만, 지나친 열정은 체력 소모로 이어질 수 있으니 적절한 휴식과 완급 조절이 필요합니다. 주변 동료들과의 시너지가 크게 발휘될 수 있는 긍정적인 흐름입니다.',
        referenceDate: '2026.06.02',
      },
    ],
  },
}
