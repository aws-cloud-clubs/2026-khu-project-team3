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
      className={`grid gap-1 items-center py-[10px] ${
        isLast ? 'border-b-0 pb-1' : 'border-b border-[rgba(168,208,190,0.15)]'
      }`}
      style={{ gridTemplateColumns: '28px 1fr' }}
    >
      <span className={`text-[14px] text-center ${rankClass}`}>{row.rank}</span>

      <div className="flex items-center gap-2">
        <div
          className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-[800] text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${row.team.gradient[0]}, ${row.team.gradient[1]})` }}
          aria-hidden
        >
          {row.team.logoUrl ? (
            <Image
              src={row.team.logoUrl}
              alt=""
              width={26}
              height={26}
              className="w-5 h-5 object-contain"
            />
          ) : (
            row.team.abbr
          )}
        </div>
        <span className="text-[13px] font-[700] text-text-700">{row.team.name}</span>
      </div>
    </div>
  )
}
