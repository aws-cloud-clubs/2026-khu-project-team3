'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Lineup } from '@/types/player'
import PlayerRow from './PlayerRow'

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
        const slots = tab === 'home' ? lineup.home.slots : lineup.away.slots

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
