import { TopBar } from "@/components/customs/top-bar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* <div
        className="fixed inset-0 z-0 opacity-40"
        style={{
          backgroundImage: `
        linear-gradient(to right, var(--border) 1px, transparent 1px),
        linear-gradient(to bottom, var(--border) 1px, transparent 1px)
      `,
          backgroundSize: "100px 100px",
        }}
      />
      <div className="fixed bottom-0 left-1/2 z-0 aspect-square w-1/2 -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/15 blur-3xl" /> */}

      <TopBar />
      <main className="pt-20">{children}</main>
    </div>
  )
}
