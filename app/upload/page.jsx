'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Navigation } from '../../components/nav'
import { FileUploadZone } from '../../components/file-upload-zone'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";

export default function UploadPage() {
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }
  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-900 dark:to-zinc-800">
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl p-10 flex flex-col items-center w-full max-w-sm">
          <FcGoogle className="w-16 h-16 mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">Sign in to CortexChat</h1>
          <p className="mb-6 text-zinc-600 dark:text-zinc-300 text-center">Please sign in with Google to upload your documents and start chatting with your knowledge base.</p>
          <button
            onClick={() => signIn("google")}
            className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold text-lg shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <FcGoogle className="w-6 h-6" /> Sign in with Google
          </button>
        </div>
      </div>
    );
  }

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
  const hasUploadedFiles = files.some(f => f.status === 'uploaded');

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Navigation />
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          <FileUploadZone files={files} onFilesChange={setFiles} isUploading={isUploading} />

          <div className="flex justify-end pt-4 gap-4">
            <Button 
              onClick={handleUpload} 
              disabled={!hasPendingFiles || isUploading}
              size="lg"
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            >
              {isUploading ? 'Uploading...' : `Upload ${files.filter(f=>f.status === 'pending').length} file(s)`}
            </Button>
            <Button
              onClick={() => router.push('/chat')}
              disabled={!hasUploadedFiles}
              size="lg"
              className="bg-zinc-700 dark:bg-zinc-300 text-white dark:text-black hover:bg-zinc-900 dark:hover:bg-zinc-100"
            >
              Go to Chat
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}