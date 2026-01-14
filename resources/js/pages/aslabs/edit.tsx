import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Save, Scan, CheckCircle, X } from 'lucide-react';
import InputError from '@/components/input-error';
import { useState, useEffect } from 'react';
import { useRfidScanner } from '@/hooks/use-rfid-scanner';
import AppLayout from '@/layouts/app-layout';

interface User {
    id: number;
    name: string;
    email: string;
    rfid_code: string;
    prodi: string;
    semester: number;
    is_active: boolean;
    permissions?: Array<{ name: string }>;
}

interface Permission {
    id: number;
    name: string;
    guard_name: string;
}

interface Props {
    aslab: User;
    availablePermissions: Record<string, Permission[]>;
    currentPermissions: string[];
}

interface FormData {
    name: string;
    email: string;
    password: string;
    rfid_code: string;
    prodi: string;
    semester: number;
    is_active: boolean;
    permissions: string[];
}

const PRODI_OPTIONS = [
    'Informatika',
    'Sistem Informasi',
];

export default function AslabsEdit({ aslab, availablePermissions, currentPermissions }: Props) {
    const [showScanSuccess, setShowScanSuccess] = useState(false);

    const { data, setData, patch, processing, errors } = useForm<FormData>({
        name: aslab.name,
        email: aslab.email,
        password: '',
        rfid_code: aslab.rfid_code,
        prodi: aslab.prodi,
        semester: aslab.semester,
        is_active: aslab.is_active,
        permissions: currentPermissions || [],
    });

    // RFID Scanner Hook
    const { isScanning, startScanning, stopScanning, error: scanError } = useRfidScanner({
        onScan: (rfidCode: string) => {
            setData('rfid_code', rfidCode);
            setShowScanSuccess(true);
            stopScanning();

            // Hide success message after 3 seconds
            setTimeout(() => setShowScanSuccess(false), 3000);
        },
        enabled: true
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/aslabs/${aslab.id}`);
    };

    const handleScanRfid = () => {
        if (isScanning) {
            stopScanning();
        } else {
            startScanning();
        }
    };

    return (
        <AppLayout>
            <Head title={`Edit ${aslab.name}`} />

            <div className="space-y-6 pt-4">
                {/* Header */}
                <div className="space-y-4">
                    <Button variant="ghost" size="sm" asChild className="w-fit">
                        <Link href="/aslabs">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit {aslab.name}</h1>
                        <p className="text-muted-foreground mt-2">
                            Perbarui data asisten laboratorium
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className="max-w-4xl">
                    <Card>
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Personal Information */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Informasi Personal</h3>
                                        <p className="text-sm text-muted-foreground">Perbarui data personal aslab</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nama Lengkap</Label>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Masukkan nama lengkap"
                                                required
                                            />
                                            <InputError message={errors.name} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Masukkan email"
                                                required
                                            />
                                            <InputError message={errors.email} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password (Kosongkan jika tidak ingin diubah)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Masukkan password baru"
                                        />
                                        <InputError message={errors.password} />
                                    </div>
                                </div>

                                {/* Academic Information */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Informasi Akademik</h3>
                                        <p className="text-sm text-muted-foreground">Perbarui data akademik aslab</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="prodi">Program Studi</Label>
                                            <Select value={data.prodi} onValueChange={(value) => setData('prodi', value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih program studi" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {PRODI_OPTIONS.map((prodi) => (
                                                        <SelectItem key={prodi} value={prodi}>
                                                            {prodi}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.prodi} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="semester">Semester</Label>
                                            <Select
                                                value={data.semester.toString()}
                                                onValueChange={(value) => setData('semester', parseInt(value))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih semester" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 14 }, (_, i) => i + 1).map((sem) => (
                                                        <SelectItem key={sem} value={sem.toString()}>
                                                            Semester {sem}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError message={errors.semester} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rfid_code">Kode RFID</Label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Input
                                                    id="rfid_code"
                                                    type="text"
                                                    value={data.rfid_code}
                                                    onChange={(e) => setData('rfid_code', e.target.value.toUpperCase())}
                                                    placeholder="Tempel kartu RFID atau masukkan kode"
                                                    className="flex-1"
                                                />
                                                {showScanSuccess && (
                                                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                                                )}
                                            </div>
                                            <Button
                                                type="button"
                                                variant={isScanning ? "destructive" : "outline"}
                                                onClick={handleScanRfid}
                                                disabled={processing}
                                                className="min-w-[80px]"
                                            >
                                                {isScanning ? (
                                                    <>
                                                        <X className="h-4 w-4 mr-1" />
                                                        Stop
                                                    </>
                                                ) : (
                                                    <>
                                                        <Scan className="h-4 w-4 mr-1" />
                                                        Scan
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                        {isScanning && (
                                            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Menunggu kartu RFID... Tempelkan kartu pada reader.
                                            </div>
                                        )}
                                        {showScanSuccess && (
                                            <div className="text-sm text-green-600 bg-green-50 p-2 rounded flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                RFID berhasil di-scan dan dimasukkan!
                                            </div>
                                        )}
                                        {scanError && (
                                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                                Error: {scanError}
                                            </div>
                                        )}
                                        <p className="text-sm text-muted-foreground">
                                            {aslab.rfid_code ? `RFID saat ini: ${aslab.rfid_code}. Masukkan kode baru untuk mengubah.` : 'Belum ada RFID terdaftar. Masukkan kode untuk mendaftarkan.'}
                                        </p>
                                        <InputError message={errors.rfid_code} />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Status</h3>
                                        <p className="text-sm text-muted-foreground">Kelola status aktivitas aslab</p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked: boolean) => setData('is_active', checked)}
                                            />
                                            <Label htmlFor="is_active">Aslab Aktif</Label>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Hanya aslab aktif yang dapat melakukan absensi
                                        </p>
                                    </div>
                                </div>

                                {/* Permissions Information */}
                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="text-lg font-semibold">Hak Akses (Permissions)</h3>
                                        <p className="text-sm text-muted-foreground">Sesuaikan hak akses spesifik untuk aslab ini.</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(availablePermissions).map(([group, permissions]) => {
                                            const allSelected = permissions.every(p => data.permissions.includes(p.name));

                                            return (
                                                <div key={group} className="space-y-3 border p-4 rounded-lg">
                                                    <div className="flex items-center justify-between border-b pb-2 mb-2">
                                                        <h4 className="font-medium capitalize">{group}</h4>
                                                        <div className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`select-all-${group}`}
                                                                checked={allSelected}
                                                                onCheckedChange={(checked) => {
                                                                    const groupPermissionNames = permissions.map(p => p.name);
                                                                    if (checked) {
                                                                        const newPermissions = [...data.permissions];
                                                                        groupPermissionNames.forEach(name => {
                                                                            if (!newPermissions.includes(name)) {
                                                                                newPermissions.push(name);
                                                                            }
                                                                        });
                                                                        setData('permissions', newPermissions);
                                                                    } else {
                                                                        setData('permissions', data.permissions.filter(p => !groupPermissionNames.includes(p)));
                                                                    }
                                                                }}
                                                            />
                                                            <Label
                                                                htmlFor={`select-all-${group}`}
                                                                className="text-xs text-muted-foreground cursor-pointer"
                                                            >
                                                                Select All
                                                            </Label>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {permissions.map((permission) => (
                                                            <div key={permission.id} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`perm-${permission.id}`}
                                                                    checked={data.permissions.includes(permission.name)}
                                                                    onCheckedChange={(checked) => {
                                                                        if (checked) {
                                                                            setData('permissions', [...data.permissions, permission.name]);
                                                                        } else {
                                                                            setData('permissions', data.permissions.filter(p => p !== permission.name));
                                                                        }
                                                                    }}
                                                                />
                                                                <Label
                                                                    htmlFor={`perm-${permission.id}`}
                                                                    className="text-sm font-normal cursor-pointer"
                                                                >
                                                                    {permission.name.replace(/_/g, ' ')}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="border-t pt-6">
                                    <div className="flex gap-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Menyimpan...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="mr-2 h-4 w-4" />
                                                    Simpan Perubahan
                                                </>
                                            )}
                                        </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <Link href="/aslabs">
                                                Batal
                                            </Link>
                                        </Button>
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
