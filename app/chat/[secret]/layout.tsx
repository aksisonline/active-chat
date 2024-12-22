import { use } from 'react'

export default function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ secret: string }>
}) {
  const resolvedParams = use(params)
  const secret = decodeURIComponent(resolvedParams.secret)

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Chat Room: {secret}</h1>
      </div>
      {children}
    </div>
  )
}

