import React, { DragEvent, ChangeEvent, FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { uploadFile } from '@/api/portfolioApiSlice';

type UploadStatusType = 'uploading' | 'success' | 'error' | null

interface UploadResponse {
  success: boolean;
  fileUrls?: string[];
  message?: string;
}

export interface UploadArgs {
  formData: FormData,
  port_id: string,
}

interface FileUploadProps {
  port_id?: string,
}

export const FileUpload = ({
  port_id
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const uploadMutation = useMutation<UploadResponse, Error, UploadArgs>({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      setUploadStatus('success');
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setUploadStatus(null);
      }, 3000);
    },
    onError: (error) => {
      setUploadStatus('error');
      setErrorMessage(error.message || 'Failed to upload files');
    },
  })

  const handleDrag = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  const handleFiles = (newFiles: FileList): void => {
    const filesArray = Array.from(newFiles);
    setFiles(prev => [...prev, ...filesArray]);
  };
  
  const removeFile = (index: number): void => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (files.length === 0) return;

    const invalidFiles = files.filter(file => {
      // Check by file extension
      return !file.name.toLowerCase().endsWith('.csv');
      // Alternative: Check by MIME type
      // return file.type !== 'text/csv';
    });
    
    if (invalidFiles.length > 0) {
      setUploadStatus('error');
      setErrorMessage(`Only CSV files are allowed. Please remove: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setUploadStatus('uploading');
    setErrorMessage(null);
    
    // Create FormData object to send files
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    if (!port_id) {
      console.error("No portfolio id")
      return;
    }
    
    // Execute the mutation
    uploadMutation.mutate({formData, port_id: port_id});
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Upload</CardTitle>
        <CardDescription>Upload your files here</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive ? "border-primary bg-primary/10" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm font-medium">
                  Drag and drop your files here, or{" "}
                  <Label
                    htmlFor="file-upload"
                    className="relative cursor-pointer text-primary hover:underline"
                  >
                    browse
                  </Label>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Support for images, documents, and other files
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleChange}
                multiple
              />
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Selected files:</h3>
                <ul className="space-y-2">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span className="text-sm truncate max-w-xs">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {uploadStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Your files have been uploaded successfully.
                </AlertDescription>
              </Alert>
            )}

            {uploadStatus === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || "An error occurred during upload."}
                </AlertDescription>
              </Alert>
            )}

          </div>

          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={files.length === 0 || uploadStatus === "uploading"}
          >
            {uploadMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Uploading...
              </span>
            ) : (
              "Upload Files"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};