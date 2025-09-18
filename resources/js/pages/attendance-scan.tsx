import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scan, RefreshCw, Clock, UserCheck, UserX } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface TodayAttendance {
  user: {
    id: number;
    name: string;
    prodi: string;
    semester: number;
  };
  check_in: string | null;
  check_out: string | null;
  status: string;
}

interface ScanResult {
  success: boolean;
  type: 'check_in' | 'check_out';
  message: string;
  user: {
    name: string;
    prodi: string;
    semester: number;
  };
  time: string;
}

export default function AttendanceScan() {
  const [rfidCode, setRfidCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [todayAttendances, setTodayAttendances] = useState<TodayAttendance[]>([]);

  // Load today's attendance on component mount
  useEffect(() => {
    loadTodayAttendances();
  }, []);

  const loadTodayAttendances = async () => {
    try {
      const response = await fetch('/attendance-today');
      const data = await response.json();
      if (data.success) {
        setTodayAttendances(data.data);
      }
    } catch (error) {
      console.error('Error loading today attendances:', error);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidCode.trim()) return;

    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await fetch('/attendance-scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          rfid_code: rfidCode.toUpperCase(),
        }),
      });

      const data = await response.json();
      setScanResult(data);

      if (data.success) {
        // Reload today's attendances
        loadTodayAttendances();
        // Clear RFID input
        setRfidCode('');
      }
    } catch (error) {
      console.error('Error processing scan:', error);
      setScanResult({
        success: false,
        message: 'Terjadi kesalahan koneksi',
        type: 'check_in',
        user: { name: '', prodi: '', semester: 0 },
        time: '',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualRfidInput = (value: string) => {
    setRfidCode(value.toUpperCase());
    // Auto-submit when RFID code reaches typical length (8-12 characters)
    if (value.length >= 8) {
      setTimeout(() => {
        const form = document.getElementById('scan-form') as HTMLFormElement;
        if (form) form.requestSubmit();
      }, 100);
    }
  };

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

  const stats = {
    total: todayAttendances.length,
    di_lab: todayAttendances.filter(a => a.status === 'Sedang di Lab').length,
    sudah_pulang: todayAttendances.filter(a => a.status === 'Sudah Pulang').length,
  };

  return (
    <AppLayout>
      <Head title="Scan Absensi" />

      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Scan Absensi RFID</h1>
          <p className="text-muted-foreground">
            Tempelkan kartu RFID untuk melakukan check-in atau check-out
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scanner */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Scan className="h-6 w-6" />
                  RFID Scanner
                </CardTitle>
                <CardDescription>
                  Tempelkan kartu RFID pada reader atau masukkan kode secara manual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Scan Result */}
                {scanResult && (
                  <Alert className={scanResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    <div className="flex items-start gap-2">
                      {scanResult.success ? (
                        scanResult.type === 'check_in' ? (
                          <UserCheck className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <UserX className="h-5 w-5 text-blue-600 mt-0.5" />
                        )
                      ) : (
                        <UserX className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <AlertDescription className={scanResult.success ? 'text-green-800' : 'text-red-800'}>
                          <div className="font-medium">{scanResult.message}</div>
                          {scanResult.success && scanResult.user.name && (
                            <div className="text-sm mt-1">
                              {scanResult.user.name} • {scanResult.user.prodi} • Sem {scanResult.user.semester}
                            </div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}

                {/* Scan Form */}
                <form id="scan-form" onSubmit={handleScan} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rfid_code">Kode RFID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="rfid_code"
                        type="text"
                        value={rfidCode}
                        onChange={(e) => handleManualRfidInput(e.target.value)}
                        placeholder="Tempel kartu RFID atau ketik kode..."
                        className="text-lg text-center font-mono"
                        autoFocus
                        disabled={isScanning}
                      />
                      <Button type="submit" disabled={isScanning || !rfidCode.trim()}>
                        {isScanning ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Scan className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Instructions */}
                <div className="text-center space-y-2">
                  <div className="text-sm text-muted-foreground">
                    1. Tempelkan kartu RFID pada reader<br />
                    2. Sistem akan otomatis memproses absensi<br />
                    3. Check-in pertama kali, check-out kedua kali
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistik Hari Ini</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Hadir</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sedang di Lab</span>
                  <span className="font-medium text-green-600">{stats.di_lab}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sudah Pulang</span>
                  <span className="font-medium text-blue-600">{stats.sudah_pulang}</span>
                </div>
              </CardContent>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={loadTodayAttendances}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Absensi Hari Ini ({todayAttendances.length})
            </CardTitle>
            <CardDescription>
              Daftar aslab yang sudah melakukan absensi hari ini
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Nama</th>
                    <th className="text-left p-3 font-medium">Prodi</th>
                    <th className="text-left p-3 font-medium">Check-in</th>
                    <th className="text-left p-3 font-medium">Check-out</th>
                    <th className="text-left p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        Belum ada absensi hari ini
                      </td>
                    </tr>
                  ) : (
                    todayAttendances.map((attendance, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="font-medium">{attendance.user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Semester {attendance.user.semester}
                          </div>
                        </td>
                        <td className="p-3 text-sm">{attendance.user.prodi}</td>
                        <td className="p-3">
                          {attendance.check_in ? (
                            <span className="text-sm font-mono">{attendance.check_in}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3">
                          {attendance.check_out ? (
                            <span className="text-sm font-mono">{attendance.check_out}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="p-3">
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
    </AppLayout>
  );
}
