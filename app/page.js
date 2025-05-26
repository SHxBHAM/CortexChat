"use client"

import { Navigation } from "@/components/nav"
import { HeroSection } from "@/components/hero-section"

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
    </div>
  )
}
