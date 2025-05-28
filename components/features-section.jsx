"use client"

import { Upload, MessageSquare, Brain, Shield, Zap, FileText } from "lucide-react"

/**
 * Features section showcasing key product capabilities
 * Highlights the main value propositions with icons and descriptions
 */
export function FeaturesSection() {
  const features = [
    {
      icon: Upload,
      title: "Multi-Format Support",
      description:
        "Upload PDFs and YouTube videos seamlessly. Our AI processes diverse content types for comprehensive knowledge extraction.",
    },
    {
      icon: Brain,
      title: "Advanced RAG Technology",
      description:
        "Powered by state-of-the-art Retrieval-Augmented Generation for accurate, contextual responses from your content.",
    },
    {
      icon: MessageSquare,
      title: "Intelligent Conversations",
      description:
        "Engage in natural dialogue with your documents. Ask questions, get summaries, and explore insights interactively.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description:
        "Your data stays secure. We prioritize privacy with enterprise-grade security and data protection measures.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Get instant responses with our optimized processing pipeline. No waiting, just immediate intelligent answers.",
    },
    {
      icon: FileText,
      title: "Source Attribution",
      description:
        "Every answer includes source references, so you can verify information and dive deeper into your content.",
    },
  ]

  return (
    <section className="py-24 px-6 bg-zinc-50 dark:bg-zinc-950" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-black dark:text-white">
            Powerful Features for Smart Content Interaction
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
            Transform how you interact with your documents and videos using cutting-edge AI technology
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-6 bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 hover:shadow-lg dark:hover:bg-zinc-900 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{feature.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
