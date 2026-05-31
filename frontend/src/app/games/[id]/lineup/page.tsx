import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AppHeader from '@/components/layout/AppHeader'
import MatchHero from '@/components/lineup/MatchHero'
import LineupTabs from '@/components/lineup/LineupTabs'
import { getGameById } from '@/lib/api/games'
import { getLineup } from '@/lib/api/players'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const game = await getGameById(params.id)
  if (!game) return { title: '사주홈런' }
  return {
    title: `${game.home.name} vs ${game.away.name} 선발 라인업 | 사주홈런`,
    description: `${game.date ?? ''} ${game.home.fullName} vs ${game.away.fullName} 선발 라인업과 운세 점수를 확인하세요.`,
  }
}

export default async function LineupPage({ params }: Props) {
  const [game, lineup] = await Promise.all([
    getGameById(params.id),
    getLineup(params.id),
  ])

  if (!game || !lineup) notFound()

  return (
    <>
      <AppHeader showBack showShare shareIcon="share" />
      <main className="max-w-container mx-auto px-5 pt-[18px] pb-[130px] flex flex-col gap-5">
        <MatchHero game={game} />
        <LineupTabs lineup={lineup} />
      </main>
    </>
  )
}
