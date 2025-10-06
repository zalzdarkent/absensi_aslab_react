import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import { send } from '@/routes/verification';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
    },
];

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your account information and settings" />

                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>
                                Update your personal details and account preferences below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form
                                {...ProfileController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                className="space-y-6"
                            >
                                {({ processing, recentlySuccessful, errors }) => (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input
                                                    id="name"
                                                    className="mt-1 block w-full"
                                                    defaultValue={auth.user.name}
                                                    name="name"
                                                    required
                                                    autoComplete="name"
                                                    placeholder="Enter your full name"
                                                />
                                                <InputError className="mt-2" message={errors.name} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    className="mt-1 block w-full"
                                                    defaultValue={auth.user.email}
                                                    name="email"
                                                    required
                                                    autoComplete="username"
                                                    placeholder="Enter your email address"
                                                />
                                                <InputError className="mt-2" message={errors.email} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="rfid_code">RFID Code</Label>
                                                <Input
                                                    id="rfid_code"
                                                    className="mt-1 block w-full"
                                                    defaultValue={auth.user.rfid_code || ''}
                                                    name="rfid_code"
                                                    placeholder="Enter RFID code"
                                                />
                                                <InputError className="mt-2" message={errors.rfid_code} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="prodi">Program Studi</Label>
                                                <Input
                                                    id="prodi"
                                                    className="mt-1 block w-full"
                                                    defaultValue={auth.user.prodi || ''}
                                                    name="prodi"
                                                    placeholder="e.g., Teknik Informatika"
                                                />
                                                <InputError className="mt-2" message={errors.prodi} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="grid gap-2">
                                                <Label htmlFor="semester">Semester</Label>
                                                <Input
                                                    id="semester"
                                                    type="number"
                                                    min="1"
                                                    max="14"
                                                    className="mt-1 block w-full"
                                                    defaultValue={auth.user.semester || ''}
                                                    name="semester"
                                                    placeholder="e.g., 5"
                                                />
                                                <InputError className="mt-2" message={errors.semester} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="role">Role</Label>
                                                <Input
                                                    id="role"
                                                    className="mt-1 block w-full bg-muted"
                                                    value={auth.user.role === 'admin' ? 'Admin' :
                                                           auth.user.role === 'aslab' ? 'Asisten Laboratorium' :
                                                           auth.user.role === 'mahasiswa' ? 'Mahasiswa' : 'Dosen'}
                                                    readOnly
                                                    disabled
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Role diatur oleh administrator
                                                </p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="piket_day">Hari Piket</Label>
                                                <Input
                                                    id="piket_day"
                                                    className="mt-1 block w-full bg-muted"
                                                    value={auth.user.piket_day ?
                                                           auth.user.piket_day.charAt(0).toUpperCase() + auth.user.piket_day.slice(1) :
                                                           'Tidak ada'}
                                                    readOnly
                                                    disabled
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Hari piket diatur oleh administrator
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <div className="flex items-center space-x-3">
                                                <div className={`h-4 w-4 rounded-full ${auth.user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <Label className="text-sm font-medium">
                                                    Status Akun: {auth.user.is_active ? 'Aktif' : 'Tidak Aktif'}
                                                </Label>
                                            </div>
                                            <p className="text-xs text-muted-foreground ml-7">
                                                Status akun diatur oleh administrator
                                            </p>
                                        </div>

                                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <p className="text-sm text-yellow-800">
                                                    Your email address is unverified.{' '}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="text-yellow-900 underline decoration-yellow-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current font-medium"
                                                    >
                                                        Click here to resend the verification email.
                                                    </Link>
                                                </p>

                                                {status === 'verification-link-sent' && (
                                                    <div className="mt-2 text-sm font-medium text-green-600">
                                                        A new verification link has been sent to your email address.
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t">
                                            <div className="flex items-center gap-4">
                                                <Button disabled={processing} data-test="update-profile-button">
                                                    {processing ? 'Saving...' : 'Save Changes'}
                                                </Button>

                                                <Transition
                                                    show={recentlySuccessful}
                                                    enter="transition ease-in-out"
                                                    enterFrom="opacity-0"
                                                    leave="transition ease-in-out"
                                                    leaveTo="opacity-0"
                                                >
                                                    <p className="text-sm text-green-600 font-medium">Profile updated successfully!</p>
                                                </Transition>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
