import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { PeminjamanDetailModal } from '@/components/ui/peminjaman-detail-modal';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, ShoppingCart, Clock, CheckCircle, AlertTriangle, X, FileCheck, FileClock, ThumbsUp, ThumbsDown, Eye, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ColumnDef } from "@tanstack/react-table";
import { toast } from 'sonner';

interface PinjamBarang {
    id: string;
    nama_peminjam: string;
    nama_barang: string; // Backend mengirim nama_barang (unified name untuk aset & bahan)
    jumlah: number;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    target_return_date?: string | null;
    status: string;
    raw_status?: string;
    tipe_barang?: string;
    keterangan?: string;
    approved_by?: string;
    approved_at?: string;
    manual_borrower_name?: string;
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
    const [highlightId, setHighlightId] = useState<number | null>(null);

    // Handle highlight from URL parameter
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const highlight = urlParams.get('highlight');
        if (highlight) {
            const id = parseInt(highlight);
            setHighlightId(id);

            // Auto-scroll to highlighted row after a delay
            setTimeout(() => {
                const element = document.querySelector(`[data-row-id="${id}"]`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);

            // Remove highlight after 5 seconds
            setTimeout(() => {
                setHighlightId(null);
                urlParams.delete('highlight');
                const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
                window.history.replaceState({}, '', newUrl);
            }, 5000);
        }
    }, []);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
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

    const handleDeleteAction = (peminjaman: PinjamBarang) => {
        setSelectedPeminjaman(peminjaman);
        setIsDeleteModalOpen(true);
    };

