import type { Metadata } from 'next'
import AppHeader from '@/components/layout/AppHeader'
import LiveGamesSection from '@/components/home/LiveGamesSection'
import RankingTable from '@/components/home/RankingTable'
import { getGames } from '@/lib/api/games'
import { getRanking } from '@/lib/api/games'

export const metadata: Metadata = {
  title: '사주홈런 — 오늘의 경기',
  description: '오늘의 KBO 경기와 KBO 순위표를 확인하세요.',
}

export default async function HomePage() {
  const [games, ranking] = await Promise.all([getGames(), getRanking()])

  return (
    <>
      <AppHeader />
      <main className="max-w-container mx-auto px-5 pt-[18px] pb-[130px] flex flex-col gap-6">
        <LiveGamesSection games={games} />
        <RankingTable rows={ranking} />
      </main>
    </>
  )
}
