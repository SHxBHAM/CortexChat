"use client"
import React, { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Send } from "lucide-react"
/**
 * @param {Object} props
 * @param {function} props.onSendMessage
 * @param {boolean} props.isLoading
 * @param {string} [props.placeholder]
 */
export function ChatInput({ onSendMessage, isLoading, placeholder = "Ask about your uploaded content..." }) {
  const [inputValue, setInputValue] = useState("")
  const handleSendMessage = () => {
    const trimmedMessage = inputValue.trim()
    if (!trimmedMessage || isLoading) return
    onSendMessage(trimmedMessage)
    setInputValue("")
  }
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  return (
    <div className="p-6 border-t border-zinc-800">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSendMessage()
        }}
        className="flex gap-3"
      >
        {/* Message input field */}
        <div className="flex-1 relative">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-zinc-700 pr-12 py-3"
            aria-label="Type your message"
            aria-describedby="input-hint"
          />
          {/* Input hint */}
          {inputValue.length > 0 && (
            <div
              id="input-hint"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500"
              aria-live="polite"
            >
              Enter to send
            </div>
          )}
        </div>
        {/* Send button */}
        <Button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          size="icon"
          className="bg-white text-black hover:bg-zinc-200 w-12 h-12"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  )
} 