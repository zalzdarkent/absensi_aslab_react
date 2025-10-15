import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, Users, UserCheck, UserX } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { PageTransition } from '@/components/ui/loading-animations';

interface User {
  id: number;
  name: string;
  prodi: string;
  semester: number;
}

interface DayDetailAttendance {
  user: User;
  check_in: string | null;
  check_out: string | null;
  status: string;
  date: string;
}

interface Props {
  date: string;
  attendances: DayDetailAttendance[];
  total: number;
}

export default function DayDetail({ date, attendances, total }: Props) {
  // Format tanggal untuk tampilan
  const formatDate = (dateStr: string) => {
    try {
      // Jika format d/m, tambahkan tahun
      if (dateStr.includes('/')) {
        const [day, month] = dateStr.split('/');
        const currentYear = new Date().getFullYear();
        const fullDate = new Date(currentYear, parseInt(month) - 1, parseInt(day));
        return fullDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        // Jika format Y-m-d
        const fullDate = new Date(dateStr);
        return fullDate.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch {
      return dateStr;
    }
  };

  // Kolom untuk tabel detail hari
  const dayDetailColumns = [
    {
      accessorKey: "user.name",
      header: "Nama",
      cell: ({ row }: { row: { original: DayDetailAttendance } }) => (
        <div className="font-medium">{row.original.user.name}</div>
      ),
    },
    {
      accessorKey: "user.prodi",
      header: "Prodi",
      cell: ({ row }: { row: { original: DayDetailAttendance } }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.user.prodi}
        </div>
      ),
    },
    {
      accessorKey: "user.semester",
      header: "Semester",
      cell: ({ row }: { row: { original: DayDetailAttendance } }) => (
        <div className="text-sm">{row.original.user.semester}</div>
      ),
    },
    {
      accessorKey: "check_in",
      header: "Check In",
      cell: ({ row }: { row: { original: DayDetailAttendance } }) => (
        <div className="text-sm">
          {row.original.check_in
            ? new Date(row.original.check_in).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })
            : '-'
          }
        </div>
      ),
    },
    {
      accessorKey: "check_out",
      header: "Check Out",
      cell: ({ row }: { row: { original: DayDetailAttendance } }) => (
        <div className="text-sm">
          {row.original.check_out
            ? new Date(row.original.check_out).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              })
            : '-'
          }
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: DayDetailAttendance } }) => {
        const status = row.original.status;
        const statusConfig = {
          present: { label: 'Hadir', className: 'bg-green-100 text-green-800' },
          partial: { label: 'Sebagian', className: 'bg-yellow-100 text-yellow-800' },
          absent: { label: 'Tidak Hadir', className: 'bg-red-100 text-red-800' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.absent;

        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
  ];

  // Statistik untuk kartu
  const presentCount = attendances.filter(a => a.status === 'present').length;
  const partialCount = attendances.filter(a => a.status === 'partial').length;
  const absentCount = attendances.filter(a => a.status === 'absent').length;

  return (
    <AppLayout>
      <Head title={`Detail Absensi - ${formatDate(date)}`} />

      <PageTransition>
        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Dashboard
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Detail Absensi
              </h1>
              <p className="text-muted-foreground">
                Data lengkap kehadiran aslab pada {formatDate(date)}
              </p>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Kehadiran</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{total}</div>
                <p className="text-xs text-muted-foreground">
                  aslab tercatat
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hadir Lengkap</CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
                <p className="text-xs text-muted-foreground">
                  check-in & check-out
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hadir Sebagian</CardTitle>
                <UserCheck className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
                <p className="text-xs text-muted-foreground">
                  check-in atau check-out saja
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tidak Hadir</CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
                <p className="text-xs text-muted-foreground">
                  tidak ada record
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detail Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Kehadiran</CardTitle>
            </CardHeader>
            <CardContent>
              {attendances.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Tidak ada data absensi pada tanggal ini
                    </p>
                  </div>
                </div>
              ) : (
                <DataTable
                  columns={dayDetailColumns}
                  data={attendances}
                  searchPlaceholder="Cari nama aslab..."
                  filename={`absensi-${date.replace(/\//g, '-')}`}
                  enableRowSelection={false}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
