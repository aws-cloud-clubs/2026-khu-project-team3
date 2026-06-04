import Image from 'next/image'
import type { RankingRow } from '@/types/game'

interface RankRowProps {
  row: RankingRow
  isLast: boolean
}

const rankColorClass: Record<number, string> = {
  1: 'text-[#b8860b] font-[900]',
  2: 'text-[#7a7a7a] font-[800]',
  3: 'text-[#8b5e2a] font-[800]',
}

export default function RankRow({ row, isLast }: RankRowProps) {
  const rankClass = rankColorClass[row.rank] ?? 'text-text-300 font-[600]'

  return (
    <div
      className={`grid gap-5 items-center py-[12px] ${
        isLast ? 'border-b-0 pb-1' : 'border-b border-[rgba(168,208,190,0.15)]'
      }`}
      style={{ gridTemplateColumns: '36px minmax(0,1fr)' }}
    >
      <span className={`text-[16px] text-center ${rankClass}`}>{row.rank}</span>

      <div
        className="grid items-center min-w-0"
        style={{ gridTemplateColumns: '32px minmax(0,1fr)', columnGap: '14px' }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-[800] text-white"
          style={{ background: `linear-gradient(135deg, ${row.team.gradient[0]}, ${row.team.gradient[1]})` }}
          aria-hidden
        >
          {row.team.logoUrl ? (
            <Image
              src={row.team.logoUrl}
              alt=""
              width={32}
              height={32}
              className="w-6 h-6 object-contain"
            />
          ) : (
            row.team.abbr
          )}
        </div>
        <span className="text-[14px] font-[800] text-text-700 truncate">{row.team.name}</span>
      </div>
    </div>
  )
}
