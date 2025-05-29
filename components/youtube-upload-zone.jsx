"use client"

import { Card, CardContent } from "./ui/card.jsx"
import { Button } from "./ui/button.jsx"
import { Input } from "./ui/input.jsx"
import { Youtube, Plus, X, Loader2 } from "lucide-react"

/**
 * YouTube video upload component
 */
export function YouTubeUploadZone({ links, onLinksChange, isUploading }) {
  const addYouTubeLink = () => {
    const newLink = {
      id: Date.now().toString(),
      url: "",
      status: "pending",
    }
    onLinksChange([...links, newLink])
  }

  const removeYouTubeLink = (id) => {
    if (links.length > 1) {
      const updatedLinks = links.filter((link) => link.id !== id)
      onLinksChange(updatedLinks)
    }
  }

  const updateYouTubeLink = (id, url) => {
    const updatedLinks = links.map((link) => (link.id === id ? { ...link, url } : link))
    onLinksChange(updatedLinks)
  }

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  return (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Youtube className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <h2 className="text-lg font-medium text-black dark:text-white">YouTube Videos</h2>
        </div>

        <div className="space-y-3">
          {links.map((link, index) => (
            <div key={link.id} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="https://youtube.com/watch?v=..."
                  value={link.url}
                  onChange={(e) => updateYouTubeLink(link.id, e.target.value)}
                  disabled={isUploading}
                  className={`bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-zinc-500 dark:placeholder:text-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-700 ${
                    link.url && !isValidYouTubeUrl(link.url) ? "border-red-500" : ""
                  }`}
                />
                {link.url && !isValidYouTubeUrl(link.url) && (
                  <p className="text-xs text-red-400 mt-1">
                    Please enter a valid YouTube URL
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {link.status === "uploading" && (
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-600 dark:text-zinc-400" />
                )}
                {link.status === "uploaded" && <div className="w-2 h-2 bg-green-500 rounded-full" title="Upload completed" />}
                {link.status === "failed" && <div className="w-2 h-2 bg-red-500 rounded-full" title="Upload failed" />}

                {links.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeYouTubeLink(link.id)}
                    disabled={isUploading}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addYouTubeLink}
            disabled={isUploading}
            className="w-full border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Video
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 