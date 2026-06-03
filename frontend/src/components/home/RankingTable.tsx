import type { RankingRow } from '@/types/game'
import RankRow from './RankRow'
import SectionTitle from '@/components/ui/SectionTitle'

interface RankingTableProps {
  rows: RankingRow[]
}

export default function RankingTable({ rows }: RankingTableProps) {
  return (
    <div className="bg-card rounded-[20px] shadow-card px-5 pt-5 pb-3">
      <div className="flex justify-between items-center mb-4">
        <SectionTitle>KBO 순위표</SectionTitle>
      </div>

      {/* 헤더 */}
      <div
        className="grid gap-1 pb-[9px] border-b border-[rgba(168,208,190,0.3)] mb-[2px]"
        style={{ gridTemplateColumns: '28px 1fr 90px 50px' }}
      >
        <span className="text-[11px] font-[600] text-text-300 text-center">순위</span>
        <span className="text-[11px] font-[600] text-text-300">팀</span>
        <span className="text-[11px] font-[600] text-text-300 text-center">승-패-무</span>
        <span className="text-[11px] font-[600] text-text-300 text-right">승률</span>
      </div>

      {rows.map((row, i) => (
        <RankRow key={row.rank} row={row} isLast={i === rows.length - 1} />
      ))}
    </div>
  )
}
