import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, UserCheck, UserX, Activity, Eye, Calendar, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { createTodayAttendanceColumns } from '@/components/tables/today-attendance-columns';
import { User as AuthUser } from '@/types';

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
  stats: initialStats,
  today_attendances: initialAttendances,
  most_active_aslabs: initialMostActiveAslabs,
  weekly_chart_data: initialWeeklyChartData,
  current_date
}: Props) {
  const columns = createTodayAttendanceColumns();
  const { auth } = usePage<{ auth: { user: AuthUser } }>().props;
  const currentUser = auth.user;

  // State untuk real-time updates
  const [stats, setStats] = useState(initialStats);
  const [todayAttendances, setTodayAttendances] = useState(initialAttendances);
  const [mostActiveAslabs, setMostActiveAslabs] = useState(initialMostActiveAslabs);
  const [weeklyChartData, setWeeklyChartData] = useState(initialWeeklyChartData);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [rfidDetected, setRfidDetected] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const rfidIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Setup real-time WebSocket connection
  useEffect(() => {
    console.log('Dashboard: Setting up WebSocket connection...');
    console.log('window.Echo available:', !!window.Echo);

    if (!window.Echo) {
      console.error('Dashboard: Echo not available on window object');
      return;
    }

    // Function to update dashboard data
    function updateDashboardData(data: unknown) {
      if (data && typeof data === 'object' && 'stats' in data) {
        const eventData = data as {
          stats: typeof initialStats;
          todayAttendances: TodayAttendance[];
          mostActiveAslabs: MostActiveAslab[];
          weeklyChartData: WeeklyChartData[];
          attendance?: { user?: { name?: string } };
        };

        console.log('Dashboard: Updating state with new data:', {
          newStats: eventData.stats,
          newAttendances: eventData.todayAttendances.length,
          newMostActive: eventData.mostActiveAslabs?.length || 0,
          mostActiveData: eventData.mostActiveAslabs
        });

        setStats(eventData.stats);
        setTodayAttendances(eventData.todayAttendances);

        // Update mostActiveAslabs dengan fallback yang aman
        if (eventData.mostActiveAslabs && Array.isArray(eventData.mostActiveAslabs)) {
          console.log('Dashboard: Updating mostActiveAslabs:', eventData.mostActiveAslabs);
          setMostActiveAslabs(eventData.mostActiveAslabs);
        } else {
          console.log('Dashboard: mostActiveAslabs not found or invalid, keeping current data');
        }

        setWeeklyChartData(eventData.weeklyChartData);
        setLastUpdate(new Date());

        // Show RFID detected indicator
        if (eventData.attendance && eventData.attendance.user?.name) {
          setRfidDetected(eventData.attendance.user.name);
          setTimeout(() => {
            setRfidDetected(null);
          }, 3000);
        }

        console.log('Dashboard: State updated successfully');
      } else {
        console.log('Dashboard: Invalid event data structure:', data);
      }
    }

    // Setup Echo connection status
    window.Echo.connector.pusher.connection.bind('connected', () => {
      setIsConnected(true);
      console.log('Dashboard: Connected to WebSocket');
    });

    window.Echo.connector.pusher.connection.bind('disconnected', () => {
      setIsConnected(false);
      console.log('Dashboard: Disconnected from WebSocket');
    });

    window.Echo.connector.pusher.connection.bind('connecting', () => {
      console.log('Dashboard: Connecting to WebSocket...');
    });

    window.Echo.connector.pusher.connection.bind('failed', () => {
      console.error('Dashboard: WebSocket connection failed');
    });

    // Listen for attendance updates
    const channel = window.Echo.channel('dashboard');

    console.log('Dashboard: Listening to dashboard channel');
    console.log('Dashboard: Channel object:', channel);

    // Test dengan multiple event listeners
    channel.listen('attendance.updated', (data: unknown) => {
      console.log('Dashboard: Received attendance.updated event:', data);
      updateDashboardData(data);
    });

    // Listen untuk semua kemungkinan variasi event name
    channel.listen('.attendance.updated', (data: unknown) => {
      console.log('Dashboard: Received .attendance.updated event (with dot):', data);
      updateDashboardData(data);
    });

    channel.listen('AttendanceUpdated', (data: unknown) => {
      console.log('Dashboard: Received AttendanceUpdated event (class name):', data);
      updateDashboardData(data);
    });

    // Cleanup on unmount
    return () => {
      console.log('Dashboard: Cleaning up WebSocket listeners');
      channel.stopListening('attendance.updated');
      channel.stopListening('.attendance.updated');
      channel.stopListening('AttendanceUpdated');
      window.Echo.leaveChannel('dashboard');
    };
  }, [initialMostActiveAslabs]);

  // Remove RFID polling - not needed anymore with real-time updates
  useEffect(() => {
    // Cleanup any existing intervals
    const currentInterval = rfidIntervalRef.current;
    return () => {
      if (currentInterval) {
        clearInterval(currentInterval);
      }
    };
  }, []);

  // Chart configuration dengan tema amber
  const chartConfig = {
    count: {
      label: "Kehadiran",
      color: "#f59e0b", // Amber-500 yang lebih modern
    },
  };

  // Format data untuk bar chart
  const chartData = weeklyChartData.map((item: WeeklyChartData) => ({
    date: item.date,
    count: item.count,
  }));

  // Hitung statistik
  const maxAttendance = Math.max(...weeklyChartData.map((d: WeeklyChartData) => d.count));
  const avgAttendance = Math.round(weeklyChartData.reduce((sum: number, d: WeeklyChartData) => sum + d.count, 0) / weeklyChartData.length);

  // Debug: Log current state values
  console.log('Dashboard render - Current stats:', stats);
  console.log('Dashboard render - Current attendances count:', todayAttendances.length);
  console.log('Dashboard render - Current mostActiveAslabs:', mostActiveAslabs);

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
                    {rfidDetected && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span>RFID: {rfidDetected}</span>
                      </div>
                    )}
                    {isConnected && (
                      <div className="flex items-center gap-1 text-green-600 text-xs">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Real-time</span>
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
                  {mostActiveAslabs.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Belum ada data
                    </p>
                  ) : (
                    mostActiveAslabs.map((aslab: MostActiveAslab, index: number) => (
                      <div key={`${aslab.name}-${aslab.total_attendance}-${lastUpdate.getTime()}`} className="flex items-center justify-between">
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

        {/* Quick Actions - Only visible for admin */}
        {currentUser.role === 'admin' && (
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
        )}
      </div>
    </AppLayout>
  );
}
