import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ArrowLeft,
    Package,
    Hash,
    Calendar,
    FileText,
    Image as ImageIcon,
    Edit,
    Trash2
} from 'lucide-react';
import { Link, router } from '@inertiajs/react';

interface Bahan {
    id: number;
    nama: string;
    jenis_bahan: string;
    stok: number;
    catatan?: string;
    gambar?: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    bahan: Bahan;
}

export default function BahanShow({ bahan }: Props) {
    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus bahan "${bahan.nama}"?`)) {
            router.delete(`/bahan/${bahan.id}`, {
                onSuccess: () => {
                    // Success message akan ditangani oleh flash message
                },
            });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStokColor = (stok: number) => {
        if (stok === 0) return "text-red-700 bg-red-100 border-red-200";
        if (stok < 10) return "text-yellow-700 bg-yellow-100 border-yellow-200";
        return "text-green-700 bg-green-100 border-green-200";
    };

    return (
        <AppLayout>
            <Head title={`Detail Bahan - ${bahan.nama}`} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" asChild>
                            <Link href="/aset-aslab">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Package className="h-8 w-8 text-purple-600" />
                                Detail Bahan
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Informasi lengkap bahan laboratorium
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href={`/bahan/${bahan.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleDelete}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5 text-purple-600" />
                                    Informasi Bahan
                                </CardTitle>
                                <CardDescription>
                                    Detail informasi bahan laboratorium
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Nama Bahan
                                        </label>
                                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                                            {bahan.nama}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Jenis Bahan
                                        </label>
                                        <div className="mt-1">
                                            <Badge variant="secondary" className="text-sm">
                                                {bahan.jenis_bahan}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <Hash className="h-4 w-4" />
                                        Stok Tersedia
                                    </label>
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getStokColor(bahan.stok)}`}>
                                            {bahan.stok} unit
                                            {bahan.stok === 0 && " (Habis)"}
                                            {bahan.stok > 0 && bahan.stok < 10 && " (Stok Menipis)"}
                                        </span>
                                    </div>
                                </div>

                                {bahan.catatan && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            Catatan
                                        </label>
                                        <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                {bahan.catatan}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Timestamp Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                    Informasi Waktu
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Dibuat pada
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                                        {formatDate(bahan.created_at)}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Terakhir diperbarui
                                    </label>
                                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                                        {formatDate(bahan.updated_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Image Section */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ImageIcon className="h-5 w-5 text-green-600" />
                                    Foto Bahan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bahan.gambar ? (
                                    <div className="aspect-square relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                                        <img
                                            src={`/storage/${bahan.gambar}`}
                                            alt={bahan.nama}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                ) : (
                                    <div className="aspect-square flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                        <div className="text-center text-gray-500 dark:text-gray-400">
                                            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Tidak ada foto</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Status Bahan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Status Stok</span>
                                        <Badge
                                            className={
                                                bahan.stok === 0
                                                    ? "bg-red-100 text-red-800 hover:bg-red-100"
                                                    : bahan.stok < 10
                                                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                                        : "bg-green-100 text-green-800 hover:bg-green-100"
                                            }
                                        >
                                            {bahan.stok === 0 ? "Habis" : bahan.stok < 10 ? "Menipis" : "Tersedia"}
                                        </Badge>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">ID Bahan</span>
                                        <span className="text-sm font-mono font-medium">#{bahan.id}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
