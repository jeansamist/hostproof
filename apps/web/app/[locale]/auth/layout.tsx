import { Card } from "@packages/ui/card"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative min-h-screen w-full overflow-auto">
      <div
        className="fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
      />
      <div className="fixed bottom-0 left-1/2 z-0 aspect-square w-1/2 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative z-10 container mx-auto flex min-h-screen items-center justify-center px-2 py-6 sm:px-4 md:px-6 md:py-10">
        <Card className="w-full max-w-xl">{children}</Card>
      </div>
    </main>
  )
}
