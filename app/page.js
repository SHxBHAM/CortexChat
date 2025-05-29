"use client"

import { Navigation } from "../components/nav.jsx"
import { HeroSection } from "../components/hero-section.jsx"
import { FeaturesSection } from "../components/features-section.jsx"
import { HowItWorksSection } from "../components/how-section.jsx"

/**
 * Home page component - main landing page
 * Features:
 * - Clean hero section with single CTA
 * - Feature showcase
 * - How it works explanation
 * - Responsive design with light/dark mode support
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <main className="max-w-4xl mx-auto px-6 pb-24">
        <HowItWorksSection />
      </main>
      
    </div>
  )
}
