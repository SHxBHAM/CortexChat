'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Navigation } from '../../components/nav'
import { FileUploadZone } from '../../components/file-upload-zone'

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);

    const uploadPromises = files
      .filter(f => f.status === 'pending')
      .map(async (fileToUpload) => {
        const originalIndex = files.findIndex(f => f.file.name === fileToUpload.file.name);
        
        // Update status to 'uploading'
        setFiles(prev => prev.map((f, i) => i === originalIndex ? { ...f, status: 'uploading' } : f));
        
        try {
          const formData = new FormData();
          formData.append('file', fileToUpload.file);
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Upload failed');
          }
          
          // Update status to 'uploaded' on success
          setFiles(prev => prev.map((f, i) => i === originalIndex ? { ...f, status: 'uploaded' } : f));
        } catch (error) {
          console.error(`Failed to upload ${fileToUpload.file.name}:`, error);
          // Update status to 'failed' on error
          setFiles(prev => prev.map((f, i) => i === originalIndex ? { ...f, status: 'failed', error: error.message } : f));
        }
      });

    await Promise.allSettled(uploadPromises);
    setIsUploading(false);
  };

  const hasPendingFiles = files.some(f => f.status === 'pending');

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <FileUploadZone files={files} onFilesChange={setFiles} isUploading={isUploading} />

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleUpload} 
              disabled={!hasPendingFiles || isUploading}
              size="lg"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              {isUploading ? 'Uploading...' : `Upload ${files.filter(f=>f.status === 'pending').length} file(s)`}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}