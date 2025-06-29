"use client"
import React from "react"
import { Card, CardContent } from "./ui/card"
import { FileText } from "lucide-react"
import { SourceSelector } from "./source-selector"
/**
 * @param {Object} props
 * @param {string} props.selectedSource
 * @param {function} props.onSourceChange
 * @param {Array<{id: string, name: string}>} props.files
 */
export function KnowledgeBaseSidebar({ selectedSource, onSourceChange, files }) {
  return (
    <Card className="lg:col-span-1 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black h-full flex flex-col">
      <CardContent className="p-4 flex flex-col h-full">
        {/* Source selector - fixed at top */}
        <div className="flex-shrink-0 mb-4">
          <SourceSelector
            selectedSource={selectedSource}
            onSourceChange={onSourceChange}
            files={files}
          />
        </div>
        {/* Knowledge base overview - scrollable */}
        <div className="flex-1 min-h-0">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-3">Knowledge Base</h3>
          <div
            className="space-y-2 overflow-y-auto h-full pr-2"
            role="list"
            aria-label="Uploaded documents"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            {/* PDF files list */}
            {files.map((file) => (
              <div
                key={`file-${file.id}`}
                className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs"
                role="listitem"
              >
                <FileText className="w-3 h-3 text-zinc-600 dark:text-zinc-400 flex-shrink-0" aria-hidden="true" />
                <span className="truncate text-zinc-600 dark:text-zinc-300" title={file.name}>
                  {file.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 