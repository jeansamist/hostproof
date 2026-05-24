import { TopBar } from "@/components/customs/top-bar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <TopBar />
      <main className="pt-20">{children}</main>
    </div>
  )
}
