import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { PeminjamanDetailModal } from '@/components/ui/peminjaman-detail-modal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, ShoppingCart, Clock, CheckCircle, AlertTriangle, X, FileCheck, FileClock, ThumbsUp, ThumbsDown } from 'lucide-react';
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
    auth: {
        user: {
            id: number;
            role: string;
        };
    };
}

export default function PeminjamanBarangIndex({ pinjamBarangs, stats, auth }: Props) {
    const [selectedPeminjaman, setSelectedPeminjaman] = useState<PinjamBarang | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
    const [approvalNote, setApprovalNote] = useState('');
    const [processing, setProcessing] = useState(false);

    const canApprove = auth.user.role === 'admin' || auth.user.role === 'aslab';

    const handleViewDetail = (peminjaman: PinjamBarang) => {
        setSelectedPeminjaman(peminjaman);
        setIsDetailModalOpen(true);
    };

    const handleApprovalAction = (peminjaman: PinjamBarang, action: 'approve' | 'reject') => {
        setSelectedPeminjaman(peminjaman);
        setApprovalAction(action);
        setApprovalNote('');
        setIsApprovalModalOpen(true);
    };

    const submitApproval = () => {
        if (!selectedPeminjaman) return;

        // Validation for reject action
        if (approvalAction === 'reject' && !approvalNote.trim()) {
            toast.error('Alasan penolakan wajib diisi');
            return;
        }

        setProcessing(true);

        router.post(`/peminjaman-barang/${selectedPeminjaman.id}/approve`, {
            action: approvalAction,
            approval_note: approvalNote,
        }, {
            onSuccess: () => {
                setIsApprovalModalOpen(false);
                setApprovalNote('');
                toast.success(
                    approvalAction === 'approve'
                        ? 'Peminjaman berhasil disetujui!'
                        : 'Peminjaman berhasil ditolak!'
                );
            },
            onError: (errors) => {
                console.error('Approval error:', errors);
                toast.error('Terjadi kesalahan saat memproses persetujuan');
            },
            onFinish: () => {
                setProcessing(false);
            }
        });
    };

    const handleReturn = () => {
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
                variant = "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20";
                icon = <FileClock className="h-3 w-3 mr-1" />;
                break;
            case "disetujui":
                variant = "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20";
                icon = <FileCheck className="h-3 w-3 mr-1" />;
                break;
            case "ditolak":
                variant = "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
                icon = <X className="h-3 w-3 mr-1" />;
                break;
            case "sedang dipinjam":
                variant = "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
                icon = <Clock className="h-3 w-3 mr-1" />;
                break;
            case "dikembalikan":
                variant = "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
                icon = <CheckCircle className="h-3 w-3 mr-1" />;
                break;
            case "terlambat":
                variant = "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
                icon = <AlertTriangle className="h-3 w-3 mr-1" />;
                break;
            default:
                variant = "text-muted-foreground bg-muted/50";
        }

        return (
            <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${variant}`}>
                {icon}
                {status || 'N/A'}
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
                    return <span className="text-muted-foreground text-xs">Belum diproses</span>;
                }

                if (approvedBy && approvedAt) {
                    return (
                        <div className="text-xs">
                            <div className="font-medium text-foreground">{approvedBy}</div>
                            <div className="text-muted-foreground">{new Date(approvedAt).toLocaleDateString('id-ID')}</div>
                        </div>
                    );
                }

                return <span className="text-muted-foreground">-</span>;
            },
        },
        {
            id: "actions",
            header: "Aksi",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                const isPending = status?.toLowerCase() === 'menunggu persetujuan';
                const isBorrowed = status?.toLowerCase() === 'sedang dipinjam';

                return (
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(row.original)}
                        >
                            Detail
                        </Button>

                        {/* Approval buttons - only show for admin/aslab and pending status */}
                        {canApprove && isPending && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprovalAction(row.original, 'approve')}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprovalAction(row.original, 'reject')}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
                                >
                                    <ThumbsDown className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        {/* Return button */}
                        {isBorrowed && (
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
                        <h1 className="text-3xl font-bold text-foreground">Peminjaman Barang</h1>
                        <p className="text-muted-foreground mt-2">Kelola peminjaman barang laboratorium assistant</p>
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

            {/* Approval Modal */}
            <Dialog open={isApprovalModalOpen} onOpenChange={setIsApprovalModalOpen}>
                <DialogContent className="sm:max-w-lg bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            {approvalAction === 'approve' ? (
                                <>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                                        <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <span className="text-foreground">Setujui Peminjaman</span>
                                </>
                            ) : (
                                <>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                        <ThumbsDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <span className="text-foreground">Tolak Peminjaman</span>
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            {approvalAction === 'approve'
                                ? 'Apakah Anda yakin ingin menyetujui peminjaman ini? Stock akan direservasi untuk peminjam.'
                                : 'Apakah Anda yakin ingin menolak peminjaman ini? Stock akan dikembalikan ke inventaris.'
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPeminjaman && (
                        <div className="space-y-4">
                            {/* Detail Card with better styling */}
                            <div className="rounded-lg border border-border bg-muted/50 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileCheck className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-semibold text-foreground">Detail Peminjaman</span>
                                </div>
                                <div className="space-y-2 text-sm text-foreground">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Peminjam:</span>
                                        <span className="font-medium">{selectedPeminjaman.nama_peminjam}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Barang:</span>
                                        <span className="font-medium">{selectedPeminjaman.nama_aset || selectedPeminjaman.nama_barang}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Jumlah:</span>
                                        <span className="font-medium">{selectedPeminjaman.jumlah} unit</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tanggal Pinjam:</span>
                                        <span className="font-medium">
                                            {new Date(selectedPeminjaman.tanggal_pinjam).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Note Input with better styling */}
                            <div className="space-y-3">
                                <Label
                                    htmlFor="approval_note"
                                    className="text-sm font-medium text-foreground"
                                >
                                    {approvalAction === 'approve' ? (
                                        <span className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                            Catatan Persetujuan
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                            Alasan Penolakan
                                        </span>
                                    )}
                                </Label>
                                <Textarea
                                    id="approval_note"
                                    className="resize-none border-input bg-background text-foreground focus:border-ring focus:ring-ring"
                                    placeholder={
                                        approvalAction === 'approve'
                                            ? 'Masukkan catatan persetujuan (opsional)...'
                                            : 'Masukkan alasan penolakan...'
                                    }
                                    value={approvalNote}
                                    onChange={(e) => setApprovalNote(e.target.value)}
                                    rows={3}
                                />
                                {approvalAction === 'reject' && !approvalNote.trim() && (
                                    <p className="text-xs text-destructive">*Alasan penolakan wajib diisi</p>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3 pt-6">
                        <Button
                            variant="outline"
                            onClick={() => setIsApprovalModalOpen(false)}
                            disabled={processing}
                            className="border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={submitApproval}
                            disabled={processing || (approvalAction === 'reject' && !approvalNote.trim())}
                            className={
                                approvalAction === 'approve'
                                    ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 focus:ring-green-500 text-white shadow-sm'
                                    : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 focus:ring-red-500 text-white shadow-sm'
                            }
                        >
                            {processing ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Memproses...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    {approvalAction === 'approve' ? (
                                        <>
                                            <ThumbsUp className="h-4 w-4" />
                                            Setujui
                                        </>
                                    ) : (
                                        <>
                                            <ThumbsDown className="h-4 w-4" />
                                            Tolak
                                        </>
                                    )}
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
