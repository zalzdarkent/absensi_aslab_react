import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DragDropImageUploadProps {
  value?: File | null;
  onValueChange: (file: File | null) => void;
  preview?: string | null;
  onPreviewChange: (preview: string | null) => void;
  className?: string;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export function DragDropImageUpload({
  value,
  onValueChange,
  preview,
  onPreviewChange,
  className,
  accept = "image/*",
  maxSize = 2,
  disabled = false
}: DragDropImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'File harus berupa gambar';
    }

    // Check file size
    const fileSizeInMB = file.size / (1024 * 1024);
    if (fileSizeInMB > maxSize) {
      return `Ukuran file maksimal ${maxSize}MB`;
    }

    return null;
  };

  const processFile = (file: File) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onValueChange(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      onPreviewChange(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  const removeImage = () => {
    onValueChange(null);
    onPreviewChange(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn("space-y-4", className)}>
      {!preview ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
            isDragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-input hover:border-accent hover:bg-accent/5",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-destructive bg-destructive/5"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
          />

          <div className="space-y-4">
            <div className={cn(
              "mx-auto w-12 h-12 flex items-center justify-center rounded-full transition-colors",
              isDragOver ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {isDragOver ? (
                <ImageIcon className="w-6 h-6" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">
                {isDragOver
                  ? "Lepaskan file di sini"
                  : "Drag & drop gambar atau klik untuk upload"
                }
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF hingga {maxSize}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={removeImage}
                disabled={disabled}
              >
                <X className="w-4 h-4 mr-2" />
                Hapus Gambar
              </Button>
            </div>
          </div>

          {value && (
            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded">
              <span className="truncate mr-2">{value.name}</span>
              <span className="whitespace-nowrap">{formatFileSize(value.size)}</span>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}
