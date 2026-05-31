'use client'

import { useRouter } from 'next/navigation'
import Icon from '@/components/ui/Icon'

export default function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      aria-label="이전 페이지로 이동"
      className="w-9 h-9 rounded-full flex items-center justify-center text-g-700 transition-colors hover:bg-g-600/10"
    >
      <Icon name="arrow_back" size={22} />
    </button>
  )
}
