import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <Head title="Log in" />
            <Head title="Login - Sistem Absensi Aslab" />

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
                        <CardTitle className="text-2xl font-bold">Masuk</CardTitle>
                        <CardDescription className="mt-2">
                            Masukkan email dan password untuk mengakses sistem absensi
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Alamat Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="email"
                                            placeholder="email@student.unsika.ac.id"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password">Password</Label>
                                            {canResetPassword && (
                                                <TextLink href={request()} className="text-sm" tabIndex={5}>
                                                    Lupa password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            name="password"
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            placeholder="Password"
                                        />
                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Checkbox id="remember" name="remember" tabIndex={3} />
                                        <Label htmlFor="remember" className="text-sm">Ingat saya</Label>
                                    </div>

                                    <Button type="submit" className="w-full" tabIndex={4} disabled={processing} data-test="login-button">
                                        {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                                        Masuk
                                    </Button>
                                </div>

                                <div className="text-center text-sm text-muted-foreground">
                                    Belum punya akun?{' '}
                                    <TextLink href={register()} tabIndex={6}>
                                        Daftar di sini
                                    </TextLink>
                                </div>
                            </>
                        )}
                    </Form>
                </CardContent>
            </Card>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </div>
    );
}
