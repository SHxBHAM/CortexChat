"use client"
import React, { useState } from "react"
import { Button } from "./ui/button"
import { ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react"
/**
 * @param {Object} props
 * @param {string} props.messageId
 * @param {function} props.onReaction
 * @param {string|null} [props.currentReaction]
 */
export function MessageReactions({ messageId, onReaction, currentReaction }) {
  const [copied, setCopied] = useState(false)
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText("Message content would be copied here")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy message:", error)
    }
  }
  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReaction(messageId, "like")}
        className={`h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 ${
          currentReaction === "like" ? "bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400" : ""
        }`}
        aria-label="Like this response"
      >
        <ThumbsUp className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onReaction(messageId, "dislike")}
        className={`h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 ${
          currentReaction === "dislike" ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" : ""
        }`}
        aria-label="Dislike this response"
      >
        <ThumbsDown className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={copyMessage}
        className="h-8 w-8 p-0 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-label="Copy message"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  )
} 