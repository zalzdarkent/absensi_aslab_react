import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Calendar, Clock, Activity } from 'lucide-react';
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
  return (
    <AppLayout>
      <Head title={`Detail ${aslab.name}`} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/aslabs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{aslab.name}</h1>
              <p className="text-muted-foreground">
                Detail informasi asisten laboratorium
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/aslabs/${aslab.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
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
                  <div className="space-y-4">
                    <div>
                      <Label>Nama Lengkap</Label>
                      <p className="text-lg font-medium">{aslab.name}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-lg">{aslab.email}</p>
                    </div>
                    <div>
                      <Label>Program Studi</Label>
                      <p className="text-lg">{aslab.prodi}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Semester</Label>
                      <p className="text-lg">Semester {aslab.semester}</p>
                    </div>
                    <div>
                      <Label>Kode RFID</Label>
                      {aslab.rfid_code ? (
                        <code className="bg-muted px-3 py-1 rounded text-lg">
                          {aslab.rfid_code}
                        </code>
                      ) : (
                        <p className="text-muted-foreground">Belum terdaftar</p>
                      )}
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">
                        <Badge variant={aslab.is_active ? 'default' : 'secondary'} className="text-sm">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Tanggal</th>
                    <th className="text-left p-4 font-medium">Tipe</th>
                    <th className="text-left p-4 font-medium">Waktu</th>
                    <th className="text-left p-4 font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_attendances.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-8 text-muted-foreground">
                        Belum ada data absensi
                      </td>
                    </tr>
                  ) : (
                    recent_attendances.map((attendance) => (
                      <tr key={attendance.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(attendance.date).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant={attendance.type === 'check_in' ? 'default' : 'secondary'}>
                            {attendance.type === 'check_in' ? 'Check In' : 'Check Out'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {new Date(attendance.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {attendance.notes || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
