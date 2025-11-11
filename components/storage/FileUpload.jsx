'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Upload,
  X,
  File,
  Image,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

function FileUpload({
  onUpload,
  onDelete,
  currentFile,
  fileType = 'general', // 'profile', 'document', 'assignment', 'general'
  entityId,
  entityType,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  allowedTypes = [],
  className = '',
  showPreview = true,
  multiple = false
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setError('')

    // Validate files
    for (const file of files) {
      if (file.size > maxSize) {
        setError(`File "${file.name}" is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`)
        return
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        setError(`File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
        return
      }
    }

    if (!multiple && files.length > 1) {
      setError('Only one file can be uploaded at a time.')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileType', fileType)
        if (entityId) formData.append('entityId', entityId)
        if (entityType) formData.append('entityType', entityType)

        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()

        // Simulate progress for better UX
        setUploadProgress(((index + 1) / files.length) * 100)

        return result.file
      })

      const uploadedFiles = await Promise.all(uploadPromises)

      setUploadedFiles(prev => [...prev, ...uploadedFiles])

      if (onUpload) {
        onUpload(multiple ? uploadedFiles : uploadedFiles[0])
      }

      setUploadProgress(100)

    } catch (error) {
      console.error('Upload error:', error)
      setError(error.message || 'Upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (fileId) => {
    try {
      const response = await fetch(`/api/storage/upload?fileId=${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      setUploadedFiles(prev => prev.filter(file => file.id !== fileId))

      if (onDelete) {
        onDelete(fileId)
      }

    } catch (error) {
      console.error('Delete error:', error)
      setError(error.message || 'Delete failed')
    }
  }

  const getFileIcon = (fileType, mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return <Image className="h-8 w-8 text-blue-500" />
    } else if (mimeType === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />
    } else {
      return <File className="h-8 w-8 text-gray-500" />
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                {multiple ? 'Upload Files' : 'Upload File'}
              </h3>
              <p className="text-sm text-gray-600">
                Drag and drop or click to select {multiple ? 'files' : 'a file'}
              </p>
              <p className="text-xs text-gray-500">
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
                {allowedTypes.length > 0 && ` • Allowed: ${allowedTypes.join(', ')}`}
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mt-4"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File{multiple ? 's' : ''}
                </>
              )}
            </Button>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-gray-600 text-center">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current File Preview */}
      {currentFile && showPreview && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              {getFileIcon(currentFile.fileType, currentFile.mimeType)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {currentFile.fileName}
                </p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(currentFile.size)} • Uploaded {new Date(currentFile.uploadedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  Current
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(currentFile.downloadURL, '_blank')}
                >
                  View
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Uploaded Files</h4>
          {uploadedFiles.map((file) => (
            <Card key={file.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.fileType, file.mimeType)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {file.fileName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(file.downloadURL, '_blank')}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload
