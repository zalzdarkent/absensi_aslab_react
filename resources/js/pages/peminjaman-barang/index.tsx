import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Plus, ShoppingCart, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ColumnDef } from "@tanstack/react-table";

interface PinjamBarang {
    id: number;
    nama_peminjam: string;
    nama_barang: string;
    jumlah: number;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    status: string;
    keterangan?: string;
}

interface Stats {
    total_peminjaman: number;
    sedang_dipinjam: number;
    sudah_kembali: number;
    terlambat_kembali: number;
}

interface Props {
    pinjamBarangs: PinjamBarang[];
    stats: Stats;
}

export default function PeminjamanBarangIndex({ pinjamBarangs, stats }: Props) {
    const columns: ColumnDef<PinjamBarang>[] = [
        {
            accessorKey: "nama_peminjam",
            header: "Nama Peminjam",
        },
        {
            accessorKey: "nama_barang",
            header: "Nama Barang",
        },
        {
            accessorKey: "jumlah",
            header: "Jumlah",
        },
        {
            accessorKey: "tanggal_pinjam",
            header: "Tanggal Pinjam",
            cell: ({ row }) => {
                const tanggal = row.getValue("tanggal_pinjam") as string;
                return tanggal ? new Date(tanggal).toLocaleDateString('id-ID') : '-';
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
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                let variant = "";
                switch (status?.toLowerCase()) {
                    case "dipinjam":
                        variant = "text-yellow-600 bg-yellow-100";
                        break;
                    case "dikembalikan":
                        variant = "text-green-600 bg-green-100";
                        break;
                    case "terlambat":
                        variant = "text-red-600 bg-red-100";
                        break;
                    default:
                        variant = "text-gray-600 bg-gray-100";
                }
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variant}`}>
                        {status}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/peminjaman-barang/${row.original.id}`}>
                                Detail
                            </Link>
                        </Button>
                        {status?.toLowerCase() === 'dipinjam' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/peminjaman-barang/${row.original.id}/return`}>
                                    Kembalikan
                                </Link>
                            </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/peminjaman-barang/${row.original.id}/edit`}>
                                Edit
                            </Link>
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout>
            <Head title="Peminjaman Barang" />
            
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Peminjaman Barang</h1>
                        <p className="text-gray-600 mt-2">Kelola peminjaman barang laboratorium assistant</p>
                    </div>
                    <Button asChild>
                        <Link href="/peminjaman-barang/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Peminjaman
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Total Peminjaman
                            </CardTitle>
                            <ShoppingCart className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_peminjaman}</div>
                            <p className="text-xs opacity-90">
                                Seluruh transaksi
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Sedang Dipinjam
                            </CardTitle>
                            <Clock className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.sedang_dipinjam}</div>
                            <p className="text-xs opacity-90">
                                Belum dikembalikan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Sudah Kembali
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.sudah_kembali}</div>
                            <p className="text-xs opacity-90">
                                Selesai dipinjam
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Terlambat
                            </CardTitle>
                            <AlertTriangle className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.terlambat_kembali}</div>
                            <p className="text-xs opacity-90">
                                Melewati batas waktu
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Peminjaman</CardTitle>
                        <CardDescription>
                            Semua transaksi peminjaman yang terdaftar dalam sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={pinjamBarangs}
                            searchPlaceholder="Cari nama peminjam..."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}