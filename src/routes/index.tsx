import { createFileRoute } from '@tanstack/react-router'
import { LandingHeader } from '@/components/landing/LandingHeader'
import Footer from '@/components/Footer'
import { HeroSection } from '@/components/landing/HeroSection'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { FeaturesSection } from '@/components/landing/FeaturesSection'
import { ShowcaseSection } from '@/components/landing/ShowcaseSection'
import { FAQSection } from '@/components/landing/FAQSection'
import { BottomCTASection } from '@/components/landing/BottomCTASection'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <>
      <LandingHeader />
      <main className="flex flex-col w-full">
        <HeroSection />
        <DashboardPreview />
        <TestimonialsSection />
        <FeaturesSection />
        <ShowcaseSection />
        <FAQSection />
        <BottomCTASection />
      </main>
      <Footer />
    </>
  )
}
