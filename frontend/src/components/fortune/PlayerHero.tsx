import Image from 'next/image'
import type { Player } from '@/types/player'

interface PlayerHeroProps {
  player: Player
}

export default function PlayerHero({ player }: PlayerHeroProps) {
  return (
    <section
      className="player-hero rounded-[28px] text-white relative"
      style={{ padding: '28px 24px 24px', boxShadow: '0 12px 44px rgba(21,128,61,0.32)' }}
    >
      {/* 배경 장식 원 */}
      <div
        className="absolute top-[-30px] right-[-30px] w-[130px] h-[130px] rounded-full z-0"
        style={{ background: 'rgba(255,255,255,0.06)' }}
        aria-hidden
      />
      <div
        className="absolute bottom-[-20px] left-[-20px] w-[90px] h-[90px] rounded-full z-0"
        style={{ background: 'rgba(255,255,255,0.04)' }}
        aria-hidden
      />

      {/* 프로필 */}
      <div className="flex items-center gap-5 relative z-10">
        <div
          className="w-[100px] h-[100px] rounded-full overflow-hidden flex-shrink-0"
          style={{ border: '3px solid rgba(255,255,255,0.6)' }}
        >
          {player.imageUrl ? (
            <Image
              src={player.imageUrl}
              alt={player.name}
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-g-600 flex items-center justify-center text-[22px] font-[800] text-white">
              {player.initials}
            </div>
          )}
        </div>

        <div className="flex-1">
          <span
            className="inline-block text-[10px] font-[700] px-[10px] py-[3px] rounded-full mb-2 tracking-[0.02em]"
            style={{ background: '#FFD4AE', color: '#b84f00' }}
          >
            ⚾ {player.teamFullName}
          </span>
          <h1 className="text-[26px] font-black tracking-[-0.03em] leading-[1.15] mb-2">
            {player.name}
          </h1>
          <div className="flex gap-[6px] flex-wrap">
            {player.positions.map((pos) => (
              <span
                key={pos}
                className="text-[10px] font-[700] px-[10px] py-[3px] rounded-full"
                style={{ background: '#BAE6FD', color: '#0369a1' }}
              >
                {pos}
              </span>
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}
