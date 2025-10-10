import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  className?: string;
}

export function Toast({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  className = ""
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timeoutId = setTimeout(() => setIsVisible(true), 10);

    // Auto close after duration
    const closeTimeoutId = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(closeTimeoutId);
    };
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const styles = {
    success: "bg-green-500 border-green-400 text-white",
    error: "bg-red-500 border-red-400 text-white",
    warning: "bg-orange-500 border-orange-400 text-white",
    info: "bg-blue-500 border-blue-400 text-white",
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-md rounded-lg border shadow-elegant backdrop-blur-sm transition-all duration-300 ease-out",
        styles[type],
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95",
        className
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 rounded-full p-1 hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/20 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-white/40 rounded-b-lg transition-all ease-linear"
          style={{
            width: isVisible ? '0%' : '100%',
            transitionDuration: `${duration}ms`
          }}
        />
      </div>
    </div>
  );
}

// Toast Container untuk mengelola multiple toasts
interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{
            transform: `translateY(${index * 80}px)`,
            zIndex: 50 - index
          }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => onRemove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}
