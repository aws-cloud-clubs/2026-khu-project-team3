import type { FortuneCardData } from '@/types/fortune'
import Icon from '@/components/ui/Icon'

interface FortuneCardProps {
  card: FortuneCardData
}

export default function FortuneCard({ card }: FortuneCardProps) {
  const isHoroscope = card.variant === 'horoscope'

  const iconBg = isHoroscope
    ? 'linear-gradient(135deg, #fef9c3, #fde68a)'
    : 'linear-gradient(135deg, #ffedd5, #fed7aa)'
  const iconBorder = isHoroscope
    ? 'rgba(202,138,4,0.2)'
    : 'rgba(234,88,12,0.2)'
  const iconShadow = isHoroscope
    ? '0 4px 12px rgba(202,138,4,0.15)'
    : '0 4px 12px rgba(234,88,12,0.15)'
  const iconColor = isHoroscope ? '#b45309' : '#c2410c'

  return (
    <section className="bg-card rounded-[20px] shadow-card p-5">
      {/* 헤더 */}
      <div className="flex gap-[14px] items-center mb-[14px]">
        <div
          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg, border: `1.5px solid ${iconBorder}`, boxShadow: iconShadow, color: iconColor }}
        >
          <Icon name={card.icon} size={22} fill />
        </div>
        <h2 className="text-[19px] font-[800] text-text-700 tracking-[-0.02em] leading-[1.25] m-0">
          {isHoroscope ? card.title : `${card.title}${card.score != null ? ` ${card.score}점` : ''}`}
        </h2>
      </div>

      {/* 별자리 운세 */}
      {isHoroscope && (
        <div
          className="p-[14px] rounded-[14px] mb-[10px]"
          style={{ background: '#f0fdf5', border: '1px solid #dcfce8' }}
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
