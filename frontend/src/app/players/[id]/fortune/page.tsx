import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AppHeader from '@/components/layout/AppHeader'
import PlayerHero from '@/components/fortune/PlayerHero'
import FortuneCard from '@/components/fortune/FortuneCard'
import { getPlayerById } from '@/lib/api/players'
import { getFortuneByPlayerId } from '@/lib/api/fortune'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const player = await getPlayerById(params.id)
  if (!player) return { title: '사주홈런' }
  return {
    title: `${player.name} 오늘의 운세 | 사주홈런`,
    description: `${player.teamFullName} ${player.name} 선수의 오늘의 별자리 운세와 사주팔자 오행 분석을 확인하세요.`,
  }
}

export default async function FortunePage({ params }: Props) {
  const [player, fortune] = await Promise.all([
    getPlayerById(params.id),
    getFortuneByPlayerId(params.id),
  ])

  if (!player || !fortune) notFound()

  return (
    <>
      <AppHeader showBack showShare shareIcon="ios_share" />
      <main className="max-w-container mx-auto px-5 pt-[18px] pb-[130px] flex flex-col gap-4">
        <PlayerHero player={player} summary={fortune.summary} />
        {fortune.cards.map((card, i) => (
          <FortuneCard key={i} card={card} />
        ))}
      </main>
    </>
  )
}
