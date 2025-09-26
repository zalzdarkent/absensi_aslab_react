import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, UserCheck, UserX, Activity, Eye, Calendar, TrendingUp, RefreshCw } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { createTodayAttendanceColumns } from '@/components/tables/today-attendance-columns';

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
  today_attendances: initialAttendances,
  most_active_aslabs,
  weekly_chart_data,
  current_date
}: Props) {
  const columns = createTodayAttendanceColumns();

  // State untuk event-driven updates
  const [todayAttendances, setTodayAttendances] = useState(initialAttendances);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [rfidDetected, setRfidDetected] = useState<string | null>(null);
  const rfidIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start RFID detection untuk auto-refresh
  // Load today's attendance data
  const loadTodayAttendances = useCallback(async () => {
    setIsLoadingAttendances(true);
    try {
      const response = await fetch('/attendance-today');
      const data = await response.json();
      if (data.success) {
        setTodayAttendances(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading today attendances:', error);
    } finally {
      setIsLoadingAttendances(false);
    }
  }, []);

  // Start RFID detection untuk auto-refresh
  const startRfidDetection = useCallback(() => {
    if (rfidIntervalRef.current) {
      clearInterval(rfidIntervalRef.current);
    }

    rfidIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch('/api/rfid/last-scan');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.rfid_code && data.rfid_code !== rfidDetected) {
            setRfidDetected(data.rfid_code);
            // Auto-refresh data saat ada aktivitas RFID
            await loadTodayAttendances();
            // Clear detection setelah beberapa detik
            setTimeout(() => {
              setRfidDetected(null);
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Error detecting RFID:', error);
      }
    }, 2000); // Check setiap 2 detik
  }, [rfidDetected, loadTodayAttendances]);

  useEffect(() => {
    startRfidDetection();

    // Cleanup intervals on unmount
    return () => {
      if (rfidIntervalRef.current) {
        clearInterval(rfidIntervalRef.current);
      }
    };
  }, [startRfidDetection]);

  // Manual refresh function
  const handleManualRefresh = () => {
    loadTodayAttendances();
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
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-50">Total Aslab</CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total_aslabs}</div>
              <p className="text-xs text-blue-100">
                Aslab aktif terdaftar
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-50">Check-in Hari Ini</CardTitle>
              <UserCheck className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.today_checkins}</div>
              <p className="text-xs text-green-100">
                Aslab yang sudah datang
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-50">Check-out Hari Ini</CardTitle>
              <UserX className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.today_checkouts}</div>
              <p className="text-xs text-orange-100">
                Aslab yang sudah pulang
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-50">Sedang di Lab</CardTitle>
              <Activity className="h-4 w-4 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.active_today}</div>
              <p className="text-xs text-purple-100">
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
                  <CardTitle className="flex items-center gap-2">
                    Absensi Hari Ini
                    {isLoadingAttendances && (
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                    {rfidDetected && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span>RFID Detected</span>
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center justify-between">
                    <span>Daftar kehadiran aslab pada {current_date} </span>
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
                <DataTable
                  columns={columns}
                  data={todayAttendances}
                  searchPlaceholder="Cari nama, prodi..."
                  filename="absensi-hari-ini"
                  enableRowSelection={false}
                />
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
