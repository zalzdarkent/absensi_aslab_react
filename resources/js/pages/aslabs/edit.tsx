import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';

interface User {
    id: number;
    name: string;
    email: string;
    rfid_code: string;
    prodi: string;
    semester: number;
    is_active: boolean;
}

interface Props {
    aslab: User;
}

interface FormData {
    name: string;
    email: string;
    password: string;
    rfid_code: string;
    prodi: string;
    semester: number;
    is_active: boolean;
}

const PRODI_OPTIONS = [
    'Informatika',
    'Sistem Informasi',
];

export default function AslabsEdit({ aslab }: Props) {
    const { data, setData, patch, processing, errors } = useForm<FormData>({
        name: aslab.name,
        email: aslab.email,
        password: '',
        rfid_code: aslab.rfid_code,
        prodi: aslab.prodi,
        semester: aslab.semester,
        is_active: aslab.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/aslabs/${aslab.id}`);
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
