import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PeminjamanBarangCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nama_peminjam: '',
        nama_barang: '',
        jumlah: 1,
        tanggal_pinjam: '',
        tanggal_kembali: '',
        keterangan: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/peminjaman-barang');
    };

    return (
        <AppLayout>
            <Head title="Tambah Peminjaman Barang" />
            
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/peminjaman-barang">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Tambah Peminjaman Barang</h1>
                            <p className="text-gray-600 mt-2">Catat peminjaman barang baru</p>
                        </div>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Peminjaman</CardTitle>
                            <CardDescription>
                                Isi form di bawah untuk mencatat peminjaman barang
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nama_peminjam">Nama Peminjam *</Label>
                                        <Input
                                            id="nama_peminjam"
                                            type="text"
                                            value={data.nama_peminjam}
                                            onChange={(e) => setData('nama_peminjam', e.target.value)}
                                            placeholder="Masukkan nama peminjam"
                                        />
                                        {errors.nama_peminjam && (
                                            <p className="text-sm text-red-600">{errors.nama_peminjam}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nama_barang">Nama Barang *</Label>
                                        <Input
                                            id="nama_barang"
                                            type="text"
                                            value={data.nama_barang}
                                            onChange={(e) => setData('nama_barang', e.target.value)}
                                            placeholder="Masukkan nama barang"
                                        />
                                        {errors.nama_barang && (
                                            <p className="text-sm text-red-600">{errors.nama_barang}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="jumlah">Jumlah</Label>
                                        <Input
                                            id="jumlah"
                                            type="number"
                                            min="1"
                                            value={data.jumlah}
                                            onChange={(e) => setData('jumlah', parseInt(e.target.value) || 1)}
                                            placeholder="1"
                                        />
                                        {errors.jumlah && (
                                            <p className="text-sm text-red-600">{errors.jumlah}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal_pinjam">Tanggal Pinjam *</Label>
                                        <Input
                                            id="tanggal_pinjam"
                                            type="date"
                                            value={data.tanggal_pinjam}
                                            onChange={(e) => setData('tanggal_pinjam', e.target.value)}
                                        />
                                        {errors.tanggal_pinjam && (
                                            <p className="text-sm text-red-600">{errors.tanggal_pinjam}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal_kembali">Tanggal Kembali</Label>
                                        <Input
                                            id="tanggal_kembali"
                                            type="date"
                                            value={data.tanggal_kembali}
                                            onChange={(e) => setData('tanggal_kembali', e.target.value)}
                                        />
                                        {errors.tanggal_kembali && (
                                            <p className="text-sm text-red-600">{errors.tanggal_kembali}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="keterangan">Keterangan</Label>
                                    <textarea
                                        id="keterangan"
                                        value={data.keterangan}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('keterangan', e.target.value)}
                                        placeholder="Masukkan keterangan peminjaman (opsional)"
                                        rows={3}
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                    {errors.keterangan && (
                                        <p className="text-sm text-red-600">{errors.keterangan}</p>
                                    )}
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button variant="outline" asChild>
                                        <Link href="/peminjaman-barang">
                                            Batal
                                        </Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Menyimpan...' : 'Simpan Peminjaman'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}