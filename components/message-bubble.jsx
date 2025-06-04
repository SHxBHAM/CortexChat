"use client"
import React from "react"
import { Badge } from "./ui/badge"
import { Bot, User, FileText } from "lucide-react"
import { MessageReactions } from "./message-reactions"
/**
 * @param {Object} props
 * @param {Object} props.message
 * @param {function} props.onReaction
 * @param {string|null} [props.highlightedMessageId]
 * @param {string} [props.searchQuery]
 */
export function MessageBubble({ message, onReaction, highlightedMessageId, searchQuery }) {
  const isUser = message.type === "user"
  const isAI = message.type === "ai"
  const isHighlighted = highlightedMessageId === message.id
  const highlightSearchTerms = (content, query) => {
    if (!query) return content
    const regex = new RegExp(`(${query})`, "gi")
    const parts = content.split(regex)
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }
  return (
    <div
      className={`flex gap-4 group ${isUser ? "justify-end" : "justify-start"} ${
        isHighlighted ? "bg-yellow-50 dark:bg-yellow-900/20 -mx-6 px-6 py-2" : ""
      }`}
      role="article"
      aria-label={`${isUser ? "Your" : "AI"} message`}
    >
      <div className={`flex gap-4 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div
          className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
            isUser
              ? "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              : "bg-black dark:bg-white"
          }`}
          aria-hidden="true"
        >
          {isUser ? (
            <User className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          ) : (
            <Bot className="w-4 h-4 text-white dark:text-black" />
          )}
        </div>
        {/* Message content */}
        <div className="flex flex-col gap-2">
          <div
            className={`p-4 ${
              isUser
                ? "message-bubble-user text-black dark:text-white"
                : "message-bubble-ai text-zinc-900 dark:text-zinc-100"
            }`}
          >
            {/* Message text with streaming indicator */}
            <div className="prose prose-zinc dark:prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed text-sm">
                {highlightSearchTerms(message.content, searchQuery)}
                {message.streaming && (
                  <span className="animate-pulse ml-1" aria-label="AI is typing">
                    |
                  </span>
                )}
              </div>
            </div>
            {/* Source attribution for AI messages */}
            {isAI && message.sources && message.sources.length > 0 && !message.streaming && (
              <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-2">Sources:</p>
                <div className="flex flex-wrap gap-2" role="list">
                  {message.sources.map((source, index) => (
                    <Badge
                      key={`${source}-${index}`}
                      variant="outline"
                      className="text-xs border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-950"
                      role="listitem"
                    >
                      <FileText className="w-3 h-3 mr-1" aria-hidden="true" />
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Message reactions for AI messages */}
          {isAI && !message.streaming && (
            <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <MessageReactions messageId={message.id} onReaction={onReaction} currentReaction={message.reaction} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 