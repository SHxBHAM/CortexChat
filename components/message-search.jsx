"use client"
import React, { useState, useEffect } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search, X, ChevronUp, ChevronDown } from "lucide-react"
/**
 * @param {Object} props
 * @param {Array} props.messages
 * @param {function} props.onHighlightMessage
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 */
export function MessageSearch({ messages, onHighlightMessage, isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentResultIndex, setCurrentResultIndex] = useState(0)
  const [searchResults, setSearchResults] = useState([])
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setCurrentResultIndex(0)
      onHighlightMessage(null)
      return
    }
    const results = messages
      .filter((message) => message.content.toLowerCase().includes(searchQuery.toLowerCase()))
      .map((message) => message.id)
    setSearchResults(results)
    setCurrentResultIndex(0)
    if (results.length > 0) {
      onHighlightMessage(results[0])
    } else {
      onHighlightMessage(null)
    }
  }, [searchQuery, messages, onHighlightMessage])
  const goToNext = () => {
    if (searchResults.length === 0) return
    const nextIndex = (currentResultIndex + 1) % searchResults.length
    setCurrentResultIndex(nextIndex)
    onHighlightMessage(searchResults[nextIndex])
  }
  const goToPrevious = () => {
    if (searchResults.length === 0) return
    const prevIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1
    setCurrentResultIndex(prevIndex)
    onHighlightMessage(searchResults[prevIndex])
  }
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "Enter") {
        if (e.shiftKey) {
          goToPrevious()
        } else {
          goToNext()
        }
        e.preventDefault()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, currentResultIndex, searchResults])
  if (!isOpen) return null
  return (
    <div className="absolute top-4 right-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg p-3 z-50 min-w-80">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
            autoFocus
          />
        </div>
        {/* Navigation controls */}
        {searchResults.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-zinc-500 px-2">
              {currentResultIndex + 1} of {searchResults.length}
            </span>
            <Button variant="ghost" size="sm" onClick={goToPrevious} className="h-8 w-8 p-0">
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={goToNext} className="h-8 w-8 p-0">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>
      {searchQuery && searchResults.length === 0 && <p className="text-xs text-zinc-500 mt-2">No messages found</p>}
    </div>
  )
} 