import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-container mx-auto px-5 pt-20 flex flex-col items-center gap-4 text-center">
      <span className="text-5xl">🍀</span>
      <h1 className="text-[22px] font-black text-text-700">페이지를 찾을 수 없습니다</h1>
      <p className="text-[13px] text-text-300">요청하신 경기 또는 선수 정보가 존재하지 않습니다.</p>
      <Link
        href="/"
        className="mt-2 px-5 py-2 bg-g-600 text-white rounded-full text-[13px] font-[700] hover:bg-g-700 transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
