"use client"

import { useState } from "react"
import { Card, CardContent } from "./ui/card.jsx"
import { Button } from "./ui/button.jsx"
import { Upload, FileText, X, Loader2 } from "lucide-react"

/**
 * File upload zone component with drag-and-drop functionality
 */
export function FileUploadZone({ files, onFilesChange, isUploading }) {
  const [dragActive, setDragActive] = useState(false)

  const handleFileUpload = (uploadedFiles) => {
    const newFiles = Array.from(uploadedFiles)
      .filter((file) => file.type === "application/pdf")
      .map((file) => ({
        file,
        status: "pending",
        progress: 0,
      }))

    onFilesChange([...files, ...newFiles])
  }

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    onFilesChange(updatedFiles)
  }

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(1) + " MB"
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-lg font-medium text-black dark:text-white">PDF Documents</h2>
        </div>

        <div
          className={`border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer ${
            dragActive
              ? "border-zinc-400 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-950"
              : "border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
          }`}
          onDrop={(e) => {
            e.preventDefault()
            setDragActive(false)
            const files = e.dataTransfer.files
            handleFileUpload(files)
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragActive(true)
          }}
          onDragLeave={() => setDragActive(false)}
          onClick={() => document.getElementById("file-input")?.click()}
          role="button"
          tabIndex={0}
        >
          <Upload className="w-8 h-8 mx-auto mb-4 text-zinc-500 dark:text-zinc-600" />
          <p className="text-black dark:text-white mb-1 text-sm">Drop PDF files here or click to browse</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">Supports multiple files up to 10MB each</p>

          <input
            id="file-input"
            type="file"
            multiple
            accept=".pdf"
            className="hidden"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          />
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-black dark:text-white truncate" title={file.file.name}>
                      {file.file.name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{formatFileSize(file.file.size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {file.status === "uploading" && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-zinc-300 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-black dark:bg-white transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-600 dark:text-zinc-400" />
                    </div>
                  )}

                  {file.status === "uploaded" && <div className="w-2 h-2 bg-green-500 rounded-full" title="Upload completed" />}
                  {file.status === "failed" && <div className="w-2 h-2 bg-red-500 rounded-full" title="Upload failed" />}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 