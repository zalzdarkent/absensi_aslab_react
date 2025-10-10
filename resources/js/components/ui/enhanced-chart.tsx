import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  date: string;
  count: number;
  label?: string;
}

interface EnhancedChartProps {
  data: ChartData[];
  title: string;
  description?: string;
  colorScheme?: string[];
  showTrend?: boolean;
  className?: string;
}

export function EnhancedChart({
  data,
  title,
  description,
  colorScheme = ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'],
  showTrend = true,
  className = ""
}: EnhancedChartProps) {
  // Calculate trend
  const trend = data.length >= 2 ?
    ((data[data.length - 1].count - data[data.length - 2].count) / data[data.length - 2].count) * 100
    : 0;

  const chartConfig = {
    count: {
      label: "Kehadiran",
      color: colorScheme[0],
    },
  };

  return (
    <Card className={`hover-lift ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            {title}
            {showTrend && (
              <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                trend >= 0
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              }`}>
                {trend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span className="font-medium">
                  {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
            )}
          </CardTitle>
          {description && (
            <CardDescription>{description}</CardDescription>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs"
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
              />
              <Bar
                dataKey="count"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-300 hover:opacity-80"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colorScheme[index % colorScheme.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Mini Chart untuk stats cards
interface MiniChartProps {
  data: number[];
  color?: string;
  height?: number;
}

export function MiniChart({ data, color = '#8b5cf6', height = 40 }: MiniChartProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((value, index) => {
        const heightPercent = ((value - min) / range) * 100;
        return (
          <div
            key={index}
            className="flex-1 rounded-sm transition-all duration-300 hover:opacity-80"
            style={{
              backgroundColor: color,
              height: `${Math.max(heightPercent, 10)}%`,
              opacity: 0.7 + (heightPercent / 100) * 0.3
            }}
          />
        );
      })}
    </div>
  );
}

// Donut Chart Component
interface DonutChartData {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  centerText?: string;
  centerValue?: string | number;
  size?: number;
}

export function DonutChart({
  data,
  centerText,
  centerValue,
  size = 120
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercentage = 0;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((cumulativePercentage / 100) * circumference);

          cumulativePercentage += percentage;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={item.color}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
          );
        })}
      </svg>

      {(centerText || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerValue && (
            <div className="text-lg font-bold text-foreground">
              {centerValue}
            </div>
          )}
          {centerText && (
            <div className="text-xs text-muted-foreground">
              {centerText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
