interface CloverLogoProps {
  size?: 'lg' | 'sm'
}

export default function CloverLogo({ size = 'lg' }: CloverLogoProps) {
  const containerSize = size === 'lg' ? 'w-9 h-9 rounded-[11px]' : 'w-[30px] h-[30px] rounded-[9px]'
  const svgW = size === 'lg' ? 22 : 20
  const svgH = size === 'lg' ? 24 : 22

  return (
    <div className={`${containerSize} bg-g-100 flex items-center justify-center flex-shrink-0`}>
      <svg
        width={svgW}
        height={svgH}
        viewBox="0 0 22 24"
        fill="none"
        className="animate-sparkle"
        aria-label="사주홈런 로고"
      >
        <circle cx="7"  cy="7"  r="6.2" fill="#16a34a" />
        <circle cx="15" cy="7"  r="6.2" fill="#22c55e" />
        <circle cx="7"  cy="15" r="6.2" fill="#22c55e" />
        <circle cx="15" cy="15" r="6.2" fill="#16a34a" />
        <circle cx="11" cy="11" r="3.8" fill="#dcfce8" />
        <path d="M9.5 8.2 Q7.8 11 9.5 13.8"  stroke="#ef4444" strokeWidth="0.65" strokeLinecap="round" fill="none" />
        <path d="M12.5 8.2 Q14.2 11 12.5 13.8" stroke="#ef4444" strokeWidth="0.65" strokeLinecap="round" fill="none" />
        <line x1="9.5"  y1="9.3"  x2="10.5" y2="9.0"  stroke="#ef4444" strokeWidth="0.5" strokeLinecap="round" />
        <line x1="8.9"  y1="11"   x2="10.1" y2="11"   stroke="#ef4444" strokeWidth="0.5" strokeLinecap="round" />
        <line x1="9.5"  y1="12.7" x2="10.5" y2="13.0" stroke="#ef4444" strokeWidth="0.5" strokeLinecap="round" />
        <line x1="12.5" y1="9.3"  x2="11.5" y2="9.0"  stroke="#ef4444" strokeWidth="0.5" strokeLinecap="round" />
        <line x1="13.1" y1="11"   x2="11.9" y2="11"   stroke="#ef4444" strokeWidth="0.5" strokeLinecap="round" />
        <line x1="12.5" y1="12.7" x2="11.5" y2="13.0" stroke="#ef4444" strokeWidth="0.5" strokeLinecap="round" />
        <path d="M11 19 Q10.4 21.8 9.5 23" stroke="#15803d" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  )
}
