import type { Team } from '@/types/game'

export const TEAMS: Record<string, Team> = {
  kia: {
    id: 'kia', name: 'KIA', fullName: 'KIA 타이거즈',
    emoji: '🐯', abbr: 'K', gradient: ['#EA0029', '#C4001D'],
  },
  samsung: {
    id: 'samsung', name: '삼성', fullName: '삼성 라이온즈',
    emoji: '⭐', abbr: 'S', gradient: ['#074CA1', '#0B5FA5'],
  },
  lg: {
    id: 'lg', name: 'LG', fullName: 'LG 트윈스',
    emoji: '🏟️', abbr: 'L', gradient: ['#C30452', '#A00040'],
  },
  doosan: {
    id: 'doosan', name: '두산', fullName: '두산 베어스',
    emoji: '🐻', abbr: 'D', gradient: ['#002B5B', '#1464A6'],
  },
  kt: {
    id: 'kt', name: 'KT', fullName: 'KT 위즈',
    emoji: '⚡', abbr: 'KT', gradient: ['#1428A0', '#1E3FA0'],
  },
  ssg: {
    id: 'ssg', name: 'SSG', fullName: 'SSG 랜더스',
    emoji: '🦁', abbr: 'S', gradient: ['#CF1329', '#A00E1F'],
  },
  lotte: {
    id: 'lotte', name: '롯데', fullName: '롯데 자이언츠',
    emoji: '🐠', abbr: 'L', gradient: ['#041E42', '#0D2240'],
  },
  hanwha: {
    id: 'hanwha', name: '한화', fullName: '한화 이글스',
    emoji: '🦅', abbr: 'H', gradient: ['#F76E11', '#FF9F29'],
  },
  nc: {
    id: 'nc', name: 'NC', fullName: 'NC 다이노스',
    emoji: '🦈', abbr: 'N', gradient: ['#315288', '#1E3A5F'],
  },
  kiwoom: {
    id: 'kiwoom', name: '키움', fullName: '키움 히어로즈',
    emoji: '🏹', abbr: 'K', gradient: ['#820024', '#6B001C'],
  },
}
