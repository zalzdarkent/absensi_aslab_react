import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface EnhancedCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  gradient: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  className?: string;
  children?: ReactNode;
}

export function EnhancedCard({
  title,
  value,
  description,
  icon: Icon,
  gradient,
  trend,
  className = "",
  children
}: EnhancedCardProps) {
  return (
    <Card className={`hover-lift border-0 overflow-hidden relative group ${className}`}>
      {/* Animated gradient background */}
      <div className={`absolute inset-0 ${gradient} opacity-90`} />

      {/* Floating decoration */}
      <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl group-hover:scale-110 transition-transform duration-300" />

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2 text-white">
        <CardTitle className="text-sm font-medium opacity-90">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>

      <CardContent className="relative text-white">
        <div className="text-2xl font-bold mb-1 group-hover:scale-105 transition-transform duration-200">
          {value}
        </div>

        {description && (
          <p className="text-xs opacity-80 mb-2">
            {description}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-1 text-xs">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              trend.isPositive
                ? 'bg-green-500/20 text-green-100'
                : 'bg-red-500/20 text-red-100'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="opacity-80">{trend.label}</span>
          </div>
        )}

        {children}
      </CardContent>

      {/* Subtle border glow */}
      <div className="absolute inset-0 rounded-lg border border-white/20 pointer-events-none" />
    </Card>
  );
}

// Glassmorphism variant
interface GlassCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}

export function GlassCard({ title, icon: Icon, children, className = "" }: GlassCardProps) {
  return (
    <Card className={`glass border-white/20 hover-lift backdrop-blur-xl ${className}`}>
      <CardHeader className="flex flex-row items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-primary/20">
          <Icon className="h-5 w-5 text-white" />
        </div>
        <CardTitle className="text-white/90">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-white/80">
        {children}
      </CardContent>
    </Card>
  );
}

// Floating Action Button component
interface FloatingActionButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
  tooltip?: string;
}

export function FloatingActionButton({
  icon: Icon,
  onClick,
  className = "",
  tooltip
}: FloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 rounded-full
        gradient-primary shadow-elegant hover:shadow-glow
        flex items-center justify-center
        text-white font-medium
        hover-scale group
        ${className}
      `}
    >
      <Icon className="h-6 w-6 group-hover:rotate-12 transition-transform duration-200" />
    </button>
  );
}
