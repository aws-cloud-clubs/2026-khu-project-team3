export default function Loading() {
  return (
    <div className="max-w-container mx-auto px-5 pt-[18px] flex flex-col gap-5 animate-pulse">
      <div className="rounded-[24px] h-52 bg-g-100" />
      <div className="bg-card rounded-[20px] h-10" />
      <div className="bg-card rounded-[20px] h-80" />
    </div>
  )
}
