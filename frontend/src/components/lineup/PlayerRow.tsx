import Link from 'next/link'
import type { LineupSlot } from '@/types/player'
import PlayerAvatar from './PlayerAvatar'

interface PlayerRowProps {
  slot: LineupSlot
  side: 'home' | 'away'
  isLast?: boolean
}

export default function PlayerRow({ slot, side, isLast }: PlayerRowProps) {
  const orderLabel = slot.battingOrder === 'P' ? 'P' : String(slot.battingOrder)
  const posClass = side === 'home'
    ? 'bg-g-100 text-g-800'
    : 'text-[#7a568f]'
  const posStyle = side === 'away' ? { background: 'rgba(122,86,143,0.10)' } : {}

  return (
    <Link
      href={`/players/${slot.player.id}/fortune`}
      className={`grid gap-[10px] items-center py-[9px] rounded-[10px] transition-all hover:bg-g-600/5 hover:px-[6px] ${
        isLast ? '' : 'border-b border-[rgba(168,208,190,0.18)]'
      }`}
      style={{ gridTemplateColumns: '24px 36px 1fr auto' }}
    >
      <span className="text-[11px] font-[700] text-text-100 text-center">{orderLabel}</span>
      <PlayerAvatar
        imageUrl={slot.player.imageUrl}
        initials={slot.player.initials}
        name={slot.player.name}
      />
      <span className="text-[14px] font-[700] text-text-700">{slot.player.name}</span>
      <span
        className={`text-[10px] font-[700] px-[8px] py-[2px] rounded-full whitespace-nowrap ${posClass}`}
        style={posStyle}
      >
        {slot.position}
      </span>
    </Link>
  )
}
