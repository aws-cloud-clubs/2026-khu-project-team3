'use client'

import { useState } from 'react'
import type { Lineup } from '@/types/player'
import PlayerRow from './PlayerRow'
import Icon from '@/components/ui/Icon'

interface LineupTabsProps {
  lineup: Lineup
}

type Tab = 'home' | 'away'

export default function LineupTabs({ lineup }: LineupTabsProps) {
  const [active, setActive] = useState<Tab>('home')

  const homeTeam = lineup.home.team
  const awayTeam = lineup.away.team

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
              {team.emoji} {team.fullName}
            </button>
          )
        })}
      </div>

      {/* 선수 패널 */}
      {(['home', 'away'] as Tab[]).map((tab) => {
        const side = tab
        const slots = tab === 'home' ? lineup.home.slots : lineup.away.slots
        const batters = slots.filter((s) => s.battingOrder !== 'P')
        const pitcher = slots.find((s) => s.battingOrder === 'P')

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
              style={{ gridTemplateColumns: '24px 36px 1fr auto' }}
            >
              <span className="text-[10px] font-[600] text-text-100 text-center">#</span>
              <span className="text-[10px] font-[600] text-text-100" />
              <span className="text-[10px] font-[600] text-text-100">선수명</span>
              <span className="text-[10px] font-[600] text-text-100">포지션</span>
            </div>

            {/* 타자 목록 */}
            <div className="px-5 pt-1 pb-3">
              {batters.map((slot) => (
                <PlayerRow
                  key={slot.player.id}
                  slot={slot}
                  side={side}
                  isLast={false}
                />
              ))}

              {/* 선발 투수 구분선 */}
              {pitcher && (
                <>
                  <div className="flex items-center gap-2 pt-3 pb-[6px] mt-1 border-t border-dashed border-[rgba(168,208,190,0.4)]">
                    <Icon name="sports_baseball" size={14} className="text-g-600" />
                    <span className="text-[11px] font-[700] text-g-600 tracking-[0.02em]">선발 투수</span>
                  </div>
                  <PlayerRow slot={pitcher} side={side} isLast />
                </>
              )}
            </div>
          </section>
        )
      })}
    </>
  )
}
