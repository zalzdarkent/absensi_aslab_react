import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Users, UserCheck, UserX, Activity, Eye, Calendar, TrendingUp, Filter, RefreshCcw } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import AppLayout from '@/layouts/app-layout';
import { DataTable } from '@/components/ui/data-table';
import { createTodayAttendanceColumns } from '@/components/tables/today-attendance-columns';
import { User as AuthUser } from '@/types';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { PageTransition } from '@/components/ui/loading-animations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

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
  date: string;
}

interface MostActiveAslab {
  name: string;
  prodi: string;
  semester: number;
  total_attendance: number;
}

interface WeeklyChartData {
  date: string;
  full_date: string;
  count: number;
}

interface DayDetailAttendance {
  user: User;
  check_in: string | null;
  check_out: string | null;
  status: string;
  date: string;
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
  filters: {
    start_date: string | null;
    end_date: string | null;
    period: string;
  };
  day_detail_data?: DayDetailAttendance[];
}

export default function Dashboard({
  stats: initialStats,
  today_attendances: initialAttendances,
  most_active_aslabs: initialMostActiveAslabs,
  weekly_chart_data: initialWeeklyChartData,
  current_date,
  filters,
  day_detail_data
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

  // State untuk filter
  const [period, setPeriod] = useState(filters?.period || 'today');
  const [customStartDate, setCustomStartDate] = useState(filters?.start_date || format(new Date(), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(filters?.end_date || format(new Date(), 'yyyy-MM-dd'));

  // Update state when props change (Inertia navigation)
  useEffect(() => {
    setStats(initialStats);
    setTodayAttendances(initialAttendances);
    setMostActiveAslabs(initialMostActiveAslabs);
    setWeeklyChartData(initialWeeklyChartData);
    if (day_detail_data) {
      setDayDetailData(day_detail_data);
    }
  }, [initialStats, initialAttendances, initialMostActiveAslabs, initialWeeklyChartData, day_detail_data]);

  const handlePeriodChange = (value: string) => {
    setPeriod(value);

    let start = new Date();
    let end = new Date();

    switch (value) {
      case 'today':
        // Default today
        break;
      case 'yesterday':
        start = subDays(new Date(), 1);
        end = subDays(new Date(), 1);
        break;
      case 'this_week':
        start = startOfWeek(new Date(), { weekStartsOn: 1 });
        end = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case 'last_week':
        start = startOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        end = endOfWeek(subDays(new Date(), 7), { weekStartsOn: 1 });
        break;
      case 'this_month':
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case 'last_month':
        start = startOfMonth(subDays(startOfMonth(new Date()), 1));
        end = endOfMonth(subDays(startOfMonth(new Date()), 1));
        break;
      case 'this_year':
        start = startOfYear(new Date());
        end = endOfYear(new Date());
        break;
      case 'custom':
        return; // Don't navigate yet
    }

    if (value !== 'custom') {
      router.post('/dashboard', {
        period: value,
        start_date: format(start, 'yyyy-MM-dd'),
        end_date: format(end, 'yyyy-MM-dd')
      }, {
        preserveState: true,
        preserveScroll: true,
      });
    }
  };

  const handleApplyCustomFilter = () => {
    router.post('/dashboard', {
      period: 'custom',
      start_date: customStartDate,
      end_date: customEndDate
    }, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Helper to get period label
  const getPeriodLabel = () => {
    if (period === 'today') return 'Hari Ini';
    if (period === 'yesterday') return 'Kemarin';
    if (period === 'this_week') return 'Minggu Ini';
    if (period === 'last_week') return 'Minggu Lalu';
    if (period === 'this_month') return 'Bulan Ini';
    if (period === 'last_month') return 'Bulan Lalu';
    if (period === 'this_year') return 'Tahun Ini';
    if (period === 'custom') {
      return `${format(parseISO(customStartDate), 'dd MMM yyyy')} - ${format(parseISO(customEndDate), 'dd MMM yyyy')}`;
    }
    return '';
  };

  // State untuk modal detail hari
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dayDetailData, setDayDetailData] = useState<DayDetailAttendance[]>([]);
  const [isLoadingDayDetail, setIsLoadingDayDetail] = useState(false);

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

    // The event broadcastAs is 'attendance.updated'
    // In Echo, if there is a dot prefix, it listens for the exact event name
    const eventName = '.attendance.updated';

    channel.listen(eventName, (data: unknown) => {
      console.log('Dashboard: 🔥 EVENT RECEIVED!', eventName, data);
      updateDashboardData(data);
    });

    // Fallback for class name if broadcastAs fails for some reason
    channel.listen('AttendanceUpdated', (data: unknown) => {
      console.log('Dashboard: 🔥 EVENT RECEIVED (Fallback)!', 'AttendanceUpdated', data);
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

  // Fungsi untuk handle klik pada bar chart
  const handleBarClick = (_data: unknown, index: number) => {
    if (index >= 0 && index < chartData.length) {
      const clickedDate = chartData[index].full_date;
      // const displayDate = chartData[index].date;
      setSelectedDate(clickedDate);
      setIsLoadingDayDetail(true);

      router.post('/dashboard', {
        period: period,
        start_date: customStartDate,
        end_date: customEndDate,
        detail_date: clickedDate
      }, {
        preserveState: true,
        preserveScroll: true,
        only: ['day_detail_data'],
        onSuccess: () => {
          setIsModalOpen(true);
          setIsLoadingDayDetail(false);
        },
        onError: () => {
          setIsLoadingDayDetail(false);
        }
      });
    }
  };

  // Fungsi untuk close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate('');
    setDayDetailData([]);
  };

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
    full_date: item.full_date,
    count: item.count,
  }));

  // Hitung statistik
  const maxAttendance = Math.max(...weeklyChartData.map((d: WeeklyChartData) => d.count));
  const avgAttendance = Math.round(weeklyChartData.reduce((sum: number, d: WeeklyChartData) => sum + d.count, 0) / weeklyChartData.length);

  // Debug: Log current state values
  console.log('Dashboard render - Current stats:', stats);
  console.log('Dashboard render - Current attendances count:', todayAttendances.length);
  console.log('Dashboard render - Current mostActiveAslabs:', mostActiveAslabs);

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

  // Format tanggal untuk modal
  const formatModalDate = (dateStr: string) => {
    try {
      if (!dateStr) return '';

      // Jika format Y-m-d
      if (dateStr.includes('-')) {
        return format(parseISO(dateStr), 'EEEE, dd MMMM yyyy', { locale: id });
      }

      // Fallback untuk format d/m
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
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Cek apakah user adalah admin atau aslab
  const isAdminOrAslab = currentUser.role === 'admin' || currentUser.role === 'aslab';

  // Dashboard untuk Mahasiswa dan Dosen
  if (!isAdminOrAslab) {
    return (
      <AppLayout>
        <Head title="Dashboard" />

        <PageTransition>
          <div className="space-y-8 py-6">
            {/* Hero Section with Gradient Background */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg">
                    <Users className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                      Selamat Datang, {currentUser.name}! 👋
                    </h1>
                    <p className="text-white/90 font-medium mt-1">
                      {current_date}
                    </p>
                  </div>
                </div>
                <p className="text-white/80 text-lg mt-4 max-w-2xl">
                  {currentUser.role === 'mahasiswa'
                    ? 'Kelola peminjaman barang dan akses layanan laboratorium dengan mudah.'
                    : 'Akses sistem manajemen laboratorium dan pantau aktivitas akademik.'}
                </p>
              </div>
              {/* Decorative circles */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -left-5 -bottom-5 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Enhanced Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile Info Card */}
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 shadow-md">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-emerald-900 dark:text-emerald-100">Informasi Pribadi</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Nama Lengkap</p>
                      <p className="font-semibold text-sm">{currentUser.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                      <p className="font-semibold text-sm truncate">{currentUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Info Card */}
              {(currentUser.prodi || currentUser.semester) && (
                <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-md">
                      <Activity className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-100">Info Akademik</h3>
                    <div className="space-y-2">
                      {currentUser.prodi && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Program Studi</p>
                          <p className="font-semibold text-sm">{currentUser.prodi}</p>
                        </div>
                      )}
                      {currentUser.semester && (
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Semester</p>
                          <p className="font-semibold text-sm">Semester {currentUser.semester}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Role Badge Card */}
              <div className="group relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-4 shadow-md">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 text-amber-900 dark:text-amber-100">Status Akun</h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Role</p>
                      <div className="mt-1">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                          {currentUser.role === 'mahasiswa' ? '🎓 Mahasiswa' : '👨‍🏫 Dosen'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="font-semibold text-sm text-green-600 dark:text-green-400">Aktif</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Redesigned */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h2 className="text-2xl font-bold">Menu Utama</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Peminjaman Barang */}
                <Link href="/peminjaman-barang" className="group">
                  <div className="relative overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-br from-violet-500 to-purple-600 p-[2px] hover:border-violet-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                    <div className="relative bg-background rounded-lg p-6 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                          <Activity className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-2 group-hover:text-violet-600 transition-colors">
                          Peminjaman Barang
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Ajukan peminjaman atau lihat riwayat peminjaman barang laboratorium
                        </p>
                        <div className="mt-4 flex items-center text-violet-600 font-medium text-sm group-hover:gap-2 transition-all">
                          <span>Akses Sekarang</span>
                          <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Profil Saya */}
                <Link href="/settings/profile" className="group">
                  <div className="relative overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-br from-blue-500 to-cyan-600 p-[2px] hover:border-blue-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                    <div className="relative bg-background rounded-lg p-6 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                          <Users className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors">
                          Profil Saya
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Lihat dan perbarui informasi profil serta data pribadi Anda
                        </p>
                        <div className="mt-4 flex items-center text-blue-600 font-medium text-sm group-hover:gap-2 transition-all">
                          <span>Lihat Profil</span>
                          <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Pengaturan */}
                <Link href="/settings" className="group">
                  <div className="relative overflow-hidden rounded-xl border-2 border-transparent bg-gradient-to-br from-pink-500 to-rose-600 p-[2px] hover:border-pink-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
                    <div className="relative bg-background rounded-lg p-6 h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                      <div className="relative z-10">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                          <Activity className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="font-bold text-xl mb-2 group-hover:text-pink-600 transition-colors">
                          Pengaturan
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Kelola pengaturan akun dan preferensi sistem Anda
                        </p>
                        <div className="mt-4 flex items-center text-pink-600 font-medium text-sm group-hover:gap-2 transition-all">
                          <span>Buka Pengaturan</span>
                          <span className="ml-1 group-hover:ml-2 transition-all">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Info Banner */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 p-6 shadow-md">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg4ODgiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Sistem Absensi Asisten Laboratorium & Manajemen Inventaris
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Platform terpadu untuk mengelola absensi asisten laboratorium dan inventaris barang.
                    Untuk bantuan atau informasi lebih lanjut, silakan hubungi administrator sistem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </PageTransition>
      </AppLayout>
    );
  }

  // Dashboard untuk Admin dan Aslab (tampilan lengkap)
  return (
    <AppLayout>
      <Head title="Dashboard" />

      <PageTransition>

        <div className="space-y-6 py-4">
          {/* Header with Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Selamat datang di sistem absensi aslab - {current_date}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 bg-background border rounded-md px-3 py-1">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={period} onValueChange={handlePeriodChange}>
                  <SelectTrigger className="w-[150px] border-0 focus:ring-0 h-8">
                    <SelectValue placeholder="Pilih Periode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Hari Ini</SelectItem>
                    <SelectItem value="yesterday">Kemarin</SelectItem>
                    <SelectItem value="this_week">Minggu Ini</SelectItem>
                    <SelectItem value="last_week">Minggu Lalu</SelectItem>
                    <SelectItem value="this_month">Bulan Ini</SelectItem>
                    <SelectItem value="last_month">Bulan Lalu</SelectItem>
                    <SelectItem value="this_year">Tahun Ini</SelectItem>
                    <SelectItem value="custom">Rentang Tanggal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {period === 'custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-10 w-[150px]"
                  />
                  <span className="text-muted-foreground">s/d</span>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-10 w-[150px]"
                  />
                  <Button size="sm" onClick={handleApplyCustomFilter}>
                    Terapkan
                  </Button>
                </div>
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={() => router.post('/dashboard', {
                  period: period,
                  start_date: customStartDate,
                  end_date: customEndDate
                }, { preserveState: true, preserveScroll: true })}
              >
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Statistics Cards with Enhanced Design */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <EnhancedCard
              title="Total Aslab"
              value={stats.total_aslabs}
              description="Aslab aktif terdaftar"
              icon={Users}
              gradient="gradient-primary"
              className="fade-in"
            />

            <EnhancedCard
              title={`Check-in ${getPeriodLabel()}`}
              value={stats.today_checkins}
              description="Aslab yang sudah datang"
              icon={UserCheck}
              gradient="gradient-success"
              className="fade-in fade-in-delay-1"
            />

            <EnhancedCard
              title={`Check-out ${getPeriodLabel()}`}
              value={stats.today_checkouts}
              description="Aslab yang sudah pulang"
              icon={UserX}
              gradient="gradient-warning"
              className="fade-in fade-in-delay-2"
            />

            <EnhancedCard
              title="Sedang di Lab"
              value={stats.active_today}
              description="Aslab yang sedang aktif"
              icon={Activity}
              gradient="gradient-elegant"
              className="fade-in fade-in-delay-3"
            >
              <div className="flex items-center gap-1 mt-2">
                <div className="w-2 h-2 rounded-full bg-green-400 pulse-soft"></div>
                <span className="text-xs opacity-80">Live Status</span>
              </div>
            </EnhancedCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Attendance */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Absensi {getPeriodLabel()}
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
                      <span>Daftar kehadiran aslab pada periode {getPeriodLabel()} </span>
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
                    filename={`absensi-${getPeriodLabel().replace(/\s+/g, '-')}`}
                    enableRowSelection={false}
                    defaultPageSize={5}
                    pageSizeOptions={[5, 10, 20, 50]}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Most Active Aslabs */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Aslab Teraktif ({getPeriodLabel()})</CardTitle>
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
                Grafik Kehadiran ({getPeriodLabel()})
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>Pola kehadiran aslab dalam periode yang dipilih</span>
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
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>Klik pada batang untuk melihat detail kehadiran hari tersebut</span>
              </div>
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
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={handleBarClick}
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

        {/* Modal Detail Hari */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detail Absensi - {formatModalDate(selectedDate)}
              </DialogTitle>
              <DialogDescription>
                Data lengkap kehadiran aslab pada tanggal {formatModalDate(selectedDate)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden">
              {isLoadingDayDetail ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Memuat data...</p>
                  </div>
                </div>
              ) : dayDetailData.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <div className="text-center">
                    <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Tidak ada data absensi pada tanggal ini
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-auto h-full">
                  <DataTable
                    columns={dayDetailColumns}
                    data={dayDetailData}
                    searchPlaceholder="Cari nama aslab..."
                    filename={`absensi-${selectedDate.replace(/\//g, '-')}`}
                    enableRowSelection={false}
                    defaultPageSize={5}
                    pageSizeOptions={[5, 10, 20, 50]}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Total: {dayDetailData.length} aslab
              </div>
              <Button onClick={handleCloseModal} variant="outline">
                Tutup
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageTransition>
    </AppLayout>
  );
}
