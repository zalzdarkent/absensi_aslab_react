import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface BulkImageUploadProps {
    onFilesSelected: (files: File[]) => void;
    uploading?: boolean;
    className?: string;
    maxFiles?: number;
}

export function BulkImageUpload({
    onFilesSelected,
    uploading = false,
    className,
    maxFiles = 50
}: BulkImageUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

        if (newFiles.length + selectedFiles.length > maxFiles) {
            toast.error(`Maksimal ${maxFiles} file sekaligus`);
            return;
        }

        const updatedFiles = [...selectedFiles, ...newFiles];
        setSelectedFiles(updatedFiles);
        onFilesSelected(updatedFiles);
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const removeFile = (index: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        onFilesSelected(updatedFiles);
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                    isDragOver
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                    uploading && "opacity-50 pointer-events-none"
                )}
            >
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                        <Upload className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold">Klik atau seret foto ke sini</p>
                        <p className="text-xs text-muted-foreground text-balance">
                            Pastikan nama file foto sama dengan yang ada di Excel (contoh: <span className="font-mono">iphone.jpg</span>)
                        </p>
                    </div>
                </div>
            </div>

            {selectedFiles.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                    {selectedFiles.map((file, index) => (
                        <div key={index} className="relative group rounded-md border bg-card p-2 flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium truncate">{file.name}</p>
                                <p className="text-[8px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
