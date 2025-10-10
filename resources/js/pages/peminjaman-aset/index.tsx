import React, { useEffect, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Package,
    Plus,
    Search,
    Filter,
    Calendar,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    ArrowUpDown,
    Download
} from 'lucide-react';
import { PageTransition } from '@/components/ui/loading-animations';
import { Highlightable } from '@/components/ui/highlightable';

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
}

interface Props {
    peminjamanList: Peminjaman[];
    filters: {
        search?: string;
        status?: string;
        sort?: string;
    };
}

export default function IndexPeminjamanAset({ peminjamanList, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || 'all');
    const [sortBy, setSortBy] = useState(filters?.sort || 'newest');
    const [highlightId, setHighlightId] = useState<number | null>(null);

    // Check for highlight parameter in URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const highlight = urlParams.get('highlight');
        if (highlight) {
            setHighlightId(parseInt(highlight));
            // Auto-scroll to highlighted item after a delay
            setTimeout(() => {
                const element = document.getElementById(`peminjaman-${highlight}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (searchTerm) params.set('search', searchTerm);
        if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
        if (sortBy !== 'newest') params.set('sort', sortBy);
        
        const queryString = params.toString();
        router.get(`/peminjaman-aset${queryString ? `?${queryString}` : ''}`);
    };    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
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
            case 'pending': return 'border-l-yellow-500';
            case 'approved': return 'border-l-green-500';
            case 'rejected': return 'border-l-red-500';
            default: return 'border-l-gray-500';
        }
    };

    // Mock data untuk demo jika props kosong
    const mockData: Peminjaman[] = peminjamanList?.length ? peminjamanList : [
        {
            id: 1,
            userName: 'Ahmad Rizki',
            userRole: 'Mahasiswa',
            itemName: 'Mikroskop Digital',
            itemCode: 'MIC-001',
            requestDate: '2024-01-15',
            quantity: 1,
            status: 'pending',
            notes: 'Untuk penelitian tugas akhir'
        },
        {
            id: 2,
            userName: 'Sari Dewi',
            userRole: 'Mahasiswa',
            itemName: 'Centrifuge',
            itemCode: 'CEN-002',
            requestDate: '2024-01-14',
            quantity: 1,
            status: 'approved',
            notes: 'Praktikum biologi'
        }
    ];

    return (
        <AppLayout>
            <Head title="Peminjaman Aset" />

            <PageTransition>
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Peminjaman Aset
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Kelola peminjaman aset laboratorium
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="outline" className="hover-scale">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                                <Button asChild className="gradient-primary hover-scale">
                                    <Link href="/peminjaman-aset/create">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Ajukan Peminjaman
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <Card className="mb-6 shadow-elegant">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter & Pencarian
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari nama aset, kode, atau peminjam..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10"
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </div>
                                </div>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="approved">Disetujui</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger>
                                        <ArrowUpDown className="h-4 w-4 mr-2" />
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="newest">Terbaru</SelectItem>
                                        <SelectItem value="oldest">Terlama</SelectItem>
                                        <SelectItem value="name">Nama A-Z</SelectItem>
                                        <SelectItem value="status">Status</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-2 mt-4">
                                <Button onClick={handleSearch} className="hover-scale">
                                    <Search className="h-4 w-4 mr-2" />
                                    Cari
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setSortBy('newest');
                                        router.get('/peminjaman-aset');
                                    }}
                                    className="hover-scale"
                                >
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="hover-lift">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                                        <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Total</p>
                                        <p className="text-xl font-bold">{mockData.length}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pending</p>
                                        <p className="text-xl font-bold">
                                            {mockData.filter(p => p.status === 'pending').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Disetujui</p>
                                        <p className="text-xl font-bold">
                                            {mockData.filter(p => p.status === 'approved').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ditolak</p>
                                        <p className="text-xl font-bold">
                                            {mockData.filter(p => p.status === 'rejected').length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Peminjaman List */}
                    <div className="space-y-4">
                        {mockData.length === 0 ? (
                            <Card className="shadow-elegant">
                                <CardContent className="p-8 text-center">
                                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">Belum Ada Peminjaman</h3>
                                    <p className="text-muted-foreground mb-4">
                                        Belum ada peminjaman aset yang diajukan.
                                    </p>
                                    <Button asChild className="gradient-primary">
                                        <Link href="/peminjaman-aset/create">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Ajukan Peminjaman Pertama
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            mockData.map((peminjaman) => (
                                <Highlightable
                                    key={peminjaman.id}
                                    id={`peminjaman-${peminjaman.id}`}
                                    isHighlighted={highlightId === peminjaman.id}
                                    className="block"
                                >
                                    <Card className={`hover-lift shadow-elegant border-l-4 transition-all duration-300 ${getStatusColor(peminjaman.status)}`}>
                                        <CardContent className="p-6">
                                            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                                                {/* Main Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <h3 className="text-xl font-semibold mb-1">
                                                                {peminjaman.itemName}
                                                            </h3>
                                                            <p className="text-muted-foreground text-sm mb-2">
                                                                Kode: {peminjaman.itemCode} • ID: #{peminjaman.id}
                                                            </p>
                                                            {getStatusBadge(peminjaman.status)}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium">{peminjaman.userName}</p>
                                                                <p className="text-muted-foreground">{peminjaman.userRole}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium">Tanggal Pengajuan</p>
                                                                <p className="text-muted-foreground">{peminjaman.requestDate}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Package className="h-4 w-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium">Jumlah</p>
                                                                <p className="text-muted-foreground">{peminjaman.quantity} unit</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {peminjaman.notes && (
                                                        <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                                                            <p className="text-sm text-muted-foreground">
                                                                <span className="font-medium">Catatan:</span> {peminjaman.notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="flex flex-col gap-2 lg:flex-shrink-0">
                                                    <Button asChild variant="outline" size="sm" className="hover-scale">
                                                        <Link href={`/peminjaman-aset/${peminjaman.id}`}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Detail
                                                        </Link>
                                                    </Button>

                                                    {peminjaman.status === 'pending' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                className="bg-green-500 hover:bg-green-600 hover-scale"
                                                                onClick={() => {
                                                                    router.post(`/peminjaman-aset/${peminjaman.id}/approve`);
                                                                }}
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                                Setujui
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 border-red-200 hover:bg-red-50 hover-scale"
                                                                onClick={() => {
                                                                    router.post(`/peminjaman-aset/${peminjaman.id}/reject`);
                                                                }}
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" />
                                                                Tolak
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Highlightable>
                            ))
                        )}
                    </div>
                </div>
            </PageTransition>
        </AppLayout>
    );
}
