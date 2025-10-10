import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, User, Calendar, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, FileText } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PageTransition } from '@/components/ui/loading-animations';

interface Peminjaman {
    id: number;
    userName: string;
    userRole: string;
    itemName: string;
    itemCode: string;
    requestDate: string;
    quantity: number;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    approvedBy?: string;
    approvedAt?: string;
}

interface Props {
    peminjaman: Peminjaman;
}

export default function ShowPeminjamanAset({ peminjaman }: Props) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Menunggu Persetujuan
                    </Badge>
                );
            case 'approved':
                return (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Disetujui
                    </Badge>
                );
            case 'rejected':
                return (
                    <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">
                        <XCircle className="w-3 h-3 mr-1" />
                        Ditolak
                    </Badge>
                );
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'border-l-yellow-500 bg-yellow-50';
            case 'approved': return 'border-l-green-500 bg-green-50';
            case 'rejected': return 'border-l-red-500 bg-red-50';
            default: return 'border-l-gray-500 bg-gray-50';
        }
    };

    return (
        <AppLayout>
            <Head title={`Detail Peminjaman #${peminjaman.id}`} />

            <PageTransition>
                <div className="p-6 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Button variant="outline" size="sm" asChild className="hover-scale">
                                <Link href="/peminjaman-aset">
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Kembali
                                </Link>
                            </Button>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Detail Peminjaman #{peminjaman.id}
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Informasi lengkap tentang peminjaman aset
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Status Card */}
                            <Card className={`hover-lift shadow-elegant border-l-4 ${getStatusColor(peminjaman.status)}`}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            <Package className="h-5 w-5" />
                                            Status Peminjaman
                                        </CardTitle>
                                        {getStatusBadge(peminjaman.status)}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Tanggal Pengajuan</p>
                                                <p className="flex items-center gap-2 mt-1">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {peminjaman.requestDate}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Jumlah</p>
                                                <p className="font-semibold text-lg">{peminjaman.quantity} unit</p>
                                            </div>
                                        </div>

                                        {peminjaman.approvedBy && (
                                            <div className="pt-4 border-t">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Diproses Oleh</p>
                                                        <p className="font-medium">{peminjaman.approvedBy}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Tanggal Diproses</p>
                                                        <p className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            {peminjaman.approvedAt}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Item Details */}
                            <Card className="hover-lift shadow-elegant">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        Detail Aset
                                    </CardTitle>
                                    <CardDescription>
                                        Informasi aset yang dipinjam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Nama Aset</p>
                                            <p className="text-xl font-semibold">{peminjaman.itemName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Kode Aset</p>
                                            <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded inline-block">
                                                {peminjaman.itemCode}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {peminjaman.notes && (
                                <Card className="hover-lift shadow-elegant">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Catatan Peminjaman
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground leading-relaxed">
                                            {peminjaman.notes}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* User Info */}
                            <Card className="hover-lift">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <User className="h-5 w-5" />
                                        Peminjam
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Nama</p>
                                        <p className="font-medium">{peminjaman.userName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                                        <Badge variant="outline" className="font-medium">
                                            {peminjaman.userRole}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Quick Actions */}
                            <Card className="hover-lift">
                                <CardHeader>
                                    <CardTitle className="text-lg">Tindakan</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button asChild className="w-full gradient-primary hover-lift">
                                        <Link href="/peminjaman-aset">
                                            Lihat Semua Peminjaman
                                        </Link>
                                    </Button>

                                    {peminjaman.status === 'pending' && (
                                        <>
                                            <Button className="w-full bg-green-500 hover:bg-green-600 hover-lift">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Setujui Peminjaman
                                            </Button>
                                            <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover-lift">
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Tolak Peminjaman
                                            </Button>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Status Info */}
                            <Card className="hover-lift">
                                <CardHeader>
                                    <CardTitle className="text-lg">Informasi Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    {peminjaman.status === 'pending' && (
                                        <>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0 pulse-soft" />
                                                <p>Menunggu persetujuan dari admin/aslab</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                                <p>Notifikasi akan dikirim saat ada update</p>
                                            </div>
                                        </>
                                    )}

                                    {peminjaman.status === 'approved' && (
                                        <>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                                <p>Peminjaman telah disetujui</p>
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                                <p>Aset dapat diambil di laboratorium</p>
                                            </div>
                                        </>
                                    )}

                                    {peminjaman.status === 'rejected' && (
                                        <div className="flex items-start gap-2">
                                            <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                            <p>Peminjaman ditolak oleh admin/aslab</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </PageTransition>
        </AppLayout>
    );
}
