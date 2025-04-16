"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Upload, X, FileText, ImageIcon, Film, CheckCircle2 } from "lucide-react"

interface FileUploaderProps {
  onUploadComplete: () => void
}

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (files.length === 0) return

    setUploading(true)

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 5
      setUploadProgress(progress)

      if (progress >= 100) {
        clearInterval(interval)
        setUploading(false)
        setUploadComplete(true)
        onUploadComplete()
      }
    }, 200)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-blue-500" />
    } else if (file.type.startsWith("video/")) {
      return <Film className="h-5 w-5 text-purple-500" />
    } else {
      return <FileText className="h-5 w-5 text-amber-500" />
    }
  }

  if (uploadComplete) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 border-2 border-dashed rounded-lg border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
        <div className="bg-green-100 dark:bg-green-900 rounded-full p-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="font-medium text-green-700 dark:text-green-400">Upload Complete</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {files.length} file{files.length !== 1 ? "s" : ""} uploaded successfully
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFiles([])
            setUploadComplete(false)
            setUploadProgress(0)
          }}
        >
          Upload More Files
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files)
            setFiles((prev) => [...prev, ...newFiles])
          }
        }}
      >
        <div className="bg-primary/10 rounded-full p-3 mb-4">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-medium">Drag and drop your files here</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">or click to browse files from your device</p>
        <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
          Browse Files
        </Button>
        <input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2 overflow-hidden">
                  {getFileIcon(file)}
                  <span className="text-sm font-medium truncate">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <Button className="w-full" onClick={handleUpload} disabled={uploading || files.length === 0}>
            {uploading ? (
              <>
                Uploading {files.length} file{files.length !== 1 ? "s" : ""}...
              </>
            ) : (
              <>
                Upload {files.length} file{files.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
