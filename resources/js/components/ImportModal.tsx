import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BulkImageUpload } from './BulkImageUpload';
import { FileSpreadsheet, Image as ImageIcon, Download, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";


export function ImportModal() {
    const [open, setOpen] = useState(false);
    const [targetType, setTargetType] = useState<'aset' | 'bahan'>('aset');
    const [activeTab, setActiveTab] = useState<'excel' | 'images'>('excel');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [excelFile, setExcelFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [totalRows, setTotalRows] = useState(0);

    const { data, setData, post, processing, reset } = useForm({
        file: null as File | null,
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setExcelFile(file);
        if (file) {
            fetchPreview(file);
        } else {
            setPreviewData([]);
        }
    };

    const fetchPreview = async (file: File) => {
        setLoadingPreview(true);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await axios.post('/import/preview', formData);
            setPreviewData(response.data.data);
            setTotalRows(response.data.total);
        } catch (error) {
            toast.error('Gagal membaca preview file');
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleImportExcel = () => {
        if (!excelFile) {
            toast.error('Pilih file Excel/CSV terlebih dahulu');
            return;
        }

        const formData = new FormData();
        formData.append('file', excelFile);

        router.post(targetType === 'aset' ? '/import/aset' : '/import/bahan', formData, {
            onSuccess: () => {
                setOpen(false);
                setExcelFile(null);
                setPreviewData([]);
                toast.success('Data berhasil diimport!');
            },
            onError: (errors) => {
                Object.values(errors).forEach(err => toast.error(err as string));
            }
        });
    };

    const handleBulkImages = () => {
        if (selectedImages.length === 0) {
            toast.error('Pilih foto terlebih dahulu');
            return;
        }

        const formData = new FormData();
        selectedImages.forEach((img) => formData.append('images[]', img));
        formData.append('type', targetType);

        router.post('/import/bulk-images', formData, {
            onSuccess: () => {
                setOpen(false);
                setSelectedImages([]);
                toast.success('Foto berhasil disinkronkan!');
            },
            onError: (errors) => {
                toast.error('Gagal mengunggah foto');
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Import Excel</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[1000px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Import Data Inventor</DialogTitle>
                    <DialogDescription>
                        Import data sekaligus dari Spreadsheet dan kelola foto barang.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2 overflow-y-auto flex-1 px-1">
                    {/* Target Type Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Pilih Tipe Data:</label>
                        <div className="flex p-1 bg-muted rounded-lg w-fit">
                            <button
                                onClick={() => { setTargetType('aset'); setPreviewData([]); setExcelFile(null); }}
                                className={`px - 4 py - 1.5 text - xs font - semibold rounded - md transition - all ${targetType === 'aset' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                                    } `}
                            >
                                Aset
                            </button>
                            <button
                                onClick={() => { setTargetType('bahan'); setPreviewData([]); setExcelFile(null); }}
                                className={`px - 4 py - 1.5 text - xs font - semibold rounded - md transition - all ${targetType === 'bahan' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                                    } `}
                            >
                                Bahan
                            </button>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-muted rounded-lg">
                        <button
                            onClick={() => setActiveTab('excel')}
                            className={`flex - 1 flex items - center justify - center gap - 2 py - 2 text - sm font - medium rounded - md transition - all ${activeTab === 'excel' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                                } `}
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Spreadsheet
                        </button>
                        <button
                            onClick={() => setActiveTab('images')}
                            className={`flex - 1 flex items - center justify - center gap - 2 py - 2 text - sm font - medium rounded - md transition - all ${activeTab === 'images' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'
                                } `}
                        >
                            <ImageIcon className="w-4 h-4" />
                            Sinkron Foto
                        </button>
                    </div>

                    {activeTab === 'excel' ? (
                        <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                                <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1 flex items-center gap-1">
                                    <Download className="w-3 h-3" /> Header Kolom Wajib
                                </h4>
                                <p className="text-[10px] text-blue-700 dark:text-blue-400 leading-relaxed font-mono">
                                    nama barang, {targetType === 'aset' ? 'jenis, kondisi, ' : 'jenis_bahan, '}quantity, lokasi barang, catatan, foto barang
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div
                                    className={`border - 2 border - dashed rounded - xl p - 6 text - center transition - all cursor - pointer flex flex - col justify - center items - center ${excelFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                                        } `}
                                    onClick={() => document.getElementById('excel-input')?.click()}
                                >
                                    <input
                                        id="excel-input"
                                        type="file"
                                        accept=".xlsx,.csv,.xls"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    {excelFile ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle2 className="w-8 h-8 text-primary" />
                                            <p className="text-sm font-medium truncate max-w-[200px]">{excelFile.name}</p>
                                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setExcelFile(null); setPreviewData([]); }}>Ganti File</Button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="w-8 h-8 text-muted-foreground opacity-50" />
                                            <p className="text-sm font-medium">Klik untuk pilih file Excel/CSV</p>
                                            <p className="text-xs text-muted-foreground">Maksimal 5MB</p>
                                        </div>
                                    )}
                                </div>

                                <div className="lg:col-span-2">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <h4 className="text-sm font-medium flex items-center gap-2">
                                                Preview Data {totalRows > 0 && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{totalRows} baris ditemukan</span>}
                                            </h4>
                                            {loadingPreview && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
                                        </div>

                                        <div className="border rounded-lg overflow-hidden bg-background/50">
                                            <div className="w-full overflow-x-auto">
                                                <div className="max-h-[250px] overflow-auto">
                                                    <Table>
                                                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                                                            <TableRow>
                                                                <TableHead className="w-[50px]">No</TableHead>
                                                                <TableHead className="min-w-[150px]">Nama Barang</TableHead>
                                                                <TableHead>{targetType === 'aset' ? 'Jenis' : 'Jenis Bahan'}</TableHead>
                                                                <TableHead>Stok</TableHead>
                                                                <TableHead>Lokasi</TableHead>
                                                                {targetType === 'aset' && <TableHead>Kondisi</TableHead>}
                                                                <TableHead>Gambar</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {previewData.length > 0 ? (
                                                                previewData.map((row, idx) => (
                                                                    <TableRow key={idx}>
                                                                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                                                                        <TableCell className="font-medium">{row.nama}</TableCell>
                                                                        <TableCell>{row.jenis}</TableCell>
                                                                        <TableCell>{row.stok}</TableCell>
                                                                        <TableCell>{row.lokasi}</TableCell>
                                                                        {targetType === 'aset' && <TableCell>{row.kondisi}</TableCell>}
                                                                        <TableCell className="text-[10px] italic text-muted-foreground">{row.gambar}</TableCell>
                                                                    </TableRow>
                                                                ))
                                                            ) : (
                                                                <TableRow>
                                                                    <TableCell colSpan={targetType === 'aset' ? 7 : 6} className="h-32 text-center text-muted-foreground">
                                                                        {loadingPreview ? 'Sedang membaca file...' : 'Pilih file untuk melihat preview'}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <BulkImageUpload
                                onFilesSelected={setSelectedImages}
                                uploading={processing}
                            />
                            {selectedImages.length > 0 && (
                                <p className="text-xs text-center text-muted-foreground">
                                    {selectedImages.length} foto siap diunggah
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Batal</Button>
                    <Button
                        disabled={processing || loadingPreview || (activeTab === 'excel' ? !excelFile : selectedImages.length === 0)}
                        onClick={activeTab === 'excel' ? handleImportExcel : handleBulkImages}
                        className="min-w-[140px]"
                    >
                        {processing ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Memproses...</>
                        ) : (
                            'Import Sekarang'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
