import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { PeminjamanDetailModal } from '@/components/ui/peminjaman-detail-modal';
import { Plus, ShoppingCart, Clock, CheckCircle, AlertTriangle, X, FileCheck, FileClock } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ColumnDef } from "@tanstack/react-table";
import { toast } from 'sonner';

interface PinjamBarang {
    id: number;
    nama_peminjam: string;
    nama_aset: string;
    nama_barang?: string; // untuk bahan
    jumlah: number;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    status: string;
    keterangan?: string;
    approved_by?: string;
    approved_at?: string;
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
    const [selectedPeminjaman, setSelectedPeminjaman] = useState<PinjamBarang | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleViewDetail = (peminjaman: PinjamBarang) => {
        setSelectedPeminjaman(peminjaman);
        setIsDetailModalOpen(true);
    };

    const handleReturn = (peminjamanId: number) => {
        // Here you would typically make an API call to mark as returned
        // For now, let's show a toast notification
        toast.success('Barang berhasil ditandai sebagai dikembalikan', {
            description: 'Status peminjaman telah diupdate'
        });

        // Optionally refresh the page or update the data
        // router.reload();
    };
    const getStatusBadge = (status: string) => {
        let variant = "";
        let icon = null;

        switch (status?.toLowerCase()) {
            case "menunggu persetujuan":
                variant = "text-orange-600 bg-orange-100";
                icon = <FileClock className="h-3 w-3 mr-1" />;
                break;
            case "disetujui":
                variant = "text-blue-600 bg-blue-100";
                icon = <FileCheck className="h-3 w-3 mr-1" />;
                break;
            case "ditolak":
                variant = "text-red-600 bg-red-100";
                icon = <X className="h-3 w-3 mr-1" />;
                break;
            case "sedang dipinjam":
                variant = "text-yellow-600 bg-yellow-100";
                icon = <Clock className="h-3 w-3 mr-1" />;
                break;
            case "dikembalikan":
                variant = "text-green-600 bg-green-100";
                icon = <CheckCircle className="h-3 w-3 mr-1" />;
                break;
            case "terlambat":
                variant = "text-red-600 bg-red-100";
                icon = <AlertTriangle className="h-3 w-3 mr-1" />;
                break;
            default:
                variant = "text-gray-600 bg-gray-100";
        }

        return (
            <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${variant}`}>
                {icon}
                {status}
            </span>
        );
    };

    const columns: ColumnDef<PinjamBarang>[] = [
        {
            accessorKey: "nama_peminjam",
            header: "Nama Peminjam",
        },
        {
            accessorKey: "nama_aset",
            header: "Nama Barang",
            cell: ({ row }) => {
                const namaAset = row.getValue("nama_aset") as string;
                const namaBarang = row.original.nama_barang;

                // Prioritaskan nama_aset, jika N/A atau kosong, gunakan nama_barang (untuk bahan)
                if (namaAset && namaAset !== 'N/A') {
                    return namaAset;
                } else if (namaBarang && namaBarang !== 'N/A') {
                    return namaBarang;
                } else {
                    return '-';
                }
            },
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
                return getStatusBadge(status);
            },
        },
        {
            id: "approved_info",
            header: "Persetujuan",
            cell: ({ row }) => {
                const approvedBy = row.original.approved_by;
                const approvedAt = row.original.approved_at;
                const status = row.getValue("status") as string;

                if (status?.toLowerCase() === 'menunggu persetujuan') {
                    return <span className="text-gray-400 text-xs">Belum diproses</span>;
                }

                if (approvedBy && approvedAt) {
                    return (
                        <div className="text-xs">
                            <div className="font-medium">{approvedBy}</div>
                            <div className="text-gray-500">{new Date(approvedAt).toLocaleDateString('id-ID')}</div>
                        </div>
                    );
                }

                return '-';
            },
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(row.original)}
                        >
                            Detail
                        </Button>
                        {status?.toLowerCase() === 'sedang dipinjam' && (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/peminjaman-barang/${row.original.id}/return`}>
                                    Kembalikan
                                </Link>
                            </Button>
                        )}
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Peminjaman Barang</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Kelola peminjaman barang laboratorium assistant</p>
                    </div>
                    <Button asChild>
                        <Link href="/peminjaman-barang/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Ajukan Peminjaman
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
                            Riwayat dan status peminjaman barang dalam sistem
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

            {/* Peminjaman Detail Modal */}
            <PeminjamanDetailModal
                peminjaman={selectedPeminjaman}
                isOpen={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                onReturn={handleReturn}
            />
        </AppLayout>
    );
}
