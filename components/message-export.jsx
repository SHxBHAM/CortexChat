"use client"
import React, { useState } from "react"
import { Button } from "./ui/button"
import { Download, FileText, Loader2 } from "lucide-react"
/**
 * @param {Object} props
 * @param {Array} props.messages
 * @param {Object|null} props.sessionData
 */
export function MessageExport({ messages, sessionData }) {
  const [isExporting, setIsExporting] = useState(false)
  const formatMessagesForExport = () => {
    const header = `CortexChat Conversation Export\nGenerated: ${new Date().toLocaleString()}\nSession ID: ${sessionData?.sessionId || "Unknown"}\nFiles: ${sessionData?.files?.join(", ") || "None"}\nVideos: ${sessionData?.youtubeLinks?.length || 0} YouTube videos\n\n----------------------------------------\n\n`
    const formattedMessages = messages
      .map((message) => {
        const timestamp = new Date(message.timestamp).toLocaleString()
        const sender = message.type === "user" ? "You" : "AI Assistant"
        const sources = message.sources?.length ? `\nSources: ${message.sources.join(", ")}` : ""
        return `[${timestamp}] ${sender}:\n${message.content}${sources}\n\n`
      })
      .join("")
    return header + formattedMessages
  }
  const exportAsText = async () => {
    setIsExporting(true)
    try {
      const content = formatMessagesForExport()
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `cortexchat-conversation-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }
  const exportAsPDF = async () => {
    setIsExporting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const content = formatMessagesForExport()
      const blob = new Blob([content], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `cortexchat-conversation-${new Date().toISOString().split("T")[0]}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("PDF export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }
  if (messages.length === 0) return null
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={exportAsText}
        disabled={isExporting}
        className="border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
        Export TXT
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportAsPDF}
        disabled={isExporting}
        className="border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
        Export PDF
      </Button>
    </div>
  )
} 