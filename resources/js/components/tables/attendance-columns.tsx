import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

export const createAttendanceColumns = (): ColumnDef<TodayAttendance>[] => [
  {
    accessorKey: "user.name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Nama
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
            Semester {user.semester}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "user.prodi",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Prodi
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-sm">{row.original.user.prodi}</div>;
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
      return checkIn ? (
        <span className="text-sm font-mono">{checkIn}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
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
      return checkOut ? (
        <span className="text-sm font-mono">{checkOut}</span>
      ) : (
        <span className="text-sm text-muted-foreground">-</span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      switch (status) {
        case 'Sedang di Lab':
          return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Di Lab</Badge>;
        case 'Sudah Pulang':
          return <Badge variant="secondary">Pulang</Badge>;
        default:
          return <Badge variant="outline">Belum Datang</Badge>;
      }
    },
  },
];
