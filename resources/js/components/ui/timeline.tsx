import { Clock, UserCheck, UserX, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'check-in' | 'check-out' | 'activity';
  user?: {
    name: string;
    avatar?: string;
  };
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className = "" }: TimelineProps) {
  const getIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'check-in':
        return UserCheck;
      case 'check-out':
        return UserX;
      case 'activity':
        return Activity;
      default:
        return Clock;
    }
  };

  const getColor = (type: TimelineItem['type']) => {
    switch (type) {
      case 'check-in':
        return 'border-green-500 bg-green-50 text-green-600';
      case 'check-out':
        return 'border-orange-500 bg-orange-50 text-orange-600';
      case 'activity':
        return 'border-blue-500 bg-blue-50 text-blue-600';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item, index) => {
        const Icon = getIcon(item.type);
        const colorClass = getColor(item.type);

        return (
          <div key={item.id} className="relative flex items-start gap-4 group">
            {/* Timeline line */}
            {index < items.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-16 bg-border" />
            )}

            {/* Icon */}
            <div className={cn(
              "relative flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200 group-hover:scale-110",
              colorClass
            )}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-4">
              <div className="bg-card rounded-lg border p-4 hover-lift hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                    )}
                    {item.user && (
                      <div className="flex items-center gap-2">
                        {item.user.avatar ? (
                          <img
                            src={item.user.avatar}
                            alt={item.user.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-medium text-primary">
                              {item.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {item.user.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.timestamp}
                  </time>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Real-time Activity Timeline untuk Dashboard
interface ActivityTimelineProps {
  className?: string;
}

export function ActivityTimeline({ className = "" }: ActivityTimelineProps) {
  // Sample data - replace with real data from your API
  const activities: TimelineItem[] = [
    {
      id: '1',
      title: 'Check-in Berhasil',
      description: 'Memulai shift hari ini',
      timestamp: '08:30',
      type: 'check-in',
      user: { name: 'Ahmad Rizki' }
    },
    {
      id: '2',
      title: 'Check-out',
      description: 'Selesai shift',
      timestamp: '17:00',
      type: 'check-out',
      user: { name: 'Sari Dewi' }
    },
    {
      id: '3',
      title: 'Aktivitas Lab',
      description: 'Sedang melakukan praktikum',
      timestamp: '14:20',
      type: 'activity',
      user: { name: 'Budi Santoso' }
    }
  ];

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Aktivitas Terbaru</h3>
        <div className="w-2 h-2 rounded-full bg-green-500 pulse-soft ml-auto"></div>
      </div>
      <Timeline items={activities} />
    </div>
  );
}
