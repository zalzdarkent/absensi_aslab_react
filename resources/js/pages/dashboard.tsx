import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, UserCheck, UserX, Activity, Eye, Calendar, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import AppLayout from '@/layouts/app-layout';

interface User {
  id: number;
  name: string;
  prodi: string;
  semester: number;
}

interface TodayAttendance {
  user: User;
  check_in: string | null;
  check_out: string | null;
  status: string;
}

interface MostActiveAslab {
  name: string;
  prodi: string;
  semester: number;
  total_attendance: number;
}

interface WeeklyChartData {
  date: string;
  count: number;
}

interface Props {
  stats: {
    total_aslabs: number;
    today_checkins: number;
    today_checkouts: number;
    active_today: number;
  };
  today_attendances: TodayAttendance[];
  most_active_aslabs: MostActiveAslab[];
  weekly_chart_data: WeeklyChartData[];
  current_date: string;
}

export default function Dashboard({
  stats,
  today_attendances,
  most_active_aslabs,
  weekly_chart_data,
  current_date
}: Props) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sedang di Lab':
        return <Badge variant="default">Di Lab</Badge>;
      case 'Sudah Pulang':
        return <Badge variant="secondary">Pulang</Badge>;
      default:
        return <Badge variant="outline">Belum Datang</Badge>;
    }
  };

  // Chart configuration dengan tema amber
  const chartConfig = {
    count: {
      label: "Kehadiran",
      color: "#f59e0b", // Amber-500 yang lebih modern
    },
  };

  // Format data untuk bar chart
  const chartData = weekly_chart_data.map(item => ({
    date: item.date,
    count: item.count,
  }));

  // Hitung statistik
  const maxAttendance = Math.max(...weekly_chart_data.map(d => d.count));
  const avgAttendance = Math.round(weekly_chart_data.reduce((sum, d) => sum + d.count, 0) / weekly_chart_data.length);

  return (
    <AppLayout>
      <Head title="Dashboard" />

      <div className="space-y-6 py-4">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Selamat datang di sistem absensi aslab - {current_date}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aslab</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_aslabs}</div>
              <p className="text-xs text-muted-foreground">
                Aslab aktif terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-in Hari Ini</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today_checkins}</div>
              <p className="text-xs text-muted-foreground">
                Aslab yang sudah datang
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-out Hari Ini</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today_checkouts}</div>
              <p className="text-xs text-muted-foreground">
                Aslab yang sudah pulang
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sedang di Lab</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_today}</div>
              <p className="text-xs text-muted-foreground">
                Aslab yang sedang aktif
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Attendance */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Absensi Hari Ini</CardTitle>
                  <CardDescription>
                    Daftar kehadiran aslab pada {current_date}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/attendance-history">
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Semua
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Nama</th>
                        <th className="text-left p-2 font-medium">Prodi</th>
                        <th className="text-left p-2 font-medium">Check-in</th>
                        <th className="text-left p-2 font-medium">Check-out</th>
                        <th className="text-left p-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {today_attendances.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-8 text-muted-foreground">
                            Belum ada absensi hari ini
                          </td>
                        </tr>
                      ) : (
                        today_attendances.slice(0, 10).map((attendance, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-2">
                              <div className="font-medium">{attendance.user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Sem {attendance.user.semester}
                              </div>
                            </td>
                            <td className="p-2 text-sm">{attendance.user.prodi}</td>
                            <td className="p-2">
                              {attendance.check_in ? (
                                <span className="text-sm">{attendance.check_in}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              {attendance.check_out ? (
                                <span className="text-sm">{attendance.check_out}</span>
                              ) : (
                                <span className="text-sm text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              {getStatusBadge(attendance.status)}
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

          {/* Most Active Aslabs */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Aslab Teraktif Bulan Ini</CardTitle>
                <CardDescription>
                  10 aslab dengan kehadiran terbanyak
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {most_active_aslabs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Belum ada data
                    </p>
                  ) : (
                    most_active_aslabs.map((aslab, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">{aslab.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {aslab.prodi} • Sem {aslab.semester}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{aslab.total_attendance}</div>
                          <div className="text-xs text-muted-foreground">hari</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Weekly Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Grafik Kehadiran 7 Hari Terakhir
            </CardTitle>
            <CardDescription className="flex items-center justify-between">
              <span>Pola kehadiran aslab dalam seminggu terakhir</span>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>Rata-rata: {avgAttendance}/hari</span>
                </div>
                <div className="text-blue-600">
                  <span>Puncak: {maxAttendance} orang</span>
                </div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-auto h-[200px] w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                margin={{
                  right: 12,
                  left: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickCount={5}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  className="hover:opacity-80 transition-opacity"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button asChild variant="outline" className="h-16">
            <Link href="/aslabs">
              <div className="text-center">
                <Users className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Kelola Aslab</div>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-16">
            <Link href="/attendance-scan">
              <div className="text-center">
                <UserCheck className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Scan Absensi</div>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-16">
            <Link href="/attendance-history">
              <div className="text-center">
                <Activity className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm font-medium">Riwayat Absensi</div>
              </div>
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
