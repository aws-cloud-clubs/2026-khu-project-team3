import type { FortuneCardData } from '@/types/fortune'

interface FortuneCardProps {
  card: FortuneCardData
}

export default function FortuneCard({ card }: FortuneCardProps) {
  const isHoroscope = card.variant === 'horoscope'

  return (
    <section className="bg-card rounded-[20px] shadow-card p-5">
      {/* 헤더 */}
      <div className="mb-[14px]">
        <h2 className="text-[19px] font-[800] text-text-700 tracking-[-0.02em] leading-[1.25] m-0">
          {isHoroscope ? card.title : `${card.title}${card.score != null ? ` ${card.score}점` : ''}`}
        </h2>
      </div>

      {/* 운세 설명 */}
      {card.description && (
        <div
          className="p-[14px] rounded-[14px] mb-[10px]"
          style={{
            background: '#f0fdf5',
            border: '1px solid #dcfce8',
          }}
        >
          <p className="text-[13px] leading-[1.65] text-text-500 m-0">{card.description}</p>
        </div>
      )}

      {/* 카테고리 · 기준일 */}
      <div className="flex items-center gap-[6px] mt-[10px]">
        <span className="text-[10px] font-[700] text-text-100 tracking-[0.04em]">
          {card.categoryLabel}
        </span>
        {card.referenceDate && (
          <span className="text-[10px] font-[600] text-text-100 opacity-60">
            · 기준 {card.referenceDate}
          </span>
        )}
      </div>
    </section>
  )
}
