import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileImage, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

interface FileUploadStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function UploadModal({ isOpen, onClose, onUploadComplete }: UploadModalProps) {
  const [files, setFiles] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles: File[]) => {
    const mediaFiles = newFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    const fileStatuses: FileUploadStatus[] = mediaFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }));
    
    setFiles(prev => [...prev, ...fileStatuses]);
    
    // Show warning for non-media files
    const nonMediaFiles = newFiles.filter(file => 
      !file.type.startsWith('image/') && !file.type.startsWith('video/')
    );
    if (nonMediaFiles.length > 0) {
      toast.warning(`${nonMediaFiles.length} non-media files were ignored`);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;

      // Upload files one by one with individual progress tracking
      for (let i = 0; i < files.length; i++) {
        const fileStatus = files[i];
        const { file } = fileStatus;

        try {
          // Update this file to uploading status
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
          ));

          // Create FormData for single file
          const formData = new FormData();
          formData.append('files', file);

          // Upload with progress tracking
          const response = await fetch('/api/album/upload', {
            method: 'POST',
            body: formData,
          });

          // Simulate progress updates during upload (since we can't get real progress from fetch)
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map((f, index) => {
              if (index === i && f.status === 'uploading' && f.progress < 90) {
                return { ...f, progress: Math.min(f.progress + Math.random() * 20, 90) };
              }
              return f;
            }));
          }, 200);

          const result = await response.json();
          clearInterval(progressInterval);

          if (response.ok && result.successful > 0) {
            // Mark as successful
            setFiles(prev => prev.map((f, index) => 
              index === i ? { ...f, status: 'success' as const, progress: 100 } : f
            ));
            successCount++;
          } else {
            // Mark as error
            const errorMessage = result.errors?.[0] || 'Upload failed';
            setFiles(prev => prev.map((f, index) => 
              index === i ? { ...f, status: 'error' as const, progress: 0, error: errorMessage } : f
            ));
            errorCount++;
          }

          // Small delay between uploads to show progress
          await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          setFiles(prev => prev.map((f, index) => 
            index === i ? { ...f, status: 'error' as const, progress: 0, error: 'Upload failed' } : f
          ));
          errorCount++;
        }
      }

      // Show final results
      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} file${successCount !== 1 ? 's' : ''}`);
      }
      
      if (errorCount > 0) {
        toast.error(`Failed to upload ${errorCount} file${errorCount !== 1 ? 's' : ''}`);
      }

      // Close modal and refresh gallery after a short delay
      setTimeout(() => {
        onUploadComplete?.();
        onClose();
        setFiles([]);
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
      
      // Mark all files as error
      setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const, progress: 0, error: 'Upload failed' })));
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      setFiles([]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Photos</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/40'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop photos & videos here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports images (JPEG, PNG, WebP) and videos (MP4, MOV, AVI) up to 100MB each
            </p>
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              Browse Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 flex-1 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">
                  {files.length} file{files.length !== 1 ? 's' : ''} selected
                </h4>
                {!isUploading && (
                  <Button variant="ghost" size="sm" onClick={clearAll}>
                    Clear All
                  </Button>
                )}
              </div>
              
              {/* Overall Progress */}
              {isUploading && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Upload Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {files.filter(f => f.status === 'success').length} of {files.length} complete
                    </p>
                  </div>
                  <Progress 
                    value={(files.filter(f => f.status === 'success').length / files.length) * 100} 
                    className="h-2" 
                  />
                </div>
              )}
              
              <div className="space-y-2 max-h-60 overflow-auto">
                {files.map((fileStatus, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      fileStatus.status === 'uploading' 
                        ? 'bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800' 
                        : fileStatus.status === 'success'
                        ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                        : fileStatus.status === 'error'
                        ? 'bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800'
                        : 'bg-muted/30'
                    }`}
                  >
                    <FileImage className={`w-5 h-5 flex-shrink-0 ${
                      fileStatus.status === 'uploading' ? 'text-blue-500 animate-pulse' :
                      fileStatus.status === 'success' ? 'text-green-500' :
                      fileStatus.status === 'error' ? 'text-red-500' :
                      'text-muted-foreground'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">{fileStatus.file.name}</p>
                        {fileStatus.status === 'uploading' && (
                          <p className="text-xs text-muted-foreground ml-2">
                            {Math.round(fileStatus.progress)}%
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(fileStatus.file.size / 1024 / 1024).toFixed(1)} MB
                        {fileStatus.file.type.startsWith('video/') && ' (Video)'}
                      </p>
                      {fileStatus.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={fileStatus.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            Uploading...
                          </p>
                        </div>
                      )}
                      {fileStatus.status === 'success' && (
                        <p className="text-xs text-green-600 mt-1">✓ Upload complete</p>
                      )}
                      {fileStatus.error && (
                        <p className="text-xs text-destructive mt-1">✗ {fileStatus.error}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {fileStatus.status === 'uploading' && (
                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      )}
                      {fileStatus.status === 'success' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {fileStatus.status === 'error' && (
                        <AlertCircle className="w-5 h-5 text-destructive" />
                      )}
                      {fileStatus.status === 'pending' && !isUploading && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Cancel'}
          </Button>
          <Button 
            onClick={uploadFiles} 
            disabled={files.length === 0 || isUploading}
          >
            Upload {files.length > 0 ? `${files.length} Photo${files.length !== 1 ? 's' : ''}` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
