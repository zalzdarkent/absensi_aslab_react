import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Radio, Settings, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type RfidMode, type RfidModeResponse, type RfidModeSetResponse } from '@/types/rfid';

interface RfidModeToggleMiniProps {
  className?: string;
}

const RfidModeToggleMini: React.FC<RfidModeToggleMiniProps> = ({ className }) => {
  const [currentMode, setCurrentMode] = useState<RfidMode>('registration');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current mode from API
  const fetchCurrentMode = async () => {
    try {
      const response = await fetch('/api/rfid/get-mode-command');
      if (response.ok) {
        const data: RfidModeResponse = await response.json();
        setCurrentMode(data.mode);
      }
    } catch (err) {
      console.error('Failed to fetch current mode:', err);
    }
  };

  // Set mode via API
  const setMode = async (mode: RfidMode) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rfid/set-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ mode }),
      });

      if (response.ok) {
        const data: RfidModeSetResponse = await response.json();
        setCurrentMode(data.mode);
      } else {
        throw new Error('Failed to set mode');
      }
    } catch (err) {
      setError('Gagal mengubah mode RFID');
      console.error('Failed to set mode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle toggle change
  const handleToggle = (checked: boolean) => {
    const newMode: RfidMode = checked ? 'check_in' : 'registration';
    setMode(newMode);
  };

  // Handle attendance mode toggle (check_in <-> check_out)
  const handleAttendanceModeToggle = () => {
    const newMode: RfidMode = currentMode === 'check_in' ? 'check_out' : 'check_in';
    setMode(newMode);
  };

  // Fetch current mode on component mount
  useEffect(() => {
    fetchCurrentMode();

    // Refresh mode every 10 seconds
    const interval = setInterval(fetchCurrentMode, 10000);
    return () => clearInterval(interval);
  }, []);

  const isAttendanceMode = currentMode === 'check_in' || currentMode === 'check_out';

  const getModeColor = (mode: RfidMode) => {
    switch (mode) {
      case 'registration':
        return 'bg-green-500';
      case 'check_in':
        return 'bg-blue-500';
      case 'check_out':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getModeLabel = (mode: RfidMode) => {
    switch (mode) {
      case 'registration':
        return 'Registrasi';
      case 'check_in':
        return 'Check-In';
      case 'check_out':
        return 'Check-Out';
      default:
        return 'Unknown';
    }
  };

  const getModeDescription = (mode: RfidMode) => {
    switch (mode) {
      case 'registration':
        return 'Scan kartu untuk mendaftarkan RFID baru';
      case 'check_in':
        return 'Scan kartu terdaftar untuk masuk';
      case 'check_out':
        return 'Scan kartu terdaftar untuk keluar';
      default:
        return 'Mode tidak dikenal';
    }
  };

  return (
    <div className={cn("w-full p-4 space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4" />
          <span className="font-medium text-sm">Mode RFID Scanner</span>
        </div>
        {isLoading && <Settings className="h-3 w-3 animate-spin text-gray-500" />}
      </div>

      {/* Current Mode Status */}
      <div className="flex items-center justify-between p-2 bg-muted rounded">
        <span className="text-xs font-medium text-muted-foreground">Status:</span>
        <Badge variant="outline" className="text-xs">
          <div className={cn("w-2 h-2 rounded-full mr-2", getModeColor(currentMode))} />
          {getModeLabel(currentMode)}
        </Badge>
      </div>

      {/* Mode Description */}
      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
        {getModeDescription(currentMode)}
      </div>

      {/* Main Mode Toggle: Registration vs Attendance */}
      <div className="space-y-2">
        <Label htmlFor="mode-toggle-mini" className="text-xs font-medium">
          Mode Utama
        </Label>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Registrasi</span>
          <Switch
            id="mode-toggle-mini"
            checked={isAttendanceMode}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
          <span className="text-xs text-muted-foreground">Absensi</span>
        </div>
      </div>

      {/* Attendance Sub-mode Toggle */}
      {isAttendanceMode && (
        <div className="space-y-2 pt-2 border-t">
          <Label htmlFor="attendance-toggle-mini" className="text-xs font-medium">
            Jenis Absensi
          </Label>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Check-In</span>
            <Switch
              id="attendance-toggle-mini"
              checked={currentMode === 'check_out'}
              onCheckedChange={handleAttendanceModeToggle}
              disabled={isLoading}
            />
            <span className="text-xs text-muted-foreground">Check-Out</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          {error}
        </div>
      )}

      {/* Success indicator */}
      {!isLoading && !error && (
        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="h-3 w-3" />
          Terhubung dengan perangkat RFID
        </div>
      )}
    </div>
  );
};

export default RfidModeToggleMini;
