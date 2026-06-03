import Image from 'next/image'

interface PlayerAvatarProps {
  imageUrl?: string
  initials: string
  name: string
}

export default function PlayerAvatar({ imageUrl, initials, name }: PlayerAvatarProps) {
  return (
    <div
      className="w-9 h-9 rounded-full overflow-hidden bg-sage-100 flex items-center justify-center text-[11px] font-[800] text-text-500 flex-shrink-0"
      style={{ border: '1.5px solid rgba(134,239,172,0.22)' }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={36}
          height={36}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
