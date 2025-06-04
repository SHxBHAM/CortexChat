"use client"
import React, { useState } from "react"
import { FileText, Youtube, ChevronDown } from "lucide-react"
/**
 * @param {Object} props
 * @param {string} props.selectedSource
 * @param {function} props.onSourceChange
 * @param {Array} props.files
 * @param {Array} props.youtubeLinks
 */
export function SourceSelector({ selectedSource, onSourceChange, files, youtubeLinks }) {
  const [isOpen, setIsOpen] = useState(false)
  const getSelectedSourceText = () => {
    if (selectedSource === "all") return "All Sources"
    if (selectedSource.startsWith("file-")) {
      const index = Number.parseInt(selectedSource.replace("file-", ""))
      return files[index] || "Unknown File"
    }
    if (selectedSource.startsWith("yt-")) {
      const index = Number.parseInt(selectedSource.replace("yt-", ""))
      return `Video ${index + 1}`
    }
    return "All Sources"
  }
  return (
    <div className="relative">
      <label className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-3 block">Query Sources</label>
      {/* Custom dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
        aria-label="Select sources to query"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="truncate">{getSelectedSourceText()}</span>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {/* Dropdown content - absolutely positioned */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          {/* Dropdown menu */}
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-lg z-50 max-h-64 overflow-y-auto">
            {/* All sources option */}
            <button
              onClick={() => {
                onSourceChange("all")
                setIsOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                selectedSource === "all" ? "bg-zinc-100 dark:bg-zinc-900" : ""
              }`}
              role="option"
              aria-selected={selectedSource === "all"}
            >
              All Sources
            </button>
            {/* Separator */}
            {(files.length > 0 || youtubeLinks.length > 0) && (
              <div className="border-t border-zinc-200 dark:border-zinc-800 my-1" />
            )}
            {/* Individual PDF files */}
            {files.map((file, index) => (
              <button
                key={`file-${index}`}
                onClick={() => {
                  onSourceChange(`file-${index}`)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                  selectedSource === `file-${index}` ? "bg-zinc-100 dark:bg-zinc-900" : ""
                }`}
                role="option"
                aria-selected={selectedSource === `file-${index}`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                  <span className="truncate text-xs" title={file}>
                    {file}
                  </span>
                </div>
              </button>
            ))}
            {/* Individual YouTube videos */}
            {youtubeLinks.map((link, index) => (
              <button
                key={`yt-${index}`}
                onClick={() => {
                  onSourceChange(`yt-${index}`)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors ${
                  selectedSource === `yt-${index}` ? "bg-zinc-100 dark:bg-zinc-900" : ""
                }`}
                role="option"
                aria-selected={selectedSource === `yt-${index}`}
              >
                <div className="flex items-center gap-2">
                  <Youtube className="w-3 h-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                  <span className="truncate text-xs">Video {index + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 