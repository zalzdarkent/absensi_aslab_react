import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Search, X, Download, Filter, Clock, User, Activity } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

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

export default function AttendanceHistory({ attendances, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
  const [selectedDate, setSelectedDate] = useState(filters.date || '');

  const handleFilter = () => {
    router.get('/attendance-history', {
      search: search || undefined,
      status: selectedStatus && selectedStatus !== 'all' ? selectedStatus : undefined,
      date: selectedDate || undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedDate('');
    router.get('/attendance-history');
  };

  const handleExport = () => {
    // In real implementation, this would trigger CSV/Excel export
    const params = new URLSearchParams({
      export: 'true',
      search: search || '',
      status: selectedStatus || '',
      date: selectedDate || '',
    });
    window.open(`/attendance-history?${params}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="default">Hadir</Badge>;
      case 'late':
        return <Badge variant="destructive">Terlambat</Badge>;
      case 'absent':
        return <Badge variant="secondary">Tidak Hadir</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout>
      <Head title="Riwayat Absensi" />

      <div className="space-y-6">
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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Pencarian
            </CardTitle>
            <CardDescription>
              Gunakan filter di bawah untuk mencari data absensi tertentu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Cari nama atau email aslab..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
              </div>
              <div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="present">Hadir</SelectItem>
                    <SelectItem value="late">Terlambat</SelectItem>
                    <SelectItem value="absent">Tidak Hadir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleFilter}>
                <Search className="mr-2 h-4 w-4" />
                Cari
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

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
              {attendances.total > 0 && (
                <span className="text-sm text-muted-foreground font-normal ml-2">
                  ({attendances.from}-{attendances.to} dari {attendances.total})
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Aslab</th>
                    <th className="text-left p-4 font-medium">Tanggal</th>
                    <th className="text-left p-4 font-medium">Check-in</th>
                    <th className="text-left p-4 font-medium">Check-out</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Catatan</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-muted-foreground">
                        Tidak ada data absensi yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    attendances.data.map((record) => (
                      <tr key={record.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{record.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.user.email}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(record.date)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono">
                              {formatTime(record.check_in)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono">
                              {formatTime(record.check_out)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {getStatusBadge(record.status)}
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {record.notes || '-'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {attendances.last_page > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Menampilkan {attendances.from} - {attendances.to} dari {attendances.total} hasil
                </div>
                <div className="flex gap-2">
                  {Array.from({ length: attendances.last_page }, (_, i) => i + 1)
                    .slice(
                      Math.max(0, attendances.current_page - 3),
                      Math.min(attendances.last_page, attendances.current_page + 2)
                    )
                    .map((page) => (
                      <Button
                        key={page}
                        variant={page === attendances.current_page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => router.get('/attendance-history', {
                          ...filters,
                          page: page.toString(),
                        })}
                      >
                        {page}
                      </Button>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
