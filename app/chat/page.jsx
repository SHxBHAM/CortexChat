"use client"

import React, { useRef, useState, useEffect } from "react"
import { ChatArea } from "../../components/chat-area"
import { KnowledgeBaseSidebar } from "../../components/knowledge-base-sidebar"
import { useSession, signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"

const demoSessionData = {
  sessionId: "demo-session-1",
  files: [],
}

export default function ChatPage() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSource, setSelectedSource] = useState("all")
  const messagesEndRef = useRef(null)
  const [error, setError] = useState(null)
  const [files, setFiles] = useState([]) // [{id, name}]
  const [filesLoading, setFilesLoading] = useState(true)
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Loading...</div>
  }
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-900 dark:to-zinc-800">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 flex flex-col items-center w-full max-w-sm">
          <FcGoogle className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">Sign in to CortexChat</h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-300 text-center">Please sign in with Google to chat with your knowledge base.</p>
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-lg shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <FcGoogle className="w-6 h-6" /> Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  // Fetch user's uploaded documents
  useEffect(() => {
    async function fetchFiles() {
      setFilesLoading(true)
      try {
        const res = await fetch("/api/documents")
        const data = await res.json()
        if (res.ok && data.documents) {
          setFiles(data.documents.map(doc => ({ id: doc.id, name: doc.name })))
        } else {
          setFiles([])
        }
      } catch (err) {
        setFiles([])
      } finally {
        setFilesLoading(false)
      }
    }
    fetchFiles()
  }, [])

  // Send a message
  const handleSendMessage = async (content) => {
    const newMessage = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, newMessage])
    setIsLoading(true)
    setError(null)
    try {
      let sourceToSend = selectedSource
      if (selectedSource.startsWith("file-")) {
        // Already in the correct format (file-<id>)
        sourceToSend = selectedSource
      } else if (selectedSource === "all") {
        sourceToSend = "all"
      }
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: content,
          source: sourceToSend,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to get answer")
      }
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "ai",
          content: data.answer,
          timestamp: new Date(),
          sources: data.sources,
          reaction: null,
        },
      ])
    } catch (err) {
      setError(err.message)
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          type: "ai",
          content: `Error: ${err.message}`,
          timestamp: new Date(),
          sources: [],
          reaction: null,
        },
      ])
    } finally {
      setIsLoading(false)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
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
        files={files}
      />
      <div className="lg:col-span-4 flex flex-col h-screen">
        {filesLoading && (
          <div className="bg-blue-100 text-blue-700 p-2 text-sm text-center">Loading your documents...</div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 text-sm text-center">{error}</div>
        )}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onLoadConversation={handleLoadConversation}
          onReaction={handleReaction}
          messagesEndRef={messagesEndRef}
          sessionData={{ ...demoSessionData, files: files.map(f => f.name) }}
        />
      </div>
    </div>
  )
} 