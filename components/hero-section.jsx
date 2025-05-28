"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Italic } from "lucide-react"
import Link from "next/link"

/**
 * Hero section component for the landing page
 * Implements a clean, conversion-focused design with:
 * - Large, attention-grabbing headline
 * - Clear value proposition
 * - Single primary CTA leading to upload page
 * - Social proof through statistics
 */
export function HeroSection() {
  return (
    <section className="py-24 px-6" role="banner">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main headline with emphasis on key value prop */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-black dark:text-white leading-tight">
          Intelligence Meets
          <br />
          Your Content
        </h1>

        {/* Supporting description explaining the core functionality */}
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          Upload PDFs and YouTube videos, then engage in intelligent conversations powered by <span className="italic">your very own</span> knowledge base.
        </p>

        {/* Call-to-action button */}
        <div className="flex justify-center mb-16">
          <Link href="/upload">
            <Button
              size="lg"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black cursor-pointer hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium transition-colors"
              aria-label="Start using CortexChat for free"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Social proof statistics to build credibility */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-2xl font-bold text-black dark:text-white mb-1">lots of</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-500">Documents Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black dark:text-white mb-1">99.9% (lie)</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-500">Accuracy Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-black dark:text-white mb-1">{"< 2s"}</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-500">Response Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}
