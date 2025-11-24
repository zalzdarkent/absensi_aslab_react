import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { JenisCombobox } from '@/components/ui/jenis-combobox';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';

interface JenisAset {
    id: number;
    nama_jenis_aset: string;
}

interface Aset {
    id: number;
    nama_aset: string;
    jenis_id: number;
    kode_aset: string;
    nomor_seri: string;
    stok: number;
    status: string;
    catatan: string;
    gambar: string;
    jenis_aset: {
        id: number;
        nama_jenis_aset: string;
    };
}

interface Props {
    aset: Aset;
    jenisAsets: JenisAset[];
}

export default function AsetAslabEdit({ aset, jenisAsets }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(
        aset.gambar ? `/storage/${aset.gambar}` : null
    );

    const { data, setData, processing, errors } = useForm({
        nama_aset: aset.nama_aset,
        jenis_id: aset.jenis_id.toString(),
        kode_aset: aset.kode_aset,
        nomor_seri: aset.nomor_seri || '',
        stok: aset.stok,
        status: aset.status,
        catatan: aset.catatan || '',
    });

    // Separate state untuk gambar agar tidak masuk ke form data utama
    const [newImage, setNewImage] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Jika ada gambar baru, gunakan FormData dengan method spoofing
        if (newImage) {
            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('nama_aset', data.nama_aset);
            formData.append('jenis_id', data.jenis_id);
            formData.append('kode_aset', data.kode_aset);
            formData.append('nomor_seri', data.nomor_seri);
            formData.append('stok', data.stok.toString());
            formData.append('status', data.status);
            formData.append('catatan', data.catatan);
            formData.append('gambar', newImage);

            router.post(`/aset-aslab/${aset.id}`, formData, {
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Aset berhasil diperbarui!');
                },
                onError: (errors: Record<string, string>) => {
                    console.error('Error updating asset:', errors);
                    toast.error('Gagal memperbarui aset!');
                }
            });
        } else {
            // Jika tidak ada gambar baru, gunakan PUT biasa
            router.put(`/aset-aslab/${aset.id}`, data, {
                onSuccess: () => {
                    toast.success('Aset berhasil diperbarui!');
                },
                onError: (errors: Record<string, string>) => {
                    console.error('Error updating asset:', errors);
                    toast.error('Gagal memperbarui aset!');
                }
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setNewImage(null);
        setImagePreview(null);
    };

    return (
        <AppLayout>
            <Head title={`Edit Aset - ${aset.nama_aset}`} />

            <div className="space-y-6 py-4">
                {/* Header */}
                <div className="space-y-4">
                    <Button variant="outline" size="sm" asChild className="w-fit">
                        <Link href="/aset-aslab">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Aset</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Perbarui informasi aset {aset.nama_aset}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Form Fields */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Informasi Dasar */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Informasi Dasar</CardTitle>
                                        <CardDescription>
                                            Informasi utama tentang aset
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="nama_aset">Nama Aset *</Label>
                                                <Input
                                                    id="nama_aset"
                                                    type="text"
                                                    value={data.nama_aset}
                                                    onChange={(e) => setData('nama_aset', e.target.value)}
                                                    placeholder="Contoh: Mikroskop Digital"
                                                    className="focus:ring-blue-500"
                                                />
                                                <InputError message={errors.nama_aset} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="jenis_id">Jenis Aset *</Label>
                                                <JenisCombobox
                                                    value={data.jenis_id}
                                                    onValueChange={(value) => setData('jenis_id', value)}
                                                    placeholder="Cari dan pilih jenis aset..."
                                                    jenisOptions={jenisAsets}
                                                    disabled={processing}
                                                />
                                                <InputError message={errors.jenis_id} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="kode_aset">Kode Aset *</Label>
                                                <Input
                                                    id="kode_aset"
                                                    type="text"
                                                    value={data.kode_aset}
                                                    readOnly
                                                    placeholder="Contoh: AST-001"
                                                    className="font-mono bg-muted"
                                                />
                                                <InputError message={errors.kode_aset} />
                                                <p className="text-xs text-muted-foreground">(Kode aset tidak dapat diubah)</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="nomor_seri">Nomor Seri</Label>
                                                <Input
                                                    id="nomor_seri"
                                                    type="text"
                                                    value={data.nomor_seri}
                                                    onChange={(e) => setData('nomor_seri', e.target.value)}
                                                    placeholder="Contoh: SN123456789"
                                                    className="font-mono focus:ring-blue-500"
                                                />
                                                <InputError message={errors.nomor_seri} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Detail Aset */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Detail Aset</CardTitle>
                                        <CardDescription>
                                            Informasi detail kondisi dan stok aset
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="stok">Jumlah Stok *</Label>
                                                <Input
                                                    id="stok"
                                                    type="number"
                                                    min="0"
                                                    value={data.stok}
                                                    onChange={(e) => setData('stok', parseInt(e.target.value) || 0)}
                                                    className="focus:ring-blue-500"
                                                />
                                                <InputError message={errors.stok} />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="status">Status Kondisi *</Label>
                                                <Select
                                                    value={data.status}
                                                    onValueChange={(value) => setData('status', value)}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="baik">Baik</SelectItem>
                                                        <SelectItem value="kurang_baik">Kurang Baik</SelectItem>
                                                        <SelectItem value="tidak_baik">Tidak Baik</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError message={errors.status} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="catatan">Catatan</Label>
                                            <Textarea
                                                id="catatan"
                                                value={data.catatan}
                                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('catatan', e.target.value)}
                                                placeholder="Masukkan catatan tambahan tentang aset ini..."
                                                rows={4}
                                                className="focus:ring-blue-500"
                                            />
                                            <InputError message={errors.catatan} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Upload Gambar */}
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Foto Aset</CardTitle>
                                        <CardDescription>
                                            Upload foto aset untuk dokumentasi
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {!imagePreview ? (
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="mt-4">
                                                        <label htmlFor="gambar" className="cursor-pointer">
                                                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                                                Klik untuk upload gambar
                                                            </span>
                                                            <span className="mt-1 block text-xs text-gray-500">
                                                                PNG, JPG, GIF up to 2MB
                                                            </span>
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
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-48 object-cover rounded-lg"
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
                                                    <div className="absolute bottom-2 left-2">
                                                        <input
                                                            id="gambar-ganti"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => document.getElementById('gambar-ganti')?.click()}
                                                        >
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            Ganti Gambar
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                {processing ? 'Menyimpan...' : 'Perbarui Aset'}
                                            </Button>
                                            <Button variant="outline" className="w-full" asChild>
                                                <Link href="/aset-aslab">
                                                    Batal
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
        </AppLayout>
    );
}
