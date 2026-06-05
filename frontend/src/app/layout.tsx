import type { Metadata } from 'next'
import { Noto_Sans_KR, Inter } from 'next/font/google'
import './globals.css'

const notoSansKr = Noto_Sans_KR({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-noto',
  display: 'swap',
  preload: false,
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '사주홈런 — KBO 선수 운세',
  description: '오늘의 KBO 경기와 선수 사주팔자 운세를 확인하세요.',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: '사주홈런',
    description: '오늘의 KBO 경기와 선수 사주팔자 운세를 확인하세요.',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: import('react').ReactNode }) {
  return (
    <html lang="ko" className={`${notoSansKr.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
