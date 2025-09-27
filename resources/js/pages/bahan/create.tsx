import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';

interface Props {
    success?: string;
}

export default function BahanCreate({ success }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        jenis_bahan: '',
        stok: 1,
        catatan: '',
        gambar: null as File | null,
    });

    // Show success toast
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
    }, [success]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nama', data.nama);
        formData.append('jenis_bahan', data.jenis_bahan);
        formData.append('stok', data.stok.toString());
        formData.append('catatan', data.catatan);
        if (data.gambar) {
            formData.append('gambar', data.gambar);
        }

        post('/bahan', {
            forceFormData: true,
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('gambar', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNamaChange = (value: string) => {
        setData('nama', value);
    };

    const removeImage = () => {
        setData('gambar', null);
        setImagePreview(null);
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
                                            {!imagePreview ? (
                                                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-accent transition-colors">
                                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                                    <div className="mt-4">
                                                        <label htmlFor="gambar" className="cursor-pointer">
                                                            <span className="mt-2 block text-sm font-medium text-muted-foreground">Klik untuk upload gambar</span>
                                                            <span className="mt-1 block text-xs text-muted-foreground">PNG, JPG, GIF up to 2MB</span>
                                                        </label>
                                                        <input
                                                            id="gambar"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
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
        </AppLayout>
    );
}
