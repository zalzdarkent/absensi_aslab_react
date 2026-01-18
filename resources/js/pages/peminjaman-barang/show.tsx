import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
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
    FileClock,
    Phone,
    MapPin,
    ArrowRight,
    Info,
    FileDown,
    Share2,
    Shield,
    Image as ImageIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPhoneForWhatsApp, generateWhatsAppReminderMessage } from '@/utils/whatsapp-message-generator';
import { toast } from 'sonner';

interface Peminjaman {
    id: string;
    record_type: 'peminjaman' | 'penggunaan';
    nama_peminjam: string;
    nama_barang: string;
    kode_barang: string;
    tipe_barang: string;
    jumlah: number;
    tanggal_pinjam: string;
    tanggal_kembali: string | null;
    target_return_date: string | null;
    status: string;
    status_text: string;
    keterangan: string;
    approval_note: string | null;
    approved_by: string | null;
    approved_at: string | null;
    agreement_accepted: boolean;
    manual_borrower_name: string | null;
    manual_borrower_phone: string | null;
    manual_borrower_class: string | null;
    gambar: string | null;
    lokasi: string | null;
}

interface Props {
    peminjaman: Peminjaman;
    auth: {
        user: {
            id: number;
            role: string;
            permissions?: string[];
        };
    };
}

