import BackButton from './BackButton'
import ShareButton from './ShareButton'
import CloverLogo from '@/components/ui/CloverLogo'

interface AppHeaderProps {
  showBack?: boolean
  showShare?: boolean
  shareIcon?: 'share' | 'ios_share'
}

export default function AppHeader({ showBack, showShare, shareIcon = 'share' }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/[0.92] backdrop-blur-[22px] shadow-sm">
      <div className="max-w-container mx-auto px-5 py-[11px] flex justify-between items-center">
        <div className="flex items-center gap-2">
          {showBack && <BackButton />}
          <CloverLogo size={showBack ? 'sm' : 'lg'} />
          <span
            className="font-black tracking-[-0.03em] text-g-800"
            style={{ fontSize: showBack ? '16px' : '17px' }}
          >
            사주홈런
          </span>
        </div>
        {showShare && <ShareButton icon={shareIcon} />}
      </div>
    </header>
  )
}
