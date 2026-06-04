import Link from 'next/link'
import Image from 'next/image'
import type { Game } from '@/types/game'
import Badge from '@/components/ui/Badge'

interface GameCardProps {
  game: Game
}

export default function GameCard({ game }: GameCardProps) {
  const badgeVariant = game.status === 'today' ? 'today' : 'scheduled'
  const gameDate = formatGameDate(game.date)
  const gameTime = formatGameTime(game.time)
  const stadiumMeta = game.stadium

  return (
    <Link
      href={`/games/${game.id}/lineup`}
      className="block w-full flex-shrink-0 px-2 pt-1 pb-3 cursor-pointer active:opacity-70"
      style={{ scrollSnapAlign: 'start' }}
    >
      <div className="flex justify-between items-center mb-[18px]">
        <div className="flex items-center gap-[10px]">
          <Badge variant={badgeVariant}>{game.statusLabel}</Badge>
          {gameDate && (
            <span className="text-[11px] font-[700] text-text-300">{gameDate}</span>
          )}
          {gameTime && (
            <span className="text-[11px] text-text-300">{gameTime}</span>
          )}
        </div>
        {stadiumMeta && <span className="text-[11px] text-text-300">{stadiumMeta}</span>}
      </div>
      <div className="flex items-center justify-between">
        <TeamInfo name={game.home.name} logoUrl={game.home.logoUrl} emoji={game.home.emoji} gradient={game.home.gradient} />
        <span className="text-[18px] font-black text-text-300 tracking-[-0.02em]">VS</span>
        <TeamInfo name={game.away.name} logoUrl={game.away.logoUrl} emoji={game.away.emoji} gradient={game.away.gradient} />
      </div>
    </Link>
  )
}

function formatGameTime(time: string | undefined): string | null {
  if (!time) return null
  return time.length >= 5 ? time.slice(0, 5) : time
}

function formatGameDate(date: string | undefined): string | null {
  if (!date) return null
  const normalized = date.replaceAll('.', '-')
  const parsed = new Date(normalized)
  if (Number.isNaN(parsed.getTime())) return date

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

function TeamInfo({
  name,
  logoUrl,
  emoji,
  gradient,
}: {
  name: string
  logoUrl?: string
  emoji: string
  gradient: [string, string]
}) {
  return (
    <div className="flex flex-col items-center gap-[7px] min-w-[60px]">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-[22px]"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          boxShadow: '0 3px 10px rgba(0,0,0,0.14)',
          border: '2px solid rgba(255,255,255,0.85)',
        }}
        aria-hidden
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={48}
            height={48}
            className="w-[38px] h-[38px] object-contain"
          />
        ) : (
          emoji
        )}
      </div>
      <span className="text-[12px] font-[800] text-text-700">{name}</span>
    </div>
  )
}
