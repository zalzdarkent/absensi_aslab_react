import { useState, useEffect, useRef } from 'react';

interface RfidScanData {
  rfid_code: string;
  timestamp: string;
}

interface UseRfidScannerOptions {
  onScan?: (rfidCode: string) => void;
  pollInterval?: number;
  enabled?: boolean;
}

export function useRfidScanner({
  onScan,
  pollInterval = 1000,
  enabled = true
}: UseRfidScannerOptions = {}) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pollForScan = async () => {
    try {
      const response = await fetch('/api/rfid/last-scan');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const scanData: RfidScanData = data.data;
          setLastScanTime(new Date(scanData.timestamp));
          setError(null);
          
          if (onScan) {
            onScan(scanData.rfid_code);
          }
        }
      } else if (response.status !== 404) {
        // 404 is expected when no scan is available
        throw new Error('Failed to fetch scan data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('RFID polling error:', err);
    }
  };

  const startScanning = () => {
    if (!enabled) return;
    
    setIsScanning(true);
    setError(null);
    
    // Poll immediately
    pollForScan();
    
    // Start polling interval
    intervalRef.current = setInterval(pollForScan, pollInterval);
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isScanning,
    lastScanTime,
    error,
    startScanning,
    stopScanning,
  };
}