import React, { useState, useRef, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { toast } from 'sonner';
import InputError from '@/components/input-error';

interface JenisAset {
    id: number;
    nama_jenis_aset: string;
}

interface Props {
    jenisAsets: JenisAset[];
    success?: string;
    newJenisAset?: JenisAset;
}

export default function AsetAslabCreate({ jenisAsets, success, newJenisAset }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [jenisAsetList, setJenisAsetList] = useState<JenisAset[]>(jenisAsets);

    const { data, setData, post, processing, errors } = useForm({
        nama_aset: '',
        jenis_id: '',
        kode_aset: '',
        nomor_seri: '',
        stok: 1,
        status: 'baik',
        catatan: '',
        gambar: null as File | null,
    });

    // Form for adding new jenis aset
    const { data: jenisData, setData: setJenisData, post: postJenis, processing: jenisProcessing, errors: jenisErrors } = useForm({
        nama_jenis_aset: '',
    });

    // debounce timer ref for nama_aset changes
    const namaDebounceRef = useRef<number | null>(null);

    // cleanup on unmount
    useEffect(() => {
        return () => {
            if (namaDebounceRef.current) {
                window.clearTimeout(namaDebounceRef.current);
            }
        };
    }, []);

    // Handle new jenis aset from redirect
    useEffect(() => {
        if (newJenisAset && success) {
            // Add the new jenis aset to the list
            setJenisAsetList(prev => {
                const exists = prev.find(item => item.id === newJenisAset.id);
                if (!exists) {
                    return [...prev, newJenisAset];
                }
                return prev;
            });

            // Auto select the new jenis aset
            setData('jenis_id', newJenisAset.id.toString());

            // Show success toast
            toast.success(success);
        }
    }, [newJenisAset, success, setData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nama_aset', data.nama_aset);
        formData.append('jenis_id', data.jenis_id);
        formData.append('kode_aset', data.kode_aset);
        formData.append('nomor_seri', data.nomor_seri);
        formData.append('stok', data.stok.toString());
        formData.append('status', data.status);
        formData.append('catatan', data.catatan);
        if (data.gambar) {
            formData.append('gambar', data.gambar);
        }

        post('/aset-aslab', {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Aset berhasil ditambahkan!');
            },
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('gambar', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNamaChange = (value: string) => {
        setData('nama_aset', value);

        // clear existing debounce
        if (namaDebounceRef.current) {
            window.clearTimeout(namaDebounceRef.current);
            namaDebounceRef.current = null;
        }

        // if nama is empty, clear kode_aset
        if (!value || value.trim() === '') {
            setData('kode_aset', '');
            return;
        }

        // debounce 600ms and fetch new kode
        namaDebounceRef.current = window.setTimeout(async () => {
            try {
                const res = await fetch('/aset-aslab/generate-kode');
                if (res.ok) {
                    const json = await res.json();
                    if (json.kode) {
                        setData('kode_aset', json.kode);
                    }
                }
            } catch (e) {
                console.error('Failed to generate kode aset', e);
            } finally {
                namaDebounceRef.current = null;
            }
        }, 600);
    };

    const removeImage = () => {
        setData('gambar', null);
        setImagePreview(null);
    };

    const handleJenisSubmit = () => {
        // Validasi manual sebelum submit
        if (!jenisData.nama_jenis_aset.trim()) {
            return;
        }

        postJenis('/jenis-aset-aslab', {
            onSuccess: () => {
                // Form will be redirected by the server to /aset-aslab/create
                // with success message and newJenisAset data
            },
            onError: (errors) => {
                // Error akan ditangani oleh form jenisErrors
                console.log('Error adding jenis aset:', errors);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Tambah Aset Aslab" />

            <div className="space-y-6 pt-4">
                {/* Header */}
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="w-fit">
                        <Link href="/aset-aslab">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tambah Aset Aslab</h1>
                        <p className="text-muted-foreground mt-2">
                            Tambahkan aset baru ke dalam inventaris laboratorium
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-4xl">
                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left: form fields (span 2) */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Informasi Dasar */}
                                        <div className="space-y-4">
                                            <div className="border-b pb-4">
                                                <h3 className="text-lg font-semibold">Informasi Dasar</h3>
                                                <p className="text-sm text-muted-foreground">Informasi utama tentang aset</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="nama_aset">Nama Aset *</Label>
                                                    <Input
                                                        id="nama_aset"
                                                        type="text"
                                                        value={data.nama_aset}
                                                        onChange={(e) => handleNamaChange(e.target.value)}
                                                        placeholder="Contoh: Mikroskop Digital"
                                                        required
                                                    />
                                                    <InputError message={errors.nama_aset} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="jenis_id">Jenis Aset *</Label>
                                                    <div className="flex gap-2">
                                                        <Select
                                                            value={data.jenis_id}
                                                            onValueChange={(value) => setData('jenis_id', value)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih jenis aset" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {jenisAsetList.map((jenis) => (
                                                                    <SelectItem key={jenis.id} value={jenis.id.toString()}>
                                                                        {jenis.nama_jenis_aset}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                                            <DialogTrigger asChild>
                                                                <Button type="button" variant="outline" size="icon">
                                                                    <Plus className="h-4 w-4" />
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="sm:max-w-md">
                                                                <DialogHeader>
                                                                    <DialogTitle>Tambah Jenis Aset Baru</DialogTitle>
                                                                </DialogHeader>
                                                                <div className="space-y-4">
                                                                    <div className="space-y-2">
                                                                        <Label htmlFor="nama_jenis_aset">Nama Jenis Aset *</Label>
                                                                        <Input
                                                                            id="nama_jenis_aset"
                                                                            type="text"
                                                                            value={jenisData.nama_jenis_aset}
                                                                            onChange={(e) => setJenisData('nama_jenis_aset', e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter') {
                                                                                    e.preventDefault();
                                                                                    handleJenisSubmit();
                                                                                }
                                                                            }}
                                                                            placeholder="Contoh: Mikroskop"
                                                                            required
                                                                        />
                                                                        <InputError message={jenisErrors.nama_jenis_aset} />
                                                                    </div>
                                                                    <div className="flex justify-end space-x-2">
                                                                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                                            Batal
                                                                        </Button>
                                                                        <Button type="button" onClick={handleJenisSubmit} disabled={jenisProcessing}>
                                                                            {jenisProcessing ? 'Menyimpan...' : 'Simpan'}
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                    <InputError message={errors.jenis_id} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="kode_aset">Kode Aset *</Label>
                                                    <Input
                                                        id="kode_aset"
                                                        type="text"
                                                        value={data.kode_aset}
                                                        onChange={(e) => setData('kode_aset', e.target.value)}
                                                        readOnly
                                                        placeholder="Contoh: AST-001"
                                                        className="font-mono"
                                                        required
                                                    />
                                                    <InputError message={errors.kode_aset} />
                                                    <p className="text-xs text-muted-foreground">(Otomatis di-generate setelah mengisi Nama Aset)</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="nomor_seri">Nomor Seri</Label>
                                                    <Input
                                                        id="nomor_seri"
                                                        type="text"
                                                        value={data.nomor_seri}
                                                        onChange={(e) => setData('nomor_seri', e.target.value)}
                                                        placeholder="Contoh: SN123456789"
                                                        className="font-mono"
                                                    />
                                                    <InputError message={errors.nomor_seri} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Detail Aset */}
                                        <div className="space-y-4">
                                            <div className="border-b pb-4">
                                                <h3 className="text-lg font-semibold">Detail Aset</h3>
                                                <p className="text-sm text-muted-foreground">Informasi detail kondisi dan stok aset</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="stok">Jumlah Stok *</Label>
                                                    <Input
                                                        id="stok"
                                                        type="number"
                                                        min="0"
                                                        value={data.stok}
                                                        onChange={(e) => setData('stok', parseInt(e.target.value) || 0)}
                                                        required
                                                    />
                                                    <InputError message={errors.stok} />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="status">Status Kondisi *</Label>
                                                    <Select
                                                        value={data.status}
                                                        onValueChange={(value) => setData('status', value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pilih status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="baik">Baik</SelectItem>
                                                            <SelectItem value="kurang_baik">Kurang Baik</SelectItem>
                                                            <SelectItem value="tidak_baik">Tidak Baik</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <InputError message={errors.status} />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="catatan">Catatan</Label>
                                                <Textarea
                                                    id="catatan"
                                                    value={data.catatan}
                                                    onChange={(e) => setData('catatan', e.target.value)}
                                                    placeholder="Masukkan catatan tambahan tentang aset ini..."
                                                    rows={4}
                                                />
                                                <InputError message={errors.catatan} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: image upload + actions */}
                                    <div className="space-y-6">
                                        <div className="border-b pb-4">
                                            <h3 className="text-lg font-semibold">Foto Aset</h3>
                                            <p className="text-sm text-muted-foreground">Upload foto aset untuk dokumentasi</p>
                                        </div>

                                        <div className="space-y-4">
                                            {!imagePreview ? (
                                                <div className="border-2 border-dashed border-input rounded-lg p-6 text-center hover:border-accent transition-colors">
                                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                                    <div className="mt-4">
                                                        <label htmlFor="gambar" className="cursor-pointer">
                                                            <span className="mt-2 block text-sm font-medium text-muted-foreground">Klik untuk upload gambar</span>
                                                            <span className="mt-1 block text-xs text-muted-foreground">PNG, JPG, GIF up to 2MB</span>
                                                        </label>
                                                        <input
                                                            id="gambar"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="relative">
                                                    <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeImage}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                            <InputError message={errors.gambar} />
                                        </div>

                                        <div className="border-t pt-6">
                                            <div className="space-y-3">
                                                    <Button type="submit" disabled={processing} className="w-full">
                                                        {processing ? 'Menyimpan...' : 'Simpan Aset'}
                                                    </Button>
                                                    <Button variant="outline" className="w-full" asChild>
                                                        <Link href="/aset-aslab">Batal</Link>
                                                    </Button>
                                                </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
