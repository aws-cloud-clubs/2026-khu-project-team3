'use client'

import type { Game } from '@/types/game'
import GameCard from './GameCard'
import SectionTitle from '@/components/ui/SectionTitle'
import Icon from '@/components/ui/Icon'
import { useHorizontalScroll } from '@/hooks/useHorizontalScroll'

interface LiveGamesSectionProps {
  games: Game[]
}

export default function LiveGamesSection({ games }: LiveGamesSectionProps) {
  const { scrollRef, scroll } = useHorizontalScroll()

  return (
    <div className="bg-card rounded-[20px] shadow-card p-5">
      <div className="flex justify-between items-center mb-4">
        <SectionTitle>오늘의 경기</SectionTitle>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => scroll(-1)}
          aria-label="이전 경기"
          className="flex-shrink-0 w-8 h-8 rounded-full bg-white/95 border flex items-center justify-center shadow-sm cursor-pointer text-g-700 hover:bg-g-50 transition-colors"
        >
          <Icon name="chevron_left" size={18} />
        </button>

        <div
          ref={scrollRef}
          className="no-scrollbar flex-1 flex overflow-x-auto"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        <button
          onClick={() => scroll(1)}
          aria-label="다음 경기"
          className="flex-shrink-0 w-8 h-8 rounded-full bg-white/95 border flex items-center justify-center shadow-sm cursor-pointer text-g-700 hover:bg-g-50 transition-colors"
        >
          <Icon name="chevron_right" size={18} />
        </button>
      </div>
    </div>
  )
}
