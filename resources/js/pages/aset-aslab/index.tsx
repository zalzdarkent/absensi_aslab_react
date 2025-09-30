import React, { useEffect, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Package, CheckCircle, AlertTriangle, XCircle, Trash2, Eye, Edit, ArrowUpDown } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ColumnDef } from "@tanstack/react-table";
import { toast } from 'sonner';

interface AsetAslab {
    id: number;
    nama_aset: string;
    kode_aset: string;
    jenis_aset: string;
    nomor_seri: string;
    stok: number;
    status: string;
    gambar: string;
    created_at: string;
    type: 'aset' | 'bahan'; // Add type field
}

interface Stats {
    total_aset: number;
    aset_baik: number;
    aset_kurang_baik: number;
    aset_tidak_baik: number;
    total_bahan: number;
    bahan_tersedia: number;
    bahan_habis: number;
}

interface Props {
    asetAslabs: AsetAslab[];
    stats: Stats;
    success?: string;
}

export default function AsetAslabIndex({ asetAslabs, stats, success }: Props) {
    const [selectedItem, setSelectedItem] = useState<{ id: number; nama: string; type: 'aset' | 'bahan' } | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Show success toast for flash messages
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
    }, [success]);

    const handleDeleteAction = (id: number, namaAset: string, type: 'aset' | 'bahan') => {
        setSelectedItem({ id, nama: namaAset, type });
        setIsDeleteModalOpen(true);
    };

    const submitDelete = () => {
        if (!selectedItem) return;

        const route = selectedItem.type === 'aset' ? `/aset-aslab/${selectedItem.id}` : `/bahan/${selectedItem.id}`;
        setProcessing(true);

        router.delete(route, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                toast.success(`${selectedItem.type === 'aset' ? 'Aset' : 'Bahan'} berhasil dihapus!`);
            },
            onError: (errors) => {
                console.error('Delete error:', errors);
                toast.error('Terjadi kesalahan saat menghapus data');
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    const columns: ColumnDef<AsetAslab>[] = [
        {
            accessorKey: "kode_aset",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2"
                    >
                        Kode Aset
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <span className="font-mono text-sm">{row.getValue("kode_aset")}</span>
            ),
        },
        {
            accessorKey: "nama_aset",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2"
                    >
                        Nama Aset
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">
                        {row.getValue("nama_aset")}
                        {/* Add type badge */}
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                            row.original.type === 'aset'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                        }`}>
                            {row.original.type === 'aset' ? 'ASET' : 'BAHAN'}
                        </span>
                    </div>
                    <div className="text-sm text-gray-500">{row.original.jenis_aset}</div>
                </div>
            ),
        },
        {
            accessorKey: "nomor_seri",
            header: "No. Seri",
            cell: ({ row }) => (
                <span className="font-mono text-xs">{row.getValue("nomor_seri") || '-'}</span>
            ),
        },
        {
            accessorKey: "stok",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2"
                    >
                        Stok
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {row.getValue("stok")}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="h-8 px-2"
                    >
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                let variant = "";
                let icon = null;

                switch (status?.toLowerCase()) {
                    case "baik":
                        variant = "text-green-700 bg-green-100";
                        icon = <CheckCircle className="h-3 w-3" />;
                        break;
                    case "kurang_baik":
                        variant = "text-yellow-700 bg-yellow-100";
                        icon = <AlertTriangle className="h-3 w-3" />;
                        break;
                    case "tidak_baik":
                        variant = "text-red-700 bg-red-100";
                        icon = <XCircle className="h-3 w-3" />;
                        break;
                    default:
                        variant = "text-gray-600 bg-gray-100";
                }

                return (
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${variant}`}>
                        {icon}
                        {status.replace('_', ' ')}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                return (
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/${row.original.type === 'aset' ? 'aset-aslab' : 'bahan'}/${row.original.id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/${row.original.type === 'aset' ? 'aset-aslab' : 'bahan'}/${row.original.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteAction(row.original.id, row.original.nama_aset, row.original.type)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <AppLayout>
            <Head title="Data Aset & Bahan" />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Aset & Bahan</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Kelola inventaris aset dan bahan laboratorium</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" asChild>
                            <Link href="/test-bahan">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Bahan
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/aset-aslab/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Aset
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Total Aset
                            </CardTitle>
                            <Package className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_aset}</div>
                            <p className="text-xs opacity-90">
                                Seluruh aset aslab
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Kondisi Baik
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.aset_baik}</div>
                            <p className="text-xs opacity-90">
                                Siap digunakan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Kurang Baik
                            </CardTitle>
                            <AlertTriangle className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.aset_kurang_baik}</div>
                            <p className="text-xs opacity-90">
                                Perlu perhatian
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Tidak Baik
                            </CardTitle>
                            <XCircle className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.aset_tidak_baik}</div>
                            <p className="text-xs opacity-90">
                                Perlu perbaikan
                            </p>
                        </CardContent>
                    </Card>

                    {/* Bahan Stats */}
                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Total Bahan
                            </CardTitle>
                            <Package className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_bahan}</div>
                            <p className="text-xs opacity-90">
                                Seluruh bahan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Bahan Tersedia
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.bahan_tersedia}</div>
                            <p className="text-xs opacity-90">
                                Siap digunakan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium opacity-90">
                                Bahan Habis
                            </CardTitle>
                            <XCircle className="h-4 w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.bahan_habis}</div>
                            <p className="text-xs opacity-90">
                                Perlu restok
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Aset & Bahan</CardTitle>
                        <CardDescription>
                            Semua aset dan bahan yang terdaftar dalam sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={asetAslabs}
                            searchPlaceholder="Cari nama aset atau bahan..."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-lg bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-foreground">
                                Hapus {selectedItem?.type === 'aset' ? 'Aset' : 'Bahan'}
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Apakah Anda yakin ingin menghapus {selectedItem?.type === 'aset' ? 'aset' : 'bahan'} ini?
                            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedItem && (
                        <div className="space-y-4">
                            {/* Detail Card */}
                            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-semibold text-red-800 dark:text-red-200">
                                        Data yang akan dihapus
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-foreground">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tipe:</span>
                                        <span className="font-medium capitalize">
                                            {selectedItem.type === 'aset' ? 'Aset' : 'Bahan'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Nama:</span>
                                        <span className="font-medium">{selectedItem.nama}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">ID:</span>
                                        <span className="font-medium font-mono">#{selectedItem.id}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                        <p className="font-medium mb-1">Peringatan:</p>
                                        <p>Data yang dihapus tidak dapat dipulihkan. Pastikan Anda yakin dengan tindakan ini.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3 pt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={processing}
                            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={submitDelete}
                            disabled={processing}
                            className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:ring-red-500 text-white shadow-sm"
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Menghapus...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Trash2 className="h-4 w-4" />
                                    Hapus {selectedItem?.type === 'aset' ? 'Aset' : 'Bahan'}
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
