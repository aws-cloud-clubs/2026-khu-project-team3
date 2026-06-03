'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="max-w-container mx-auto px-5 pt-20 flex flex-col items-center gap-4 text-center">
      <span className="text-4xl">🍀</span>
      <h2 className="text-[18px] font-[800] text-text-700">운세를 불러오지 못했습니다</h2>
      <p className="text-[13px] text-text-300">{error.message}</p>
      <button
        onClick={reset}
        className="px-5 py-2 bg-g-600 text-white rounded-full text-[13px] font-[700] hover:bg-g-700 transition-colors"
      >
        다시 시도
      </button>
    </div>
  )
}
