import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, Head, router } from '@inertiajs/react';
import { GraduationCap, UserRoundCog } from 'lucide-react';

interface SelectRoleProps {
    userName: string;
    provider?: 'google' | 'github';
}

export default function SelectRole({ userName, provider = 'google' }: SelectRoleProps) {
    const handleRoleSelection = (role: 'mahasiswa' | 'dosen') => {
        const endpoint = provider === 'github' 
            ? '/auth/github/complete-registration' 
            : '/auth/google/complete-registration';
            
        router.post(endpoint, {
            role: role,
        });
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <Head title="Pilih Role - Sistem Absensi Aslab" />

            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                        <img
                            src="/img/logo_aslab.png"
                            alt="Logo Aslab"
                            className="h-16 w-16 object-contain"
                        />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Selamat Datang!</CardTitle>
                        <CardDescription className="mt-2">
                            Halo <span className="font-semibold">{userName}</span>, pilih role Anda untuk melanjutkan
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={() => handleRoleSelection('mahasiswa')}
                        className="w-full h-20 flex flex-col gap-2"
                        variant="outline"
                    >
                        <GraduationCap className="h-8 w-8" />
                        <span className="text-lg font-semibold">Saya Mahasiswa</span>
                    </Button>

                    <Button
                        onClick={() => handleRoleSelection('dosen')}
                        className="w-full h-20 flex flex-col gap-2"
                        variant="outline"
                    >
                        <UserRoundCog className="h-8 w-8" />
                        <span className="text-lg font-semibold">Saya Dosen</span>
                    </Button>

                    <p className="text-sm text-muted-foreground text-center mt-6">
                        Role ini akan menentukan akses dan fitur yang tersedia untuk Anda di sistem.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
