import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Package, CheckCircle, AlertTriangle, XCircle, Trash2, Eye, Edit, ArrowUpDown } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ColumnDef } from "@tanstack/react-table";

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
}

interface Stats {
    total_aset: number;
    aset_baik: number;
    aset_kurang_baik: number;
    aset_tidak_baik: number;
}

interface Props {
    asetAslabs: AsetAslab[];
    stats: Stats;
}

export default function AsetAslabIndex({ asetAslabs, stats }: Props) {
    const handleDelete = (id: number, namaAset: string) => {
        if (confirm(`Apakah Anda yakin ingin menghapus aset "${namaAset}"?`)) {
            router.delete(`/aset-aslab/${id}`, {
                onSuccess: () => {
                    // Success message akan ditangani oleh flash message
                },
            });
        }
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
                    <div className="font-medium">{row.getValue("nama_aset")}</div>
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
                            <Link href={`/aset-aslab/${row.original.id}`}>
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/aset-aslab/${row.original.id}/edit`}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(row.original.id, row.original.nama_aset)}
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
            <Head title="Data Aset Aslab" />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Aset Aslab</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">Kelola inventaris aset laboratorium</p>
                    </div>
                    <Button asChild>
                        <Link href="/aset-aslab/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Aset
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Aset</CardTitle>
                        <CardDescription>
                            Semua aset yang terdaftar dalam sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            columns={columns}
                            data={asetAslabs}
                            searchPlaceholder="Cari nama aset..."
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
