import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Calendar, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AttendanceRecord {
  id: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'late' | 'absent';
  notes: string | null;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (timeString: string | null) => {
  if (!timeString) return '-';
  // If it's already in HH:MM format, return as is
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  // Otherwise try to parse as full datetime
  return new Date(timeString).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const createAttendanceHistoryColumns = (): ColumnDef<AttendanceRecord>[] => [
  {
    accessorKey: "user.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Aslab
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div>
          <div className="font-medium">{user.name}</div>
          <div className="text-sm text-muted-foreground">
            {user.email}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {formatDate(date)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "check_in",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Check-in
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const checkIn = row.getValue("check_in") as string | null;
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono">
            {formatTime(checkIn)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "check_out",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Check-out
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const checkOut = row.getValue("check_out") as string | null;
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-mono">
            {formatTime(checkOut)}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      switch (status) {
        case 'present':
          return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Hadir</Badge>;
        case 'late':
          return <Badge variant="destructive">Terlambat</Badge>;
        case 'absent':
          return <Badge variant="secondary">Tidak Hadir</Badge>;
        default:
          return <Badge variant="outline">-</Badge>;
      }
    },
  },
  {
    accessorKey: "notes",
    header: "Catatan",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | null;
      return (
        <span className="text-sm text-muted-foreground">
          {notes || '-'}
        </span>
      );
    },
  },
];
