"use client"

import { Button } from "@/components/ui/button"
import { Menu} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

/**
 * Navigation component providing the main application header
 * Features:
 * - Responsive design with mobile hamburger menu
 * - Theme toggle integration
 * - Clean styling that adapts to light/dark modes
 * - Accessible navigation links with proper hover states
 */
export function Navigation() {
  return (
    <nav
      className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Brand logo and name */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 bg-black dark:bg-white flex items-center justify-center transition-transform group-hover:scale-105">
              <div className="w-3 h-3 bg-white dark:bg-black" />
            </div>
            <span className="text-lg font-medium text-black dark:text-white">CortexChat</span>
          </Link>

          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
              aria-label="Navigate to features section"
            >
              Features
            </a>
            <a
              href="#docs"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-sm"
              aria-label="Navigate to documentation"
            >
              Docs
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="View GitHub repository"
            >
            <Link href={"https://github.com/SHxBHAM/CortexChat"}>
            Github
            </Link>
              
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Open mobile menu"
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
