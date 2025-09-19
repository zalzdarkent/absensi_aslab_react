import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Clock, Activity } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { createRecentAttendanceColumns } from '@/components/tables/recent-attendance-columns';

interface User {
  id: number;
  name: string;
  email: string;
  rfid_code: string;
  prodi: string;
  semester: number;
  is_active: boolean;
}

interface Attendance {
  id: number;
  type: 'check_in' | 'check_out';
  timestamp: string;
  date: string;
  notes?: string;
}

interface Props {
  aslab: User;
  stats: {
    total_days: number;
    this_month: number;
  };
  recent_attendances: Attendance[];
}

export default function AslabsShow({ aslab, stats, recent_attendances }: Props) {
  const columns = createRecentAttendanceColumns();

  return (
    <AppLayout>
      <Head title={`Detail ${aslab.name}`} />

      <div className="space-y-6 pt-4">
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="w-fit">
            <Link href="/aslabs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{aslab.name}</h1>
              <p className="text-muted-foreground mt-2">
                Detail informasi asisten laboratorium
              </p>
            </div>
            <Button asChild>
              <Link href={`/aslabs/${aslab.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Profile</CardTitle>
                <CardDescription>
                  Data personal dan akademik aslab
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Nama Lengkap</Label>
                      <p className="text-lg font-medium">{aslab.name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <p className="text-lg">{aslab.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Program Studi</Label>
                      <p className="text-lg">{aslab.prodi}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <p className="text-lg">Semester {aslab.semester}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Kode RFID</Label>
                      {aslab.rfid_code ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-base px-3 py-1">
                          {aslab.rfid_code}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          Belum terdaftar
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div>
                        <Badge variant={aslab.is_active ? 'default' : 'secondary'} className="text-base px-3 py-1">
                          {aslab.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Statistik Absensi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{stats.total_days}</div>
                  <p className="text-sm text-muted-foreground">Total Hari Hadir</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{stats.this_month}</div>
                  <p className="text-sm text-muted-foreground">Hadir Bulan Ini</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Riwayat Absensi Terbaru
            </CardTitle>
            <CardDescription>
              Daftar absensi terbaru dalam bulan ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recent_attendances}
              searchPlaceholder="Cari tanggal atau tipe absensi..."
              filename="riwayat-absensi-aslab"
              enableRowSelection={false}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// Helper component for labels
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-medium text-muted-foreground">
      {children}
    </span>
  );
}
