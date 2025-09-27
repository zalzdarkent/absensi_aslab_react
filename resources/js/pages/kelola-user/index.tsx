import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createUserColumns } from '@/components/tables/user-columns';

interface User {
    id: number;
    name: string;
    email: string;
    rfid_code: string | null;
    prodi: string | null;
    semester: number | null;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface Props {
    users: User[];
    roles: string[];
    filters: {
        search: string | null;
        role: string | null;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelola User',
    },
];

export default function KelolaUserIndex({ users }: Pick<Props, 'users'>) {
    const columns = createUserColumns();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola User" />

            <div className="space-y-6 pt-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Kelola User</h1>
                        <p className="text-muted-foreground">
                            Kelola semua user dalam sistem
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/kelola-user/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah User
                        </Link>
                    </Button>
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar User</CardTitle>
                        <CardDescription>
                            Total {users.length} user terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            data={users}
                            columns={columns}
                            searchPlaceholder="Cari user..."
                            filename="daftar-user"
                        />
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
