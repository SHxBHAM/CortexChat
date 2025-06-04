"use client"
import React from "react"
/**
 * Typing indicator component showing AI is processing
 */
export function TypingIndicator() {
  return (
    <div className="flex gap-4 justify-start" role="status" aria-label="AI is typing">
      <div className="flex gap-4 max-w-[85%]">
        {/* AI Avatar */}
        <div
          className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-black dark:bg-white"
          aria-hidden="true"
        >
          <div className="w-4 h-4 text-white dark:text-black">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V19C3 20.1 3.9 21 5 21H11V19H5V3H13V9H21Z" />
            </svg>
          </div>
        </div>
        {/* Typing animation */}
        <div className="message-bubble-ai text-zinc-900 dark:text-zinc-100 p-4 flex items-center">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms", animationDuration: "1.4s" }}
            />
            <div
              className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce"
              style={{ animationDelay: "200ms", animationDuration: "1.4s" }}
            />
            <div
              className="w-2 h-2 bg-zinc-400 dark:bg-zinc-600 rounded-full animate-bounce"
              style={{ animationDelay: "400ms", animationDuration: "1.4s" }}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 