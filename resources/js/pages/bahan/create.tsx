import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DragDropImageUpload } from '@/components/ui/drag-drop-image-upload';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';

import { LokasiCombobox } from '@/components/ui/lokasi-combobox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Lokasi {
    id: number;
    nama_lokasi: string;
}

interface Props {
    success?: string;
    lokasis: Lokasi[];
    newLokasi?: Lokasi;
}

export default function BahanCreate({ success, lokasis, newLokasi }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [lokasiList, setLokasiList] = useState<Lokasi[]>(lokasis);
    const [isLokasiDialogOpen, setIsLokasiDialogOpen] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        lokasi_id: '',
        jenis_bahan: '',
        stok: 1,
        catatan: '',
        gambar: null as File | null,
    });

    const { data: lokasiData, setData: setLokasiData, post: postLokasi, processing: lokasiProcessing, errors: lokasiErrors } = useForm({
        nama_lokasi: '',
        redirect_to: '/bahan/create',
    });

    // Show success toast
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
    }, [success]);

    useEffect(() => {
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

        const formData = new FormData();
        formData.append('nama', data.nama);
        formData.append('lokasi_id', data.lokasi_id);
        formData.append('jenis_bahan', data.jenis_bahan);
        formData.append('stok', data.stok.toString());
        formData.append('catatan', data.catatan);
        if (data.gambar) {
            formData.append('gambar', data.gambar);
        }

        post('/bahan', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Bahan berhasil ditambahkan!');
            },
        });
    };

    const handleImageChange = (file: File | null) => {
        setData('gambar', file);
    };

    const handlePreviewChange = (preview: string | null) => {
        setImagePreview(preview);
    };

    const handleNamaChange = (value: string) => {
        setData('nama', value);
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

    return (
        <AppLayout>
            <Head title="Tambah Bahan" />

            <div className="space-y-6 pt-4">
                {/* Header */}
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="w-fit">
                        <Link href="/aset-aslab">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tambah Bahan</h1>
                        <p className="text-muted-foreground mt-2">
                            Tambahkan bahan baru ke dalam inventaris laboratorium
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-4xl">
                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left: form fields (span 2) */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Informasi Dasar */}
                                        <div className="space-y-4">
                                            <div className="border-b pb-4">
                                                <h3 className="text-lg font-semibold">Informasi Dasar</h3>
                                                <p className="text-sm text-muted-foreground">Informasi utama tentang bahan</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="nama">Nama Bahan *</Label>
                                                    <Input
                                                        id="nama"
                                                        type="text"
                                                        value={data.nama}
                                                        onChange={(e) => handleNamaChange(e.target.value)}
                                                        placeholder="Contoh: Sodium Chloride"
                                                        required
                                                    />
                                                    <InputError message={errors.nama} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="jenis_bahan">Jenis Bahan *</Label>
                                                    <Input
                                                        id="jenis_bahan"
                                                        type="text"
                                                        value={data.jenis_bahan}
                                                        onChange={(e) => setData('jenis_bahan', e.target.value)}
                                                        placeholder="Contoh: Kimia, Organik, dll"
                                                        required
                                                    />
                                                    <InputError message={errors.jenis_bahan} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="lokasi_id">Lokasi *</Label>
                                                    <LokasiCombobox
                                                        value={data.lokasi_id}
                                                        onValueChange={(value) => setData('lokasi_id', value)}
                                                        placeholder="Cari dan pilih lokasi..."
                                                        lokasiOptions={lokasiList}
                                                        onAddNew={() => setIsLokasiDialogOpen(true)}
                                                        disabled={processing}
                                                    />
                                                    <InputError message={errors.lokasi_id} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="stok">Jumlah Stok *</Label>
                                                    <Input
                                                        id="stok"
                                                        type="number"
                                                        min="0"
                                                        value={data.stok}
                                                        onChange={(e) => setData('stok', parseInt(e.target.value) || 0)}
                                                        required
                                                    />
                                                    <InputError message={errors.stok} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detail Bahan */}
                                        <div className="space-y-4">
                                            <div className="border-b pb-4">
                                                <h3 className="text-lg font-semibold">Detail Bahan</h3>
                                                <p className="text-sm text-muted-foreground">Informasi detail dan keterangan bahan</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="catatan">Catatan</Label>
                                                <Textarea
                                                    id="catatan"
                                                    value={data.catatan}
                                                    onChange={(e) => setData('catatan', e.target.value)}
                                                    placeholder="Masukkan catatan tambahan tentang bahan ini (kandungan, sifat, kegunaan, dll)..."
                                                    rows={4}
                                                />
                                                <InputError message={errors.catatan} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: image upload + actions */}
                                    <div className="space-y-6">
                                        <div className="border-b pb-4">
                                            <h3 className="text-lg font-semibold">Foto Bahan</h3>
                                            <p className="text-sm text-muted-foreground">Upload foto bahan untuk dokumentasi</p>
                                        </div>

                                        <div className="space-y-4">
                                            <DragDropImageUpload
                                                value={data.gambar}
                                                onValueChange={handleImageChange}
                                                preview={imagePreview}
                                                onPreviewChange={handlePreviewChange}
                                                maxSize={2}
                                                disabled={processing}
                                            />
                                            <InputError message={errors.gambar} />
                                        </div>

                                        <div className="border-t pt-6">
                                            <div className="space-y-3">
                                                    <Button type="submit" disabled={processing} className="w-full">
                                                        {processing ? 'Menyimpan...' : 'Simpan Bahan'}
                                                    </Button>
                                                    <Button variant="outline" className="w-full" asChild>
                                                        <Link href="/aset-aslab">Batal</Link>
                                                    </Button>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
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
                            <InputError message={lokasiErrors.nama_lokasi} />
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

