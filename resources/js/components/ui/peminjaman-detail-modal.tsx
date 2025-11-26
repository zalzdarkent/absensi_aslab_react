import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    User,
    Package,
    Calendar,
    Clock,
    Hash,
    CheckCircle,
    AlertTriangle,
    FileText,
    UserCheck,
    X,
    FileCheck,
    FileClock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinjamBarang {
    id: number;
    nama_peminjam: string;
    nama_aset: string;
    nama_barang?: string;
    jumlah: number;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    status: string;
    keterangan?: string;
    approved_by?: string;
    approved_at?: string;
    manual_borrower_name?: string;
    manual_borrower_phone?: string;
    manual_borrower_class?: string;
}

interface PeminjamanDetailModalProps {
    peminjaman: PinjamBarang | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onReturn?: (peminjamanId: number) => void; // Optional callback for return action
}

export function PeminjamanDetailModal({ peminjaman, isOpen, onOpenChange, onReturn }: PeminjamanDetailModalProps) {
    if (!peminjaman) return null;

    const getStatusConfig = (status: string) => {
        switch (status?.toLowerCase()) {
            case "menunggu persetujuan":
                return {
                    variant: "text-orange-600 bg-orange-100 border-orange-200",
                    icon: <FileClock className="h-4 w-4" />,
                    bgColor: "bg-orange-50",
                    description: "Permintaan sedang menunggu persetujuan dari admin/aslab"
                };
            case "disetujui":
                return {
                    variant: "text-blue-600 bg-blue-100 border-blue-200",
                    icon: <FileCheck className="h-4 w-4" />,
                    bgColor: "bg-blue-50",
                    description: "Permintaan telah disetujui dan dapat diambil"
                };
            case "ditolak":
                return {
                    variant: "text-red-600 bg-red-100 border-red-200",
                    icon: <X className="h-4 w-4" />,
                    bgColor: "bg-red-50",
                    description: "Permintaan ditolak oleh admin/aslab"
                };
            case "sedang dipinjam":
                return {
                    variant: "text-yellow-600 bg-yellow-100 border-yellow-200",
                    icon: <Clock className="h-4 w-4" />,
                    bgColor: "bg-yellow-50",
                    description: "Barang sedang dalam masa peminjaman"
                };
            case "dikembalikan":
                return {
                    variant: "text-green-600 bg-green-100 border-green-200",
                    icon: <CheckCircle className="h-4 w-4" />,
                    bgColor: "bg-green-50",
                    description: "Barang telah dikembalikan dengan sukses"
                };
            case "terlambat":
                return {
                    variant: "text-red-600 bg-red-100 border-red-200",
                    icon: <AlertTriangle className="h-4 w-4" />,
                    bgColor: "bg-red-50",
                    description: "Peminjaman melewati batas waktu pengembalian"
                };
            default:
                return {
                    variant: "text-gray-600 bg-gray-100 border-gray-200",
                    icon: <FileText className="h-4 w-4" />,
                    bgColor: "bg-gray-50",
                    description: "Status tidak diketahui"
                };
        }
    };

    const statusConfig = getStatusConfig(peminjaman.status);

    // Determine item name (prioritize aset, fallback to bahan)
    const itemName = (peminjaman.nama_aset && peminjaman.nama_aset !== 'N/A')
        ? peminjaman.nama_aset
        : (peminjaman.nama_barang && peminjaman.nama_barang !== 'N/A')
            ? peminjaman.nama_barang
            : 'Item tidak diketahui';

    const formatDate = (dateString: string) => {
        if (!dateString || dateString === '-') return '-';
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return '-';
        try {
            return new Date(dateString).toLocaleString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-left">
                        <Package className="h-5 w-5 text-blue-600" />
                        Detail Peminjaman #{peminjaman.id}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    {/* Status Section */}
                    <div className={cn("rounded-lg p-4 border")}>
                        <div className="flex items-center gap-3 mb-3">
                            {statusConfig.icon}
                            <div className="flex-1">
                                <Badge className={cn("border text-sm px-3 py-1", statusConfig.variant)}>
                                    {peminjaman.status}
                                </Badge>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{statusConfig.description}</p>
                    </div>

                    {/* Main Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Peminjam</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Nama Peminjam</p>
                                            <p className="font-medium">{peminjaman.nama_peminjam}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Barang</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Nama Barang</p>
                                            <p className="font-medium">{itemName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Hash className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Jumlah</p>
                                            <p className="font-medium">{peminjaman.jumlah} unit</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Info - Show in left column if manual borrower data exists */}
                            {(peminjaman.manual_borrower_name || peminjaman.manual_borrower_phone || peminjaman.manual_borrower_class) && (peminjaman.approved_by || peminjaman.approved_at) && (
                                <div className="border-t border-border pt-4">
                                    <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Persetujuan</h3>
                                    <div className="space-y-3">
                                        {peminjaman.approved_by && (
                                            <div className="flex items-center gap-3">
                                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Disetujui oleh</p>
                                                    <p className="font-medium">{peminjaman.approved_by}</p>
                                                </div>
                                            </div>
                                        )}
                                        {peminjaman.approved_at && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Waktu Persetujuan</p>
                                                    <p className="font-medium">{formatDateTime(peminjaman.approved_at)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Waktu</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Tanggal Pinjam</p>
                                            <p className="font-medium">{formatDate(peminjaman.tanggal_pinjam)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Target Kembali</p>
                                            <p className="font-medium">{formatDate(peminjaman.tanggal_kembali)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Borrower Data - Only show if data exists */}
                            {(peminjaman.manual_borrower_name || peminjaman.manual_borrower_phone || peminjaman.manual_borrower_class) && (
                                <div className="border-t border-border pt-4">
                                    <h3 className="text-lg font-semibold text-foreground mb-3">Data Peminjam Manual</h3>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                        <div className="space-y-3">
                                            {peminjaman.manual_borrower_name && (
                                                <div className="flex items-center gap-3">
                                                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    <div>
                                                        <p className="text-sm text-blue-700 dark:text-blue-300">Nama</p>
                                                        <p className="font-medium text-blue-800 dark:text-blue-200">{peminjaman.manual_borrower_name}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {peminjaman.manual_borrower_phone && (
                                                <div className="flex items-center gap-3">
                                                    <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    <div>
                                                        <p className="text-sm text-blue-700 dark:text-blue-300">No. Telepon</p>
                                                        <p className="font-medium text-blue-800 dark:text-blue-200">{peminjaman.manual_borrower_phone}</p>
                                                    </div>
                                                </div>
                                            )}
                                            {peminjaman.manual_borrower_class && (
                                                <div className="flex items-center gap-3">
                                                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                    <div>
                                                        <p className="text-sm text-blue-700 dark:text-blue-300">Kelas/Jabatan</p>
                                                        <p className="font-medium text-blue-800 dark:text-blue-200">{peminjaman.manual_borrower_class}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 italic">
                                            Data peminjam yang datang langsung ke aslab
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Approval Info - Show in right column if NO manual borrower data */}
                            {!(peminjaman.manual_borrower_name || peminjaman.manual_borrower_phone || peminjaman.manual_borrower_class) && (peminjaman.approved_by || peminjaman.approved_at) && (
                                <div className="border-t border-border pt-4">
                                    <h3 className="text-lg font-semibold text-foreground mb-3">Informasi Persetujuan</h3>
                                    <div className="space-y-3">
                                        {peminjaman.approved_by && (
                                            <div className="flex items-center gap-3">
                                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Disetujui oleh</p>
                                                    <p className="font-medium">{peminjaman.approved_by}</p>
                                                </div>
                                            </div>
                                        )}
                                        {peminjaman.approved_at && (
                                            <div className="flex items-center gap-3">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Waktu Persetujuan</p>
                                                    <p className="font-medium">{formatDateTime(peminjaman.approved_at)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Keterangan */}
                    {peminjaman.keterangan && (
                        <div className="border-t border-border pt-4">
                            <h3 className="text-lg font-semibold text-foreground mb-3">Keterangan</h3>
                            <div className="bg-muted/50 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <p className="text-sm text-foreground">{peminjaman.keterangan}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                        {peminjaman.status?.toLowerCase() === 'sedang dipinjam' && onReturn && (
                            <Button
                                className="flex-1"
                                size="lg"
                                onClick={() => {
                                    onReturn(peminjaman.id);
                                    onOpenChange(false);
                                }}
                            >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Tandai Dikembalikan
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            size="lg"
                            className={peminjaman.status?.toLowerCase() === 'sedang dipinjam' && onReturn ? "" : "flex-1"}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Tutup
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
