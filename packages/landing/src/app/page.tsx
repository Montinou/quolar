import { Hero } from '@/components/Hero'
import { EcosystemShowcase } from '@/components/EcosystemShowcase'
import { Features } from '@/components/Features'
import { WorkflowDiagram } from '@/components/WorkflowDiagram'
import { SetupInstructions } from '@/components/SetupInstructions'
import { QuickStart } from '@/components/QuickStart'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <EcosystemShowcase />
      <Features />
      <WorkflowDiagram />
      <SetupInstructions />
      <QuickStart />
      <Footer />
    </main>
  )
}