export default function PeminjamanShow({ peminjaman, auth }: Props) {
    const canApprove = auth.user.permissions?.includes('approve_loans') || auth.user.role === 'admin';

    const getStatusConfig = (status: string) => {
        const lowerStatus = status?.toLowerCase();
        switch (lowerStatus) {
            case "menunggu persetujuan":
            case "pending":
                return {
                    variant: "text-orange-600 border-orange-200 bg-orange-500/10",
                    glow: "shadow-orange-500/20",
                    icon: <FileClock className="h-5 w-5" />,
                    accent: "bg-orange-500",
                    label: "Menunggu"
                };
            case "disetujui":
            case "approved":
                return {
                    variant: "text-blue-600 border-blue-200 bg-blue-500/10",
                    glow: "shadow-blue-500/20",
                    icon: <FileCheck className="h-5 w-5" />,
                    accent: "bg-blue-500",
                    label: "Disetujui"
                };
            case "ditolak":
            case "rejected":
                return {
                    variant: "text-red-600 border-red-200 bg-red-500/10",
                    glow: "shadow-red-500/20",
                    icon: <X className="h-5 w-5" />,
                    accent: "bg-red-500",
                    label: "Ditolak"
                };
            case "sedang dipinjam":
            case "borrowed":
                return {
                    variant: "text-yellow-600 border-yellow-200 bg-yellow-500/10",
                    glow: "shadow-yellow-500/20",
                    icon: <Clock className="h-5 w-5" />,
                    accent: "bg-yellow-500",
                    label: "Dipinjam"
                };
            case "dikembalikan":
            case "returned":
                return {
                    variant: "text-green-600 border-green-200 bg-green-500/10",
                    glow: "shadow-green-500/20",
                    icon: <CheckCircle className="h-5 w-5" />,
                    accent: "bg-green-500",
                    label: "Kembali"
                };
            case "terlambat":
            case "overdue":
                return {
                    variant: "text-red-600 border-red-200 bg-red-500/10",
                    glow: "shadow-red-500/20",
                    icon: <AlertTriangle className="h-5 w-5" />,
                    accent: "bg-red-500",
                    label: "Terlambat"
                };
            default:
                return {
                    variant: "text-slate-600 border-slate-200 bg-slate-500/10",
                    glow: "shadow-slate-500/20",
                    icon: <FileText className="h-5 w-5" />,
                    accent: "bg-slate-500",
                    label: "Unknown"
                };
        }
    };

    const statusConfig = getStatusConfig(peminjaman.status_text || peminjaman.status);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleReturn = () => {
        router.post(`/peminjaman-barang/${peminjaman.id}/return`, {}, {
            onSuccess: () => toast.success('Barang berhasil dikembalikan')
        });
    };

    const handleExportPDF = () => {
        window.open(`/peminjaman-barang/${peminjaman.id}/export-pdf`, '_blank');
        toast.success('Sedang menyiapkan PDF...', {
            description: 'Dokumen akan segera terunduh secara otomatis.'
        });
    };

    return (
        <AppLayout>
            <Head title={`Peminjaman: ${peminjaman.nama_barang}`} />

            <div className="relative min-h-screen pb-20 overflow-hidden bg-background">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10 -translate-x-1/2 translate-y-1/2" />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

                    {/* Top Navigation & Actions */}
                    <div className="flex items-center justify-between gap-4">
                        <Link
                            href="/peminjaman-barang"
                            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-all group"
                        >
                            <div className="mr-2 p-1 rounded-full bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                <ChevronLeft className="h-3 w-3" />
                            </div>
                            Kembali ke Daftar
                        </Link>

                        <div className="flex items-center gap-2 text-primary">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleExportPDF}
                                className="h-8 px-3 text-[10px] uppercase tracking-wider font-bold rounded-full border-primary/20 hover:bg-primary/5 text-primary transition-all active:scale-95"
                            >
                                <FileDown className="mr-1.5 h-3 w-3" />
                                Export PDF
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                <Share2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>

                    {/* Compact Header Hero Section */}
                    <div className="relative overflow-hidden rounded-[1.5rem] bg-slate-950 text-slate-50 p-6 md:p-8 shadow-xl">
                        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-3">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[9px] font-black tracking-widest uppercase">
                                    <Shield className="h-2.5 w-2.5 text-primary" />
                                    Official Record
                                </div>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tighter leading-tight max-w-xl">
                                    {peminjaman.nama_barang}
                                </h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-slate-400 font-bold text-[10px] uppercase tracking-wide">
                                    <div className="flex items-center gap-1.5">
                                        <Package className="h-3 w-3" />
                                        Tipe: <span className="text-white">{peminjaman.tipe_barang}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Hash className="h-3 w-3" />
                                        Jumlah: <span className="text-white">{peminjaman.jumlah} unit</span>
                                    </div>
                                    {peminjaman.lokasi && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3 w-3" />
                                            Lokasi: <span className="text-white">{peminjaman.lokasi}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:items-end gap-3 shrink-0">
                                <div className={cn(
                                    "flex items-center gap-2.5 px-4 py-2 rounded-xl border backdrop-blur-xl shadow-lg transition-all",
                                    statusConfig.variant,
                                    statusConfig.glow
                                )}>
                                    <div className={cn("p-1.5 rounded-lg text-white", statusConfig.accent)}>
                                        {statusConfig.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase tracking-widest opacity-70 leading-none">Status</span>
                                        <span className="text-sm font-black tracking-tight">{peminjaman.status_text || peminjaman.status}</span>
                                    </div>
                                </div>

                                {peminjaman.status_text?.toLowerCase() === 'sedang dipinjam' && canApprove && (
                                    <Button
                                        onClick={handleReturn}
                                        className="w-full md:w-auto px-5 py-2 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black shadow-lg shadow-primary/25 transition-all active:scale-95"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Tandai Dikembalikan
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

                        {/* ITEM DETAILS CARD (Span 8) */}
                        <div className="md:col-span-8 space-y-6">
                            <Card className="border-none bg-card shadow-lg rounded-[1.25rem] overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
                                        {/* Image Section */}
                                        <div className="lg:col-span-2 bg-muted relative min-h-[180px] lg:min-h-full">
                                            {peminjaman.gambar ? (
                                                <img
                                                    src={`/storage/${peminjaman.gambar}`}
                                                    alt={peminjaman.nama_barang}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 space-y-2">
                                                    <ImageIcon className="h-12 w-12 stroke-[1]" />
                                                    <span className="text-[10px] font-black uppercase tracking-tighter">No Preview Available</span>
                                                </div>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <Badge className="bg-slate-950/80 backdrop-blur-md text-[9px] dark:text-white border-white/10 px-2 py-0.5 font-black uppercase">
                                                    Image Preview
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Info Section */}
                                        <div className="lg:col-span-3 p-6 space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xs font-black uppercase tracking-widest text-primary">Informasi Barang</h3>
                                                <Package className="h-4 w-4 text-muted-foreground/30" />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Kode Barang</label>
                                                    <p className="text-sm font-black font-mono tracking-tight">{peminjaman.kode_barang}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Tipe</label>
                                                    <p className="text-sm font-black capitalize">{peminjaman.tipe_barang}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Jumlah Peminjaman</label>
                                                    <p className="text-sm font-black">{peminjaman.jumlah} unit</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold text-muted-foreground uppercase">Lokasi</label>
                                                    <p className="text-sm font-black">{peminjaman.lokasi || '-'}</p>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-muted">
                                                <label className="text-[9px] font-bold text-muted-foreground uppercase block mb-1">Keterangan / Keperluan</label>
                                                <div className="p-3 rounded-lg bg-muted/40 text-[11px] font-medium leading-relaxed italic text-foreground/70">
                                                    {peminjaman.keterangan || "Tidak ada keterangan tambahan."}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Peminjam Info */}
                            <Card className="border-none bg-card shadow-lg rounded-[1.25rem] overflow-hidden">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                                <User className="h-4 w-4" />
                                            </div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Data Peminjam</h3>
                                        </div>
                                        <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter opacity-50">Authorized</Badge>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-muted-foreground uppercase">Akun Terdaftar</label>
                                            <p className="text-sm font-black">{peminjaman.nama_peminjam}</p>
                                        </div>
                                        {peminjaman.manual_borrower_class && (
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-bold text-muted-foreground uppercase">Kelas / Jurusan</label>
                                                <p className="text-sm font-black">{peminjaman.manual_borrower_class}</p>
                                            </div>
                                        )}
                                        {peminjaman.manual_borrower_name && (
                                            <div className="p-3 rounded-xl bg-slate-950 text-white space-y-1 relative overflow-hidden flex flex-col justify-center">
                                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest relative z-10">Manual Request</label>
                                                <p className="text-xs font-black relative z-10">{peminjaman.manual_borrower_name}</p>
                                                <Shield className="h-8 w-8 absolute top-0 right-0 p-1.5 opacity-10" />
                                            </div>
                                        )}
                                    </div>

                                    {peminjaman.manual_borrower_phone && (
                                        <div className="pt-4 border-t border-muted flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                                                    <Phone className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Kontak WhatsApp</p>
                                                    <p className="text-sm font-black">{peminjaman.manual_borrower_phone}</p>
                                                </div>
                                            </div>
                                            <Button asChild size="sm" className="h-8 rounded-full bg-green-600 hover:bg-green-700 text-[10px] font-black uppercase">
                                                <a
                                                    href={`https://wa.me/${formatPhoneForWhatsApp(peminjaman.manual_borrower_phone)}?text=${generateWhatsAppReminderMessage(peminjaman as any)}`}
                                                    target="_blank"
                                                    className="flex items-center gap-2"
                                                >
                                                    Kirim Pesan
                                                    <ArrowRight className="h-3 w-3" />
                                                </a>
                                            </Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT SIDEBAR (Span 4) */}
                        <div className="md:col-span-4 space-y-6">

                            {/* Timeline */}
                            <Card className="border-none bg-slate-50 dark:bg-slate-900/50 shadow-inner rounded-[1.25rem] overflow-hidden">
                                <CardContent className="p-6 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="p-2 rounded-lg bg-primary text-white">
                                            <Calendar className="h-4 w-4 dark:text-black" />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Timeline Peminjaman</h3>
                                    </div>

                                    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:via-blue-500 before:to-transparent">
                                        <div className="relative pl-10">
                                            <div className="absolute left-0 top-1 p-1 rounded-full bg-primary ring-2 ring-background z-10">
                                                <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-black text-muted-foreground/60 uppercase">Tanggal Pinjam</p>
                                                <p className="text-xs font-black">{formatDate(peminjaman.tanggal_pinjam)}</p>
                                                <p className="text-[10px] font-bold text-primary">{formatDateTime(peminjaman.tanggal_pinjam)}</p>
                                            </div>
                                        </div>

                                        {peminjaman.target_return_date && (
                                            <div className="relative pl-10">
                                                <div className="absolute left-0 top-1 p-1 rounded-full bg-blue-500 ring-2 ring-background z-10">
                                                    <Clock className="h-1.5 w-1.5 rounded-full bg-white" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[8px] font-black text-muted-foreground/60 uppercase">Target Kembali</p>
                                                    <p className="text-xs font-black text-blue-600 dark:text-blue-400">{formatDate(peminjaman.target_return_date)}</p>
                                                    <p className="text-[10px] font-bold text-blue-500/70">{formatDateTime(peminjaman.target_return_date)}</p>
                                                </div>
                                            </div>
                                        )}

                                        {peminjaman.tanggal_kembali && (
                                            <div className="relative pl-10">
                                                <div className="absolute left-0 top-1 p-1 rounded-full bg-green-500 ring-2 ring-background z-10">
                                                    <CheckCircle className="h-1.5 w-1.5 rounded-full bg-white" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[8px] font-black text-muted-foreground/60 uppercase">Aktual Kembali</p>
                                                    <p className="text-xs font-black text-green-600 dark:text-green-400">{formatDate(peminjaman.tanggal_kembali)}</p>
                                                    <p className="text-[10px] font-bold text-green-500/70">{formatDateTime(peminjaman.tanggal_kembali)}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Approval Info */}
                            {(peminjaman.approved_by || peminjaman.approved_at) && (
                                <Card className="border-none bg-card shadow-lg rounded-[1.25rem] overflow-hidden">
                                    <CardContent className="p-6 space-y-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-500/20">
                                                <UserCheck className="h-3.5 w-3.5" />
                                            </div>
                                            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Verifikasi</h3>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black">{peminjaman.approved_by || '-'}</p>
                                                <p className="text-[9px] font-bold text-muted-foreground">Otoritas Laboratorium</p>
                                            </div>
                                            <div className="p-2 rounded-lg bg-muted text-[8px] font-mono text-muted-foreground text-center">
                                                SIG: {peminjaman.approved_at ? peminjaman.approved_at.split('').reduce((acc, char) => acc + char.charCodeAt(0).toString(16), '').substring(0, 12).toUpperCase() : 'N/A'}
                                            </div>
                                        </div>

                                        {peminjaman.approval_note && (
                                            <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/20 border border-blue-500/10 text-[9px] font-black text-blue-600 dark:text-blue-400 leading-tight">
                                                Catatan: {peminjaman.approval_note}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Policy / Footer Note */}
                            <div className="p-5 rounded-[1.25rem] bg-slate-900 text-white relative overflow-hidden">
                                <Shield className="h-16 w-16 absolute -bottom-4 -right-4 opacity-10" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Kebijakan Lab</h4>
                                <p className="text-[10px] font-bold text-slate-400 leading-relaxed italic relative z-10">
                                    "Dokumen ini sah & dikeluarkan oleh Kepala Lab. Kerusakan barang adalah tanggung jawab peminjaman."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
