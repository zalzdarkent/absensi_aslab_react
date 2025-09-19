import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createAttendanceColumns } from '@/components/tables/attendance-columns';

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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Scan Absensi',
    },
];

export default function AttendanceScan() {
  const [rfidCode, setRfidCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [todayAttendances, setTodayAttendances] = useState<TodayAttendance[]>([]);
  const columns = createAttendanceColumns();

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

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Scan Absensi" />

      <div className="space-y-6 pt-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Scan Absensi RFID</h1>
          <p className="text-muted-foreground">
            Tempelkan kartu RFID untuk melakukan check-in atau check-out
          </p>
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
            <DataTable
              columns={columns}
              data={todayAttendances}
              searchPlaceholder="Cari nama atau prodi..."
              filename="absensi-hari-ini"
              enableRowSelection={false}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
