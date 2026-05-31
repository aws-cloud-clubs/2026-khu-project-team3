'use client'

import Icon from '@/components/ui/Icon'

interface ShareButtonProps {
  icon?: 'share' | 'ios_share'
}

export default function ShareButton({ icon = 'share' }: ShareButtonProps) {
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ url: window.location.href }).catch(() => null)
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => null)
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="현재 페이지 공유"
      className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-text-500 transition-colors hover:bg-g-600/10"
    >
      <Icon name={icon} size={22} />
    </button>
  )
}
