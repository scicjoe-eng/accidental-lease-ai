import { LandingHero } from "@/components/landing/landing-hero"
import { OutcomePreviewGrid } from "@/components/landing/outcome-preview-grid"
import { LockedPreviewSection } from "@/components/landing/locked-preview-section"
import { LandingFaq } from "@/components/landing/landing-faq"
import { SeoNavSection } from "@/components/landing/seo-nav-section"

export default async function Home() {
  return (
    <div className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-12">
        <LandingHero />
        <OutcomePreviewGrid />
        <LockedPreviewSection />
        <LandingFaq />
        <SeoNavSection />
      </div>
    </div>
  )
}