    const submitDelete = () => {
        if (!selectedPeminjaman) return;

        setProcessing(true);

        router.delete(`/peminjaman-barang/${selectedPeminjaman.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
                toast.success('Data peminjaman berhasil dihapus!');
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

    const handleReturn = (id: string) => {
        router.post(`/peminjaman-barang/${id}/return`, {}, {
            onSuccess: () => {
                toast.success('Barang berhasil ditandai sebagai dikembalikan', {
                    description: 'Status peminjaman telah diupdate'
                });
            },
            onError: (errors) => {
                console.error('Return error:', errors);
                toast.error('Terjadi kesalahan saat memproses pengembalian');
            }
        });
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
                icon = <Clock className="h-3 w-3 mr-1" />;
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
            id: "nama_peminjam",
            accessorFn: (row) => row.manual_borrower_name || row.nama_peminjam,
            header: "Nama Peminjam",
            cell: ({ row }) => {
                const manualName = row.original.manual_borrower_name;
                const registeredName = row.original.nama_peminjam;
                
                if (manualName) {
                    return (
                        <div className="flex flex-col">
                            <span className="font-medium text-blue-600 dark:text-blue-400">{manualName}</span>
                            <span className="text-[10px] text-muted-foreground italic">Manual (via {registeredName})</span>
                        </div>
                    );
                }
                
                return <span className="font-medium">{registeredName}</span>;
            },
        },
        {
            accessorKey: "nama_barang",
            header: "Nama Barang",
            cell: ({ row }) => {
                const namaBarang = row.getValue("nama_barang") as string;
                return namaBarang && namaBarang !== 'N/A' ? namaBarang : '-';
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
                const tanggal = row.getValue("tanggal_kembali") as string | null;
                const status = row.getValue("status") as string;
                const tipeBarang = row.original.tipe_barang;
                const targetReturnDate = row.original.target_return_date;

                // Jika bahan, tampilkan "Tidak perlu dikembalikan"
                if (tipeBarang === 'bahan' || status?.toLowerCase() === 'digunakan') {
                    return <span className="text-muted-foreground text-xs">Tidak perlu dikembalikan</span>;
                }

                // Jika sudah ada tanggal kembali aktual, tampilkan tanggal kembali + target
                if (tanggal) {
                    return (
                        <div className="text-xs space-y-1">
                            <div className="font-medium text-green-600 dark:text-green-400">
                                {new Date(tanggal).toLocaleDateString('id-ID')}
                            </div>
                            <div className="text-muted-foreground">Sudah dikembalikan</div>
                            {targetReturnDate && (
                                <div className="text-xs text-muted-foreground">
                                    Target: {new Date(targetReturnDate).toLocaleDateString('id-ID')}
                                </div>
                            )}
                        </div>
                    );
                }

                // Jika belum dikembalikan tapi ada target return date (tampilkan apapun statusnya)
                if (targetReturnDate) {
                    const targetDate = new Date(targetReturnDate);
                    const isOverdue = targetDate < new Date() && (status?.toLowerCase() === 'disetujui' || status?.toLowerCase() === 'sedang dipinjam');

                    return (
                        <div className="text-xs">
                            <div className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {targetDate.toLocaleDateString('id-ID')}
                            </div>
                            <div className={`${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {status?.toLowerCase() === 'menunggu persetujuan' ? 'Target kembali' :
                                 status?.toLowerCase() === 'ditolak' ? 'Target kembali' :
                                 isOverdue ? 'Terlambat' : 'Target kembali'}
                            </div>
                        </div>
                    );
                }

                return <span className="text-muted-foreground">-</span>;
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
                const isBorrowed = status?.toLowerCase() === 'sedang dipinjam' || status?.toLowerCase() === 'disetujui';

                return (
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(row.original)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>

                        {/* Approval buttons - only show for admin/aslab and pending status */}
                        {canApprove && isPending && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprovalAction(row.original, 'approve')}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950 border-green-200 dark:border-green-800"
                                >
                                    <ThumbsUp className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApprovalAction(row.original, 'reject')}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                                >
                                    <ThumbsDown className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        {/* Return button */}
                        {isBorrowed && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReturn(row.original.id)}
                                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-950 border-purple-200 dark:border-purple-800"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Kembalikan
                            </Button>
                        )}

                        {/* Delete button - only for admin/aslab */}
                        {canApprove && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAction(row.original)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950 border-red-200 dark:border-red-800"
                            >
                                <Trash2 className="h-4 w-4" />
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

            <div className="space-y-6 py-4 sm:py-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="space-y-2">
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                            Peminjaman Barang
                        </h1>
                        <p className="text-sm sm:text-base text-muted-foreground">
                            Kelola peminjaman barang laboratorium assistant
                        </p>
                    </div>
                    <Button asChild className="w-full sm:w-auto">
                        <Link href="/peminjaman-barang/create">
                            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs sm:text-sm">Ajukan Peminjaman</span>
                        </Link>
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium opacity-90">
                                Total Peminjaman
                            </CardTitle>
                            <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.total_peminjaman}</div>
                            <p className="text-xs opacity-90">
                                Seluruh transaksi
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium opacity-90">
                                Sedang Dipinjam
                            </CardTitle>
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.sedang_dipinjam}</div>
                            <p className="text-xs opacity-90">
                                Unit barang
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium opacity-90">
                                Sudah Kembali
                            </CardTitle>
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.sudah_kembali}</div>
                            <p className="text-xs opacity-90">
                                Unit dikembalikan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium opacity-90">
                                Terlambat
                            </CardTitle>
                            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 opacity-90" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold">{stats.terlambat_kembali}</div>
                            <p className="text-xs opacity-90">
                                Unit terlambat
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg sm:text-xl">Daftar Peminjaman</CardTitle>
                        <CardDescription className="text-sm">
                            Riwayat dan status peminjaman barang dalam sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <DataTable
                            columns={columns}
                            data={pinjamBarangs}
                            searchPlaceholder="Cari nama peminjam..."
                            highlightId={highlightId || undefined}
                            highlightKey="id"
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
                                        <span className="font-medium">{selectedPeminjaman.nama_barang}</span>
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

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent className="sm:max-w-lg bg-background border-border">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                                <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-foreground">Hapus Data Peminjaman</span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Apakah Anda yakin ingin menghapus data peminjaman ini? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPeminjaman && (
                        <div className="space-y-4">
                            {/* Detail Card */}
                            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    <span className="text-sm font-semibold text-red-800 dark:text-red-200">Data yang akan dihapus</span>
                                </div>
                                <div className="space-y-2 text-sm text-foreground">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Peminjam:</span>
                                        <span className="font-medium">{selectedPeminjaman.nama_peminjam}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Barang:</span>
                                        <span className="font-medium">{selectedPeminjaman.nama_barang}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Jumlah:</span>
                                        <span className="font-medium">{selectedPeminjaman.jumlah} unit</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Status:</span>
                                        <span className="font-medium">{selectedPeminjaman.status}</span>
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
                                    Hapus Data
                                </span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
