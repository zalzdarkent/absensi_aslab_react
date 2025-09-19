import { useState, useEffect, useCallback, useRef } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, RefreshCw, Wifi, WifiOff, Radio } from 'lucide-react';
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
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [rfidDetected, setRfidDetected] = useState<string | null>(null);
  const rfidIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const columns = createAttendanceColumns();

  // Load today's attendance on component mount
  useEffect(() => {
    loadTodayAttendances();
    startRfidDetection();

    // Cleanup intervals on unmount
    return () => {
      if (rfidIntervalRef.current) {
        clearInterval(rfidIntervalRef.current);
      }
    };
  }, []);

  // Remove auto-refresh, only update on RFID events
  // Real-time RFID detection for automatic scanning
  const startRfidDetection = () => {
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
            setRfidCode(data.rfid_code);
            
            // Auto-process the scan
            await processRfidScan(data.rfid_code);
          }
        }
      } catch (error) {
        console.error('Error detecting RFID:', error);
      }
    }, 2000); // Check every 2 seconds only for RFID detection
  };

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

  const processRfidScan = async (rfid: string) => {
    if (!rfid.trim()) return;

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
          rfid_code: rfid.toUpperCase(),
        }),
      });

      const data = await response.json();
      setScanResult(data);

      if (data.success) {
        // Force immediate refresh only after successful scan
        await loadTodayAttendances();
        // Clear RFID input after a short delay
        setTimeout(() => {
          setRfidCode('');
          setRfidDetected(null);
        }, 2000);
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

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    await processRfidScan(rfidCode);
  };

  // Function untuk refresh manual jika diperlukan
  const handleManualRefresh = () => {
    loadTodayAttendances();
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
          {/* <div className="mt-2 flex justify-center">
            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
              📡 Mode deteksi otomatis aktif - Data diperbarui setiap ada aktivitas RFID
            </div>
          </div> */}
        </div>

        {/* RFID Detection Status */}
        {rfidDetected && (
          <div className="flex justify-center">
            <Alert className="w-fit border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                🎯 RFID Terdeteksi: {rfidDetected} - Memproses otomatis...
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && (
          <div className="flex justify-center">
            <Alert className={`w-fit ${scanResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <AlertDescription className={scanResult.success ? 'text-green-800' : 'text-red-800'}>
                {scanResult.success ? '✅' : '❌'} {scanResult.message}
                {scanResult.success && (
                  <div className="mt-1 text-sm">
                    {scanResult.user.name} - {scanResult.type === 'check_in' ? 'Masuk' : 'Keluar'} pada {scanResult.time}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Today's Attendance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Absensi Hari Ini
                <Badge variant="outline" className="ml-2">
                  {todayAttendances.length} orang
                </Badge>
                {isLoadingAttendances && (
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-500 ml-2" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">
                    Event-Driven Updates
                  </span>
                </div>
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoadingAttendances}
                  className="text-sm text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                >
                  Refresh
                </button>
              </div>
            </CardTitle>
            <CardDescription>
              Data diperbarui otomatis saat ada aktivitas RFID • Update terakhir: {lastUpdate.toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayAttendances.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Belum Ada Absensi</h3>
                <p className="text-sm">Belum ada aslab yang melakukan absensi hari ini.</p>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={todayAttendances}
                searchPlaceholder="Cari nama atau prodi..."
                filename="absensi-hari-ini"
                enableRowSelection={false}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
