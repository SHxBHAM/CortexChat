"use client"

import { Upload, FileText, ArrowRight } from "lucide-react"

/**
 * How It Works section explaining the three-step process
 * Uses a clean grid layout with icons and descriptions
 * Provides users with clear understanding of the workflow
 */
export function HowItWorksSection() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Content",
      description: "Add PDFs and YouTube videos to build your knowledge base",
    },
    {
      icon: FileText,
      title: "AI Processing",
      description: "Content is analyzed, chunked, and embedded for intelligent retrieval",
    },
    {
      icon: ArrowRight,
      title: "Smart Conversations",
      description: "Ask questions and get contextual answers with source citations",
    },
  ]

  return (
    <section className="mt-24" id="how-it-works" aria-labelledby="how-it-works-title">
      {/* Visually hidden title for screen readers */}
      <h2 id="how-it-works-title" className="sr-only">
        How CortexChat Works
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <div key={step.title} className="text-center">
            {/* Step icon with consistent styling */}
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <step.icon className="w-5 h-5 text-zinc-400" />
            </div>

            {/* Step title and description */}
            <h3 className="text-lg font-medium text-white mb-2">{step.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
