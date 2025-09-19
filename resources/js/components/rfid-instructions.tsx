import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Radio, Info, Zap } from 'lucide-react';

const RfidInstructions: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="h-5 w-5" />
          Panduan RFID Scanner
        </CardTitle>
        <CardDescription>
          Sistem RFID scanner dapat dikontrol secara real-time melalui web interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Gunakan toggle RFID di header (ikon radio) untuk mengubah mode scanner secara global
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Mode yang Tersedia:</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="font-medium">Mode Registrasi</span>
              </div>
              <Badge variant="outline">registration</Badge>
            </div>
            <p className="text-xs text-gray-600 ml-5">
              Scan kartu RFID untuk mendaftarkan asisten laboratorium baru
            </p>

            <div className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="font-medium">Mode Check-In</span>
              </div>
              <Badge variant="outline">check_in</Badge>
            </div>
            <p className="text-xs text-gray-600 ml-5">
              Scan kartu terdaftar untuk mencatat kehadiran masuk
            </p>

            <div className="flex items-center justify-between p-2 rounded border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="font-medium">Mode Check-Out</span>
              </div>
              <Badge variant="outline">check_out</Badge>
            </div>
            <p className="text-xs text-gray-600 ml-5">
              Scan kartu terdaftar untuk mencatat kehadiran keluar
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-sm flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4" />
            Fitur Otomatis
          </h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Perubahan mode langsung tersinkronisasi ke perangkat RFID</li>
            <li>• Status mode ditampilkan secara real-time di web dan Arduino</li>
            <li>• LED indikator pada Arduino akan berubah sesuai mode aktif</li>
            <li>• Sistem akan polling mode command setiap 3 detik</li>
          </ul>
        </div>

        <div className="bg-blue-50 p-3 rounded text-xs">
          <strong>Tips:</strong> Pastikan perangkat Arduino terhubung ke jaringan yang sama 
          untuk dapat menerima perintah perubahan mode secara otomatis.
        </div>
      </CardContent>
    </Card>
  );
};

export default RfidInstructions;