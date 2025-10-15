import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Register() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <Head title="Daftar - Sistem Absensi Aslab" />

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
                        <CardTitle className="text-2xl font-bold">Pendaftaran Aslab</CardTitle>
                        <CardDescription className="mt-2">
                            Lengkapi data di bawah untuk mendaftar sebagai asisten laboratorium
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form
                        {...RegisteredUserController.store.form()}
                        resetOnSuccess={['password', 'password_confirmation']}
                        disableWhileProcessing
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="name"
                                            name="name"
                                            placeholder="Contoh: Ahmad Fauzi"
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Alamat Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            required
                                            tabIndex={2}
                                            autoComplete="email"
                                            name="email"
                                            placeholder="contoh@student.unsika.ac.id"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            required
                                            tabIndex={3}
                                            autoComplete="new-password"
                                            name="password"
                                            placeholder="Minimal 8 karakter"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                        <Input
                                            id="password_confirmation"
                                            type="password"
                                            required
                                            tabIndex={4}
                                            autoComplete="new-password"
                                            name="password_confirmation"
                                            placeholder="Ulangi password"
                                        />
                                        <InputError message={errors.password_confirmation} />
                                    </div>

                                    <Button type="submit" className="w-full" tabIndex={5} data-test="register-user-button">
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                        Daftar Sebagai Aslab
                                    </Button>
                                </div>

                                <div className="text-center text-sm text-muted-foreground">
                                    Sudah punya akun?{' '}
                                    <TextLink href={login()} tabIndex={6}>
                                        Masuk di sini
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
