"use client"

import React, { useRef, useState } from "react"
import { ChatArea } from "../../components/chat-area"
import { KnowledgeBaseSidebar } from "../../components/knowledge-base-sidebar"

// Demo session data and files
const demoFiles = ["example.pdf", "notes.pdf"]
const demoYoutubeLinks = ["https://youtu.be/abc123"]
const demoSessionData = {
  sessionId: "demo-session-1",
  files: demoFiles,
  youtubeLinks: demoYoutubeLinks,
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      type: "user",
      content: "What is in the PDF?",
      timestamp: new Date(),
    },
    {
      id: "2",
      type: "ai",
      content: "The PDF contains notes on AI and machine learning.",
      timestamp: new Date(),
      sources: ["example.pdf"],
      reaction: null,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSource, setSelectedSource] = useState("all")
  const messagesEndRef = useRef(null)

  // Simulate sending a message
  const handleSendMessage = (content) => {
    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    setIsLoading(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: `AI response to: ${content}`,
          timestamp: new Date(),
          sources: selectedSource === "all" ? demoFiles : [selectedSource],
          reaction: null,
        },
      ])
      setIsLoading(false)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 1200)
  }

  // Simulate loading a conversation
  const handleLoadConversation = (loadedMessages) => {
    setMessages(loadedMessages)
  }

  // Simulate reactions
  const handleReaction = (messageId, reaction) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, reaction } : msg
      )
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black grid grid-cols-1 lg:grid-cols-5 gap-0">
      <KnowledgeBaseSidebar
        selectedSource={selectedSource}
        onSourceChange={setSelectedSource}
        files={demoFiles}
        youtubeLinks={demoYoutubeLinks}
      />
      <div className="lg:col-span-4 flex flex-col h-screen">
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onLoadConversation={handleLoadConversation}
          onReaction={handleReaction}
          messagesEndRef={messagesEndRef}
          sessionData={demoSessionData}
        />
      </div>
    </div>
  )
} 