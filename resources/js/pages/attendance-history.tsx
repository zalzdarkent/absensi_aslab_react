import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Clock, User, Activity, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createAttendanceHistoryColumns } from '@/components/tables/attendance-history-columns';

interface AttendanceRecord {
  id: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'late' | 'absent';
  notes: string | null;
}

interface PaginationData {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Props {
  attendances: {
    data: AttendanceRecord[];
  } & PaginationData;
  filters: {
    search: string | null;
    status: string | null;
    date: string | null;
  };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Riwayat Absensi',
    }
]

export default function AttendanceHistory({ attendances }: Props) {
  const columns = createAttendanceHistoryColumns();

  const handleExport = () => {
    // In real implementation, this would trigger CSV/Excel export
    const params = new URLSearchParams({
      export: 'true',
    });
    window.open(`/attendance-history?${params}`, '_blank');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Riwayat Absensi" />

      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Riwayat Absensi</h1>
            <p className="text-muted-foreground">
              Lihat dan kelola data riwayat absensi asisten laboratorium
            </p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Record</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendances.total}</div>
              <p className="text-xs text-muted-foreground">
                Data absensi tercatat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hadir</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {attendances.data.filter(a => a.status === 'present').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Halaman ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {attendances.data.filter(a => a.status === 'late').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Halaman ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
              <X className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {attendances.data.filter(a => a.status === 'absent').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Halaman ini
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Data Absensi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={attendances.data}
              searchPlaceholder="Cari nama, email, atau status..."
              filename="riwayat-absensi"
              enableRowSelection={false}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
