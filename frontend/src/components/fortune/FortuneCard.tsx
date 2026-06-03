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
      <div className="flex gap-[14px] items-flex-start mb-[14px]">
        <div
          className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0"
          style={{ background: iconBg, border: `1.5px solid ${iconBorder}`, boxShadow: iconShadow, color: iconColor }}
        >
          <Icon name={card.icon} size={22} fill />
        </div>
        <div className="flex-1">
          <span className="block text-[10px] font-[700] text-text-100 tracking-[0.04em] mb-[3px]">
            {card.categoryLabel}
          </span>
          <h2 className="text-[16px] font-[800] text-text-700 tracking-[-0.02em] leading-[1.25]">
            {card.title}
          </h2>
        </div>
      </div>

      {/* 별자리 운세 */}
      {isHoroscope && card.score != null && (
        <>
          <div className="mb-[14px]">
            <div className="flex justify-between mb-[6px]">
              <span className="text-[11px] font-[600] text-text-300">오늘의 행운 지수</span>
              <span className="text-[12px] font-[800] text-g-700">{card.score} / 100</span>
            </div>
            <div className="fortune-bar-track">
              <div className="fortune-bar-fill" style={{ width: `${card.score}%` }} />
            </div>
          </div>

          <div
            className="flex items-center gap-4 p-[14px] rounded-[14px]"
            style={{ background: '#f0fdf5', border: '1px solid #dcfce8' }}
          >
            <span className="text-[44px] font-black text-g-700 tracking-[-0.04em] flex-shrink-0 leading-none">
              {card.rank}
              <span className="text-[18px] font-[600] text-g-500">위</span>
            </span>
            <p className="text-[13px] leading-[1.65] text-text-500 m-0">{card.description}</p>
          </div>
        </>
      )}

      {/* 사주 운세 */}
      {!isHoroscope && (
        <>
          {card.tags && card.tags.length > 0 && (
            <div className="flex gap-[6px] mb-[14px] flex-wrap">
              {card.element && (
                <span
                  className="text-[11px] font-[800] px-3 py-1 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #ffedd5, #fed7aa)',
                    color: '#c2410c',
                    border: '1px solid rgba(234,88,12,0.2)',
                  }}
                >
                  🔥 {card.element} (불)
                </span>
              )}
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] font-[700] text-text-300 bg-sage-100 px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p
            className="text-[13px] leading-[1.75] text-text-500 m-0 p-[14px] rounded-[14px]"
            style={{ background: '#f6f9f7', border: '1px solid #eaf0ec' }}
            dangerouslySetInnerHTML={{
              __html: card.description
                .replace(/불\(火\)/g, '<strong style="color:#c2410c">불(火)</strong>')
                .replace(/\n\n/g, '<br><br>'),
            }}
          />
        </>
      )}
    </section>
  )
}
