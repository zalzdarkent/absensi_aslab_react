import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createAslabColumns } from '@/components/tables/aslab-columns';

interface User {
  id: number;
  name: string;
  email: string;
  rfid_code: string | null;
  prodi: string;
  semester: number;
  is_active: boolean;
}

interface Props {
  aslabs: User[];
  prodis: string[];
  filters: {
    search: string | null;
    prodi: string | null;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Kelola Aslab',
    },
];

export default function AslabsIndex({ aslabs }: Pick<Props, 'aslabs'>) {
  const [selectedRows, setSelectedRows] = useState<User[]>([]);
  const columns = createAslabColumns();

  const handleBulkAction = (action: string) => {
    if (selectedRows.length === 0) {
      alert('Pilih minimal satu aslab terlebih dahulu');
      return;
    }

    switch (action) {
      case 'activate':
        if (confirm(`Aktifkan ${selectedRows.length} aslab yang dipilih?`)) {
          // Implementation for bulk activate
          selectedRows.forEach(aslab => {
            if (!aslab.is_active) {
              router.patch(`/aslabs/${aslab.id}/toggle-status`, {}, {
                preserveScroll: true,
              });
            }
          });
        }
        break;
      case 'deactivate':
        if (confirm(`Nonaktifkan ${selectedRows.length} aslab yang dipilih?`)) {
          // Implementation for bulk deactivate
          selectedRows.forEach(aslab => {
            if (aslab.is_active) {
              router.patch(`/aslabs/${aslab.id}/toggle-status`, {}, {
                preserveScroll: true,
              });
            }
          });
        }
        break;
      case 'delete':
        if (confirm(`Hapus ${selectedRows.length} aslab yang dipilih? Tindakan ini tidak dapat dibatalkan.`)) {
          // Implementation for bulk delete
          selectedRows.forEach(aslab => {
            router.delete(`/aslabs/${aslab.id}`, {
              preserveScroll: true,
            });
          });
        }
        break;
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Kelola Aslab" />

      <div className="space-y-6 pt-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kelola Aslab</h1>
            <p className="text-muted-foreground">
              Kelola data asisten laboratorium yang terdaftar di sistem
            </p>
          </div>
          <Button asChild>
            <Link href="/aslabs/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Aslab
            </Link>
          </Button>
        </div>

        {/* Bulk Actions */}
        {selectedRows.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedRows.length} aslab dipilih
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                >
                  Aktifkan Semua
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Nonaktifkan Semua
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBulkAction('delete')}
                >
                  Hapus Semua
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Aslab</CardTitle>
            <CardDescription>
              Kelola data asisten laboratorium dengan fitur pencarian, filter, dan export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={aslabs}
              searchPlaceholder="Cari nama, email, atau RFID..."
              filename="daftar-aslab"
              enableRowSelection={true}
              onRowSelectionChange={setSelectedRows}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
