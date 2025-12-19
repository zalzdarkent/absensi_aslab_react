import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    ArrowLeft,
    Package,
    Save,
    Image as ImageIcon,
    Upload,
    X
} from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { LokasiCombobox } from '@/components/ui/lokasi-combobox';

interface Bahan {
    id: number;
    nama: string;
    lokasi?: {
        id: number;
        nama_lokasi: string;
    };
    jenis_bahan: string;
    stok: number;
    catatan?: string;
    gambar?: string;
}

interface Props {
    bahan: Bahan;
    lokasis: { id: number; nama_lokasi: string }[];
    success?: string;
    newLokasi?: { id: number; nama_lokasi: string };
}

export default function BahanEdit({ bahan, lokasis, success, newLokasi }: Props) {
    const [previewImage, setPreviewImage] = useState<string | null>(
        bahan.gambar ? `/storage/${bahan.gambar}` : null
    );
    const [lokasiList, setLokasiList] = useState<{ id: number; nama_lokasi: string }[]>(lokasis);
    const [isLokasiDialogOpen, setIsLokasiDialogOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        nama: bahan.nama || '',
        lokasi_id: bahan.lokasi ? bahan.lokasi.id : '',
        jenis_bahan: bahan.jenis_bahan || '',
        stok: bahan.stok || 0,
        catatan: bahan.catatan || '',
        gambar: null as File | null,
        _method: 'PUT'
    });

    const { data: lokasiData, setData: setLokasiData, post: postLokasi, processing: lokasiProcessing, errors: lokasiErrors } = useForm({
        nama_lokasi: '',
        redirect_to: `/bahan/${bahan.id}/edit`,
    });

    React.useEffect(() => {
        if (newLokasi && success) {
            setLokasiList(prev => {
                const exists = prev.find(item => item.id === newLokasi.id);
                if (!exists) {
                    return [...prev, newLokasi];
                }
                return prev;
            });

            setData('lokasi_id', newLokasi.id.toString());
            setIsLokasiDialogOpen(false);
            toast.success(success);
        }
    }, [newLokasi, success, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/bahan/${bahan.id}`, {
            onSuccess: () => {
                toast.success('Bahan berhasil diperbarui!');
            },
            onError: (errors) => {
                console.error('Update errors:', errors);
                toast.error('Terjadi kesalahan saat memperbarui bahan');
            }
        });
    };

    const handleLokasiSubmit = () => {
        if (!lokasiData.nama_lokasi.trim()) {
            return;
        }

        postLokasi('/lokasi', {
            onSuccess: () => {
                // redirect handled by backend
            },
            onError: (errors) => {
                console.error('Error adding lokasi:', errors);
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('gambar', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('gambar', null);
        setPreviewImage(bahan.gambar ? `/storage/${bahan.gambar}` : null);

        // Reset file input
        const fileInput = document.getElementById('gambar') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit Bahan - ${bahan.nama}`} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" asChild>
                        <Link href={`/bahan/${bahan.id}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Package className="h-8 w-8 text-purple-600" />
                            Edit Bahan
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Perbarui informasi bahan laboratorium
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Form Fields */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Bahan</CardTitle>
                                <CardDescription>
                                    Perbarui detail informasi bahan
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="nama">Nama Bahan *</Label>
                                        <Input
                                            id="nama"
                                            type="text"
                                            value={data.nama}
                                            onChange={(e) => setData('nama', e.target.value)}
                                            className={errors.nama ? 'border-red-500' : ''}
                                            placeholder="Masukkan nama bahan"
                                        />
                                        {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="jenis_bahan">Jenis Bahan *</Label>
                                        <Input
                                            id="jenis_bahan"
                                            type="text"
                                            value={data.jenis_bahan}
                                            onChange={(e) => setData('jenis_bahan', e.target.value)}
                                            className={errors.jenis_bahan ? 'border-red-500' : ''}
                                            placeholder="Masukkan jenis bahan"
                                        />
                                        {errors.jenis_bahan && <p className="text-red-500 text-sm mt-1">{errors.jenis_bahan}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="lokasi_id">Lokasi *</Label>
                                        <LokasiCombobox
                                            value={data.lokasi_id?.toString()}
                                            onValueChange={(value) => setData('lokasi_id', value)}
                                            placeholder="Cari dan pilih lokasi..."
                                            lokasiOptions={lokasiList}
                                            onAddNew={() => setIsLokasiDialogOpen(true)}
                                            disabled={processing}
                                        />
                                        {errors.lokasi_id && <p className="text-red-500 text-sm mt-1">{errors.lokasi_id}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="stok">Stok *</Label>
                                        <Input
                                            id="stok"
                                            type="number"
                                            min="0"
                                            value={data.stok}
                                            onChange={(e) => setData('stok', parseInt(e.target.value) || 0)}
                                            className={errors.stok ? 'border-red-500' : ''}
                                            placeholder="0"
                                        />
                                        {errors.stok && <p className="text-red-500 text-sm mt-1">{errors.stok}</p>}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="catatan">Catatan</Label>
                                    <Textarea
                                        id="catatan"
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        className={errors.catatan ? 'border-red-500' : ''}
                                        placeholder="Masukkan catatan tambahan (opsional)"
                                        rows={4}
                                    />
                                    {errors.catatan && <p className="text-red-500 text-sm mt-1">{errors.catatan}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5" />
                                    Foto Bahan
                                </CardTitle>
                                <CardDescription>
                                    Upload foto bahan (opsional)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {previewImage ? (
                                    <div className="relative">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={removeImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                                        <div className="text-center">
                                            <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Belum ada foto</p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="gambar" className="cursor-pointer">
                                        <div className="flex items-center gap-2 justify-center w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <Upload className="h-4 w-4" />
                                            <span className="text-sm">
                                                {data.gambar ? 'Ganti Foto' : 'Upload Foto'}
                                            </span>
                                        </div>
                                    </Label>
                                    <input
                                        id="gambar"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    {errors.gambar && <p className="text-red-500 text-sm mt-1">{errors.gambar}</p>}
                                </div>

                                <p className="text-xs text-gray-500">
                                    Format: JPEG, PNG, JPG, GIF. Maksimal 2MB.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <Card className="mt-6">
                            <CardContent className="pt-6">
                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        {processing ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Memperbarui...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Save className="h-4 w-4" />
                                                Perbarui Bahan
                                            </span>
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                        className="w-full"
                                    >
                                        <Link href={`/bahan/${bahan.id}`}>
                                            Batal
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
            <Dialog open={isLokasiDialogOpen} onOpenChange={setIsLokasiDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Tambah Lokasi Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nama_lokasi">Nama Lokasi *</Label>
                            <Input
                                id="nama_lokasi"
                                type="text"
                                value={lokasiData.nama_lokasi}
                                onChange={(e) => setLokasiData('nama_lokasi', e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleLokasiSubmit();
                                    }
                                }}
                                placeholder="Contoh: Lab Kimia"
                                required
                            />
                            {lokasiErrors.nama_lokasi && <p className="text-red-500 text-sm mt-1">{lokasiErrors.nama_lokasi}</p>}
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsLokasiDialogOpen(false)}>
                                Batal
                            </Button>
                            <Button type="button" onClick={handleLokasiSubmit} disabled={lokasiProcessing}>
                                {lokasiProcessing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

