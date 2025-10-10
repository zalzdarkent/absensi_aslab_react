import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, ArrowLeft, Send } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { PageTransition } from '@/components/ui/loading-animations';

interface Aset {
    id: number;
    nama_aset: string;
    kode_aset: string;
    stok: number;
}

interface Props {
    asets: Aset[];
}

export default function CreatePeminjamanAset({ asets }: Props) {
    const [selectedAset, setSelectedAset] = useState<Aset | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        aset_aslab_id: '',
        stok: 1,
        notes: ''
    });

    const handleAsetChange = (asetId: string) => {
        const aset = asets.find(a => a.id.toString() === asetId);
        setSelectedAset(aset || null);
        setData('aset_aslab_id', asetId);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/peminjaman-aset');
    };

    return (
        <AppLayout>
            <Head title="Ajukan Peminjaman Aset" />

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
                                Ajukan Peminjaman Aset
                            </h1>
                        </div>
                        <p className="text-muted-foreground">
                            Lengkapi form berikut untuk mengajukan peminjaman aset laboratorium
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Form */}
                        <div className="lg:col-span-2">
                            <Card className="hover-lift shadow-elegant">
                                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-t-lg">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-primary" />
                                        Form Peminjaman
                                    </CardTitle>
                                    <CardDescription>
                                        Isi informasi peminjaman aset dengan lengkap
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={submit} className="space-y-6">
                                        {/* Pilih Aset */}
                                        <div className="space-y-2">
                                            <Label htmlFor="aset_aslab_id">Pilih Aset *</Label>
                                            <Select
                                                value={data.aset_aslab_id}
                                                onValueChange={handleAsetChange}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih aset yang akan dipinjam" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {asets.map((aset) => (
                                                        <SelectItem key={aset.id} value={aset.id.toString()}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{aset.nama_aset}</span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    {aset.kode_aset} • Stok: {aset.stok}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.aset_aslab_id && (
                                                <p className="text-sm text-red-600">{errors.aset_aslab_id}</p>
                                            )}
                                        </div>

                                        {/* Jumlah */}
                                        <div className="space-y-2">
                                            <Label htmlFor="stok">Jumlah *</Label>
                                            <Input
                                                id="stok"
                                                type="number"
                                                min="1"
                                                max={selectedAset?.stok || 1}
                                                value={data.stok}
                                                onChange={(e) => setData('stok', parseInt(e.target.value) || 1)}
                                                placeholder="Masukkan jumlah"
                                                disabled={!selectedAset}
                                            />
                                            {selectedAset && (
                                                <p className="text-sm text-muted-foreground">
                                                    Stok tersedia: {selectedAset.stok}
                                                </p>
                                            )}
                                            {errors.stok && (
                                                <p className="text-sm text-red-600">{errors.stok}</p>
                                            )}
                                        </div>

                                        {/* Catatan */}
                                        <div className="space-y-2">
                                            <Label htmlFor="notes">Catatan / Keperluan</Label>
                                            <Textarea
                                                id="notes"
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                placeholder="Jelaskan keperluan peminjaman aset ini..."
                                                rows={4}
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Opsional: Jelaskan untuk apa aset ini akan digunakan
                                            </p>
                                            {errors.notes && (
                                                <p className="text-sm text-red-600">{errors.notes}</p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end pt-4">
                                            <Button
                                                type="submit"
                                                disabled={processing || !selectedAset}
                                                className="gradient-primary hover-lift shadow-md hover:shadow-lg min-w-[150px]"
                                            >
                                                {processing ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        Mengirim...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Send className="h-4 w-4" />
                                                        Ajukan Peminjaman
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info Panel */}
                        <div className="space-y-4">
                            {/* Selected Aset Info */}
                            {selectedAset && (
                                <Card className="hover-lift fade-in">
                                    <CardHeader>
                                        <CardTitle className="text-lg">Detail Aset</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Nama Aset</Label>
                                            <p className="font-medium">{selectedAset.nama_aset}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Kode Aset</Label>
                                            <p className="font-mono text-sm">{selectedAset.kode_aset}</p>
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Stok Tersedia</Label>
                                            <p className="font-medium text-green-600">{selectedAset.stok} unit</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Info Card */}
                            <Card className="hover-lift">
                                <CardHeader>
                                    <CardTitle className="text-lg">Informasi Peminjaman</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                                        <p>Peminjaman akan ditinjau oleh admin/aslab</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                                        <p>Notifikasi akan dikirim saat status berubah</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                                        <p>Aset yang disetujui dapat diambil di laboratorium</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                                        <p>Jangan lupa mengembalikan aset sesuai jadwal</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Aset List */}
                            <Card className="hover-lift">
                                <CardHeader>
                                    <CardTitle className="text-lg">Aset Tersedia</CardTitle>
                                    <CardDescription>
                                        {asets.length} aset siap dipinjam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {asets.map((aset) => (
                                            <div
                                                key={aset.id}
                                                className={`p-3 rounded-lg border transition-colors ${
                                                    selectedAset?.id === aset.id
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <p className="font-medium text-sm">{aset.nama_aset}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {aset.kode_aset} • Stok: {aset.stok}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </PageTransition>
        </AppLayout>
    );
}
