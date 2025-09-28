import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { ArrowLeft, Edit, Trash2, Package, Calendar, Hash, Barcode, CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ColumnDef } from "@tanstack/react-table";

interface Peminjaman {
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
    created_at: string;
    updated_at: string;
    jenis_aset: {
        id: number;
        nama_jenis_aset: string;
    };
    peminjaman_asets: Peminjaman[];
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

    // Define columns for peminjaman DataTable
    const peminjamanColumns: ColumnDef<Peminjaman>[] = [
        {
            accessorKey: "user.name",
            header: "Peminjam",
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.user.name}</div>
                    <div className="text-sm text-gray-500">{row.original.user.email}</div>
                </div>
            ),
        },
        {
            accessorKey: "stok",
            header: "Jumlah",
            cell: ({ row }) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {row.getValue("stok")} unit
                </span>
            ),
        },
        {
            accessorKey: "tanggal_pinjam",
            header: "Tanggal Pinjam",
            cell: ({ row }) => {
                const tanggal = row.getValue("tanggal_pinjam") as string;
                return new Date(tanggal).toLocaleDateString('id-ID');
            },
        },
        {
            accessorKey: "tanggal_kembali",
            header: "Tanggal Kembali",
            cell: ({ row }) => {
                const tanggal = row.getValue("tanggal_kembali") as string;
                return tanggal ? new Date(tanggal).toLocaleDateString('id-ID') : '-';
            },
        },
        {
            accessorKey: "persetujuan",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("persetujuan") as string;
                let variant = "";
                let icon = null;
                let statusText = "";

                switch (status?.toLowerCase()) {
                    case "disetujui":
                        variant = "text-green-700 bg-green-100 border-green-200";
                        icon = <CheckCircle className="h-3 w-3" />;
                        statusText = "Disetujui";
                        break;
                    case "menunggu":
                    case "menunggu persetujuan":
                        variant = "text-yellow-700 bg-yellow-100 border-yellow-200";
                        icon = <Clock className="h-3 w-3" />;
                        statusText = "Menunggu Persetujuan";
                        break;
                    case "ditolak":
                        variant = "text-red-700 bg-red-100 border-red-200";
                        icon = <XCircle className="h-3 w-3" />;
                        statusText = "Ditolak";
                        break;
                    default:
                        variant = "text-gray-600 bg-gray-100 border-gray-200";
                        statusText = status?.replace(/_/g, ' ') || 'Tidak Diketahui';
                }

                return (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${variant}`}>
                        {icon}
                        {statusText}
                    </span>
                );
            },
        },
    ];

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case "baik":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "kurang_baik":
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            case "tidak_baik":
                return <XCircle className="h-4 w-4 text-red-600" />;
            case "tersedia":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "habis":
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "baik":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Baik</Badge>;
            case "kurang_baik":
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Kurang Baik</Badge>;
            case "tidak_baik":
                return <Badge className="bg-red-100 text-red-800 border-red-200">Tidak Baik</Badge>;
            case "tersedia":
                return <Badge className="bg-green-100 text-green-800 border-green-200">Tersedia</Badge>;
            case "habis":
                return <Badge className="bg-red-100 text-red-800 border-red-200">Habis</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status || 'Tidak Diketahui'}</Badge>;
        }
    };

    const getStatusText = (status: string) => {
        switch (status?.toLowerCase()) {
            case "baik":
                return "Baik";
            case "kurang_baik":
                return "Kurang Baik";
            case "tidak_baik":
                return "Tidak Baik";
            case "tersedia":
                return "Tersedia";
            case "habis":
                return "Habis";
            default:
                return status?.replace(/_/g, ' ') || 'Tidak Diketahui';
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail Aset - ${aset.nama_aset}`} />

            <div className="space-y-6 pt-4">
                {/* Header */}
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="w-fit">
                        <Link href="/aset-aslab">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{aset.nama_aset}</h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                {aset.jenis_aset.nama_jenis_aset} • {aset.kode_aset}
                            </p>
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
                                                    <p className="text-sm text-gray-500">Status Kondisi</p>
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
                                        <DataTable
                                            columns={peminjamanColumns}
                                            data={aset.peminjaman_asets}
                                            searchPlaceholder="Cari nama peminjam..."
                                        />
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
                                        <span className="font-medium">{getStatusText(aset.status)}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
        </AppLayout>
    );
}
