export default function JoinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] overflow-auto">
      {children}
    </div>
  )
}
