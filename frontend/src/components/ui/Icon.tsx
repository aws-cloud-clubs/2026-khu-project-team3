interface IconProps {
  name: string
  size?: number
  fill?: boolean
  className?: string
}

export default function Icon({ name, size = 24, fill = false, className = '' }: IconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
      }}
      aria-hidden
    >
      {name}
    </span>
  )
}
