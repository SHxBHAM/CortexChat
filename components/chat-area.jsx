"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Bot, Search, History } from "lucide-react"
import { MessageBubble } from "./message-bubble"
import { ChatInput } from "./chat-input"
import { TypingIndicator } from "./typing-indicator"
import { MessageSearch } from "./message-search"
import { MessageExport } from "./message-export"
import { ConversationHistory } from "./conversation-history"

/**
 * @param {Object} props
 * @param {Array} props.messages
 * @param {boolean} props.isLoading
 * @param {function} props.onSendMessage
 * @param {function} props.onLoadConversation
 * @param {function} props.onReaction
 * @param {object} props.messagesEndRef
 * @param {object|null} props.sessionData
 */
export function ChatArea({
  messages,
  isLoading,
  onSendMessage,
  onLoadConversation,
  onReaction,
  messagesEndRef,
  sessionData,
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [highlightedMessageId, setHighlightedMessageId] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault()
        setIsSearchOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Card className="lg:col-span-4 flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black h-full relative">
      <CardContent className="flex-1 flex flex-col p-0 h-full min-h-0">
        {/* Chat header with controls */}
        <div className="flex-shrink-0 p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-black dark:text-white">Chat</h2>
              {messages.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {messages.length} messages
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                title="Search messages (Ctrl+F)"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHistoryOpen(true)}
                className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
                title="Conversation history"
              >
                <History className="w-4 h-4" />
              </Button>
              <MessageExport messages={messages} sessionData={sessionData} />
            </div>
          </div>
        </div>
        {/* Messages container - scrollable area */}
        <div className="flex-1 overflow-y-auto relative">
          <div className="p-6 space-y-6 min-h-full">
            {/* Empty state */}
            {messages.length === 0 && (
              <div className="flex items-center justify-center min-h-full">
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-medium text-black dark:text-white mb-2">
                    Ready to explore your knowledge
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-4">Ask me anything about your uploaded content</p>
                  {/* Example queries */}
                  <div className="flex flex-wrap justify-center gap-2 text-sm">
                    <Badge
                      variant="outline"
                      className="border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      onClick={() => onSendMessage("Summarize the main points")}
                    >
                      "Summarize the main points"
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      onClick={() => onSendMessage("What are the key takeaways?")}
                    >
                      "What are the key takeaways?"
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      onClick={() => onSendMessage("Explain this concept")}
                    >
                      "Explain this concept"
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            {/* Message list */}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onReaction={onReaction}
                highlightedMessageId={highlightedMessageId}
                searchQuery={searchQuery}
              />
            ))}
            {/* Typing indicator */}
            {isLoading && <TypingIndicator />}
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
          {/* Message search overlay */}
          <MessageSearch
            messages={messages}
            onHighlightMessage={setHighlightedMessageId}
            isOpen={isSearchOpen}
            onClose={() => {
              setIsSearchOpen(false)
              setHighlightedMessageId(null)
              setSearchQuery("")
            }}
          />
        </div>
        {/* Chat input - fixed at bottom */}
        <div className="flex-shrink-0">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </CardContent>
      {/* Conversation history modal */}
      <ConversationHistory
        onLoadConversation={onLoadConversation}
        currentMessages={messages}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </Card>
  )
} 