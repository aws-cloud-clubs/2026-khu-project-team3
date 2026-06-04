import Image from 'next/image'
import type { Game } from '@/types/game'

interface MatchHeroProps {
  game: Game
}

export default function MatchHero({ game }: MatchHeroProps) {
  return (
    <div className="match-hero rounded-[24px] px-5 py-6" style={{ boxShadow: '0 10px 40px rgba(21,128,61,0.28)' }}>
      {/* 경기 메타 */}
      <div className="flex justify-center mb-5 relative z-10">
        <span className="text-[11px] font-[600] text-white/75 bg-white/15 px-[14px] py-[4px] rounded-full tracking-[0.02em]">
          {game.date} · {game.time} · {game.stadium}
        </span>
      </div>

      {/* 팀 대결 */}
      <div className="flex items-center justify-between text-white relative z-10">
        {/* 홈팀 */}
        <TeamBlock
          name={game.home.fullName}
          logoUrl={game.home.logoUrl}
          emoji={game.home.emoji}
          gradient={game.home.gradient}
          side="home"
          score={game.home.fortuneScore}
        />

        {/* VS */}
        <div className="flex flex-col items-center gap-1 px-3">
          <span className="text-[22px] font-black tracking-[-0.04em] opacity-70">VS</span>
          <div className="w-px h-7 bg-white/30" />
        </div>

        {/* 원정팀 */}
        <TeamBlock
          name={game.away.fullName}
          logoUrl={game.away.logoUrl}
          emoji={game.away.emoji}
          gradient={game.away.gradient}
          side="away"
          score={game.away.fortuneScore}
        />
      </div>

      {/* 운세 힌트 */}
      {(game.home.fortuneScore != null || game.away.fortuneScore != null) && (
        <div
          className="mt-[18px] px-4 py-3 rounded-[14px] flex items-center gap-[10px] relative z-10"
          style={{ background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <span className="text-[18px]" aria-hidden>✨</span>
          <p className="text-[12.5px] text-white/90 font-[500] leading-[1.5] m-0">
            {game.home.name} <strong>행운 지수 {game.home.fortuneScore}점</strong> vs{' '}
            {game.away.name} <strong>{game.away.fortuneScore}점</strong>! 선수 이름을 탭해 개인 운세를 확인하세요.
          </p>
        </div>
      )}
    </div>
  )
}

function TeamBlock({
  name,
  logoUrl,
  emoji,
  gradient,
  side,
  score,
}: {
  name: string
  logoUrl?: string
  emoji: string
  gradient: [string, string]
  side: 'home' | 'away'
  score?: number
}) {
  const shadowColor = side === 'home'
    ? 'rgba(247,110,17,0.4)'
    : 'rgba(4,30,66,0.35)'

  return (
    <div className="flex flex-col items-center gap-[10px] flex-1">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center text-[30px]"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          boxShadow: `0 4px 16px ${shadowColor}`,
          border: '3px solid rgba(255,255,255,0.6)',
        }}
        aria-hidden
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={64}
            height={64}
            className="w-[50px] h-[50px] object-contain"
          />
        ) : (
          emoji
        )}
      </div>
      <div className="text-center">
        <div className="text-[17px] font-black tracking-[-0.02em] leading-[1.2]">{name}</div>
        <span
          className="inline-block mt-[5px] text-[10px] font-[700] px-[10px] py-[2px] rounded-full"
          style={{ background: side === 'home' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.18)' }}
        >
          {side === 'home' ? '홈' : '원정'}
        </span>
        {score != null && (
          <div className="mt-[6px] text-[20px] font-black text-white tracking-[-0.02em]">
            {score}점
          </div>
        )}
      </div>
    </div>
  )
}
