import { cn } from "@/lib/utils";

// Skeleton Loader Component
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("shimmer rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Loading Spinner with different variants
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white" | "muted";
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "primary", 
  className = "" 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  const variantClasses = {
    primary: "border-primary",
    white: "border-white",
    muted: "border-muted-foreground"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-transparent border-t-current",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    />
  );
}

// Pulse Loading Animation
export function PulseLoader({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex space-x-2", className)}>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0ms" }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "150ms" }} />
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

// Progress Ring Component
interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressRing({ 
  progress, 
  size = 60, 
  strokeWidth = 4,
  className = "",
  showLabel = true
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-primary transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute text-sm font-medium">
          {Math.round(progress)}%
        </span>
      )}
    </div>
  );
}

// Staggered Fade In Animation Hook
export function useStaggerAnimation(items: any[], delay = 100) {
  return items.map((item, index) => ({
    ...item,
    style: {
      animationDelay: `${index * delay}ms`
    },
    className: "stagger-item"
  }));
}

// Page Transition Wrapper
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <div className={cn("fade-in", className)}>
      {children}
    </div>
  );
}