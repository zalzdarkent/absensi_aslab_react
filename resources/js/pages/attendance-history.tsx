import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, User, Activity, X } from 'lucide-react';
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
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-50">Total Record</CardTitle>
              <Activity className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{attendances.total}</div>
              <p className="text-xs text-blue-100">
                Data absensi tercatat
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-50">Hadir</CardTitle>
              <User className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {attendances.data.filter(a => a.status === 'present').length}
              </div>
              <p className="text-xs text-green-100">
                Halaman ini
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-50">Terlambat</CardTitle>
              <Clock className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {attendances.data.filter(a => a.status === 'late').length}
              </div>
              <p className="text-xs text-orange-100">
                Halaman ini
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-50">Tidak Hadir</CardTitle>
              <X className="h-4 w-4 text-red-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {attendances.data.filter(a => a.status === 'absent').length}
              </div>
              <p className="text-xs text-red-100">
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
