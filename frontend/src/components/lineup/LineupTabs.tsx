'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { Lineup, LineupSlot } from '@/types/player'
import PlayerRow from './PlayerRow'

interface LineupTabsProps {
  lineup: Lineup
}

type Tab = 'home' | 'away'
type SortKey = 'name' | 'luckyIndex' | 'position'
type SortDirection = 'asc' | 'desc'

interface SortState {
  key: SortKey
  direction: SortDirection
}

const collator = new Intl.Collator('ko-KR')

export default function LineupTabs({ lineup }: LineupTabsProps) {
  const [active, setActive] = useState<Tab>('home')
  const [sort, setSort] = useState<SortState | null>(null)

  const homeTeam = lineup.home.team
  const awayTeam = lineup.away.team
  const sortedHomeSlots = useMemo(() => sortSlots(lineup.home.slots, sort), [lineup.home.slots, sort])
  const sortedAwaySlots = useMemo(() => sortSlots(lineup.away.slots, sort), [lineup.away.slots, sort])

  const handleSort = (key: SortKey) => {
    setSort((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      }

      return { key, direction: key === 'luckyIndex' ? 'desc' : 'asc' }
    })
  }

  return (
    <>
      {/* 탭 버튼 */}
      <div
        className="rounded-[20px] p-[6px] flex gap-1 shadow-card"
        style={{ background: 'linear-gradient(to bottom, #f2fbf6, #e8f5ed)' }}
        role="tablist"
        aria-label="팀 선택"
      >
        {(['home', 'away'] as Tab[]).map((tab) => {
          const team = tab === 'home' ? homeTeam : awayTeam
          const isActive = active === tab
          return (
            <button
              key={tab}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(tab)}
              className={`flex-1 py-[9px] px-2 rounded-[12px] border-none text-[13px] font-[700] tracking-[-0.01em] cursor-pointer transition-all ${
                isActive
                  ? 'text-g-800 shadow-tab'
                  : 'bg-transparent text-text-300'
              }`}
              style={
                isActive
                  ? { background: 'linear-gradient(135deg, #c4e9d0 0%, #9ed4b2 100%)' }
                  : {}
              }
            >
              <span className="inline-flex items-center justify-center gap-[6px]">
                {team.logoUrl ? (
                  <Image
                    src={team.logoUrl}
                    alt=""
                    width={18}
                    height={18}
                    className="w-[18px] h-[18px] object-contain"
                  />
                ) : (
                  <span aria-hidden>{team.emoji}</span>
                )}
                <span>{team.fullName}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* 선수 패널 */}
      {(['home', 'away'] as Tab[]).map((tab) => {
        const side = tab
        const slots = tab === 'home' ? sortedHomeSlots : sortedAwaySlots

        return (
          <section
            key={tab}
            id={`panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
            hidden={active !== tab}
            className="bg-card rounded-[20px] shadow-card overflow-hidden"
          >
            {/* 컬럼 헤더 */}
            <div
              className="grid gap-[10px] px-5 pt-2 pb-[6px] border-b border-[rgba(168,208,190,0.18)]"
              style={{ gridTemplateColumns: '24px 36px minmax(0,1fr) 54px 62px' }}
            >
              <span className="text-[10px] font-[600] text-text-100 text-center">#</span>
              <span className="text-[10px] font-[600] text-text-100" />
              <SortButton
                label="선수명"
                sortKey="name"
                activeSort={sort}
                onClick={handleSort}
                className="justify-start"
              />
              <SortButton
                label="행운 지수"
                sortKey="luckyIndex"
                activeSort={sort}
                onClick={handleSort}
                className="justify-center text-center"
              />
              <SortButton
                label="포지션"
                sortKey="position"
                activeSort={sort}
                onClick={handleSort}
                className="justify-center text-center"
              />
            </div>

            {/* 선수 목록 */}
            <div className="px-5 pt-1 pb-3">
              {slots.map((slot, index) => (
                <PlayerRow
                  key={slot.player.id}
                  slot={slot}
                  side={side}
                  isLast={index === slots.length - 1}
                />
              ))}
            </div>
          </section>
        )
      })}
    </>
  )
}

function SortButton({
  label,
  sortKey,
  activeSort,
  onClick,
  className = '',
}: {
  label: string
  sortKey: SortKey
  activeSort: SortState | null
  onClick: (key: SortKey) => void
  className?: string
}) {
  const isActive = activeSort?.key === sortKey
  const indicator = isActive ? (activeSort.direction === 'asc' ? '▲' : '▼') : ''

  return (
    <button
      type="button"
      onClick={() => onClick(sortKey)}
      aria-label={`${label} 정렬`}
      className={`min-w-0 border-none bg-transparent p-0 text-[10px] font-[600] text-text-100 cursor-pointer inline-flex items-center gap-[3px] ${className}`}
    >
      <span className="truncate">{label}</span>
      <span className="inline-block w-[8px] text-[8px] leading-none text-text-300" aria-hidden>
        {indicator}
      </span>
    </button>
  )
}

function sortSlots(slots: LineupSlot[], sort: SortState | null): LineupSlot[] {
  if (!sort) return slots

  return [...slots].sort((a, b) => {
    const direction = sort.direction === 'asc' ? 1 : -1
    let result = 0

    if (sort.key === 'name') {
      result = collator.compare(a.player.name, b.player.name)
    }

    if (sort.key === 'position') {
      result = collator.compare(a.position, b.position)
    }

    if (sort.key === 'luckyIndex') {
      if (a.luckyIndex == null && b.luckyIndex == null) {
        result = 0
      } else if (a.luckyIndex == null) {
        return 1
      } else if (b.luckyIndex == null) {
        return -1
      } else {
        result = a.luckyIndex - b.luckyIndex
      }
    }

    return result === 0 ? a.battingOrder - b.battingOrder : result * direction
  })
}
