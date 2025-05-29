'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Navigation } from '../../components/nav'
import { FileUploadZone } from '../../components/file-upload-zone'
import { YouTubeUploadZone } from '../../components/youtube-upload-zone'

async function extractTextFromPDF(file) {
  // Dynamically import the library ONLY on the client-side when needed
  const pdfjs = await import('pdfjs-dist');
  
  // Configure the worker right after dynamic import
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

  const fileReader = new FileReader();
  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      try {
        const typedArray = new Uint8Array(event.target.result);
        const doc = await pdfjs.getDocument({ data: typedArray }).promise;
        let text = '';
        for (let i = 1; i <= doc.numPages; i++) {
          const page = await doc.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    fileReader.onerror = reject;
    fileReader.readAsArrayBuffer(file);
  });
}

export default function UploadPage() {
  const [files, setFiles] = useState([])
  const [links, setLinks] = useState([{ id: Date.now().toString(), url: "", status: "pending" }])
  const [isUploading, setIsUploading] = useState(false)

  const handleCreateSources = async () => {
    setIsUploading(true)

    const pdfUploadPromises = files
      .filter(f => f.status === 'pending')
      .map(async (fileToUpload) => {
        const originalIndex = files.findIndex(f => f.file.name === fileToUpload.file.name);
        setFiles(prev => prev.map((f, i) => i === originalIndex ? { ...f, status: 'uploading' } : f));
        
        try {
          const text = await extractTextFromPDF(fileToUpload.file);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, filename: fileToUpload.file.name }),
          });

          if (!response.ok) throw new Error('PDF upload failed on the backend');
          
          setFiles(prev => prev.map((f, i) => i === originalIndex ? { ...f, status: 'uploaded' } : f));
        } catch (error) {
          console.error(`Failed to process ${fileToUpload.file.name}`, error)
          setFiles(prev => prev.map((f, i) => i === originalIndex ? { ...f, status: 'failed' } : f));
        }
      })

    const ytUploadPromises = links
      .filter(l => l.url && l.status === 'pending' && isValidYouTubeUrl(l.url))
      .map(async (linkToUpload) => {
        setLinks(prev => prev.map(l => l.id === linkToUpload.id ? { ...l, status: 'uploading' } : l));

        try {
          const response = await fetch('/api/yt', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: linkToUpload.url })
          });
          if (!response.ok) throw new Error('YouTube upload failed');
          
          setLinks(prev => prev.map(l => l.id === linkToUpload.id ? { ...l, status: 'uploaded' } : l));
        } catch (error) {
          console.error(`Failed to upload ${linkToUpload.url}`, error)
          setLinks(prev => prev.map(l => l.id === linkToUpload.id ? { ...l, status: 'failed' } : l));
        }
      })
    
    await Promise.allSettled([...pdfUploadPromises, ...ytUploadPromises])
    setIsUploading(false)
  }

  const isValidYouTubeUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  };

  const allSourcesProcessed = files.every(f => f.status === 'uploaded' || f.status === 'failed') &&
                              links.every(l => l.url === '' || l.status === 'uploaded' || l.status === 'failed');
  const hasPendingSources = files.some(f => f.status === 'pending') || links.some(l => l.url !== '' && l.status === 'pending');


  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <FileUploadZone files={files} onFilesChange={setFiles} isUploading={isUploading} />
          <YouTubeUploadZone links={links} onLinksChange={setLinks} isUploading={isUploading} />

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleCreateSources} 
              disabled={isUploading || !hasPendingSources}
              size="lg"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              {isUploading ? 'Processing...' : 'Create Sources'}
            </Button>
          </div>
          
          {allSourcesProcessed && !isUploading && (files.length > 0 || links.some(l => l.url)) && (
            <div className="text-center p-4 border border-green-500 bg-green-50 dark:bg-green-950 rounded-md">
              <p className="text-green-700 dark:text-green-300">All sources have been processed!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 