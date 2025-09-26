import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Package, Calendar, Hash, Barcode, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Link } from '@inertiajs/react';

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
    created_at: string;
    updated_at: string;
    jenis_aset: {
        id: number;
        nama_jenis_aset: string;
    };
    peminjaman_asets: Array<{
        id: number;
        tanggal_pinjam: string;
        tanggal_kembali: string;
        stok: number;
        persetujuan: string;
        user: {
            id: number;
            name: string;
            email: string;
        };
    }>;
}

interface Props {
    aset: Aset;
}

export default function AsetAslabShow({ aset }: Props) {
    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus aset "${aset.nama_aset}"?`)) {
            router.delete(`/aset-aslab/${aset.id}`, {
                onSuccess: () => {
                    router.visit('/aset-aslab');
                },
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case "baik":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "kurang_baik":
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case "tidak_baik":
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return null;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "baik":
                return <Badge className="bg-green-100 text-green-800">Baik</Badge>;
            case "kurang_baik":
                return <Badge className="bg-yellow-100 text-yellow-800">Kurang Baik</Badge>;
            case "tidak_baik":
                return <Badge className="bg-red-100 text-red-800">Tidak Baik</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail Aset - ${aset.nama_aset}`} />

            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/aset-aslab">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{aset.nama_aset}</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    {aset.jenis_aset.nama_jenis_aset} • {aset.kode_aset}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline" asChild>
                                <Link href={`/aset-aslab/${aset.id}/edit`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Link>
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Hapus
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Detail Aset */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Informasi Aset
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <Hash className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Kode Aset</p>
                                                    <p className="font-mono font-medium">{aset.kode_aset}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Barcode className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Nomor Seri</p>
                                                    <p className="font-mono font-medium">{aset.nomor_seri || '-'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Package className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Jenis Aset</p>
                                                    <p className="font-medium">{aset.jenis_aset.nama_jenis_aset}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(aset.status)}
                                                <div>
                                                    <p className="text-sm text-gray-500">Status</p>
                                                    {getStatusBadge(aset.status)}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="h-4 w-4 bg-blue-500 rounded text-white flex items-center justify-center text-xs font-bold">
                                                    {aset.stok}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Stok Tersedia</p>
                                                    <p className="font-medium">{aset.stok} Unit</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Ditambahkan</p>
                                                    <p className="font-medium">
                                                        {new Date(aset.created_at).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {aset.catatan && (
                                        <div className="mt-6 pt-6 border-t">
                                            <p className="text-sm text-gray-500 mb-2">Catatan</p>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {aset.catatan}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Riwayat Peminjaman */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Riwayat Peminjaman</CardTitle>
                                    <CardDescription>
                                        Daftar peminjaman aset ini
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {aset.peminjaman_asets && aset.peminjaman_asets.length > 0 ? (
                                        <div className="space-y-4">
                                            {aset.peminjaman_asets.map((peminjaman) => (
                                                <div key={peminjaman.id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">{peminjaman.user.name}</p>
                                                            <p className="text-sm text-gray-500">{peminjaman.user.email}</p>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Jumlah: {peminjaman.stok} unit
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant="outline">
                                                                {peminjaman.persetujuan}
                                                            </Badge>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(peminjaman.tanggal_pinjam).toLocaleDateString('id-ID')}
                                                                {peminjaman.tanggal_kembali &&
                                                                    ` - ${new Date(peminjaman.tanggal_kembali).toLocaleDateString('id-ID')}`
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                                            <p className="text-gray-500 mt-4">Belum ada riwayat peminjaman</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Foto Aset */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Foto Aset</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {aset.gambar && aset.gambar !== 'default-aset.png' ? (
                                        <img
                                            src={`/storage/${aset.gambar}`}
                                            alt={aset.nama_aset}
                                            className="w-full h-48 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                            <Package className="h-16 w-16 text-gray-400" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Quick Stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Statistik</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Total Peminjaman</span>
                                        <span className="font-medium">
                                            {aset.peminjaman_asets?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Stok Tersedia</span>
                                        <span className="font-medium">{aset.stok}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">Status</span>
                                        <span className="font-medium">{aset.status.replace('_', ' ')}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
