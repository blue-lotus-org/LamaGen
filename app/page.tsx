import { Header } from "@/components/header"
import { AgentGenerator } from "@/components/agent-generator"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto py-8 px-4">
        <AgentGenerator />
      </div>
      <Footer />
    </main>
  )
}

