"use client"
import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { History, Trash2, MessageSquare, Calendar } from "lucide-react"
/**
 * @param {Object} props
 * @param {function} props.onLoadConversation
 * @param {Array} props.currentMessages
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 */
export function ConversationHistory({ onLoadConversation, currentMessages, isOpen, onClose }) {
  const [savedConversations, setSavedConversations] = useState([])
  useEffect(() => {
    const saved = localStorage.getItem("cortexchat-conversations")
    if (saved) {
      try {
        const conversations = JSON.parse(saved).map((conv) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          messages: conv.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        setSavedConversations(conversations)
      } catch (error) {
        console.error("Failed to load conversations:", error)
      }
    }
  }, [isOpen])
  const saveToStorage = (conversations) => {
    localStorage.setItem("cortexchat-conversations", JSON.stringify(conversations))
    setSavedConversations(conversations)
  }
  const generateTitle = (messages) => {
    const firstUserMessage = messages.find((msg) => msg.type === "user")
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "")
    }
    return `Conversation ${new Date().toLocaleDateString()}`
  }
  const saveCurrentConversation = () => {
    if (currentMessages.length === 0) return
    const newConversation = {
      id: Date.now().toString(),
      title: generateTitle(currentMessages),
      messages: currentMessages,
      createdAt: new Date(),
      messageCount: currentMessages.length,
    }
    const updated = [newConversation, ...savedConversations].slice(0, 10)
    saveToStorage(updated)
  }
  const loadConversation = (conversation) => {
    onLoadConversation(conversation.messages)
    onClose()
  }
  const deleteConversation = (id) => {
    const updated = savedConversations.filter((conv) => conv.id !== id)
    saveToStorage(updated)
  }
  if (!isOpen) return null
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
              <h2 className="text-lg font-medium text-black dark:text-white">Conversation History</h2>
            </div>
            <Button variant="ghost" onClick={onClose} className="text-zinc-600 dark:text-zinc-400">
              ×
            </Button>
          </div>
          {/* Save current conversation */}
          {currentMessages.length > 0 && (
            <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-black dark:text-white">Current Conversation</h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">{currentMessages.length} messages</p>
                </div>
                <Button onClick={saveCurrentConversation} size="sm">
                  Save
                </Button>
              </div>
            </div>
          )}
          {/* Saved conversations list */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {savedConversations.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                <p className="text-zinc-600 dark:text-zinc-400">No saved conversations yet</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-500">
                  Start chatting and save your conversations to access them later
                </p>
              </div>
            ) : (
              savedConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                  onClick={() => loadConversation(conversation)}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-black dark:text-white truncate">{conversation.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        {conversation.createdAt.toLocaleDateString()}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {conversation.messageCount} messages
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conversation.id)
                    }}
                    className="text-zinc-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 