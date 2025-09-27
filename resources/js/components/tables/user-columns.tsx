import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Eye, Edit, UserX, UserCheck, Trash } from "lucide-react";
import { Link, router } from "@inertiajs/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
    id: number;
    name: string;
    email: string;
    rfid_code: string | null;
    prodi: string | null;
    semester: number | null;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const createUserColumns = (): ColumnDef<User>[] => [
  {
    accessorKey: "name",
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
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const email = row.getValue("email") as string;
      return <div className="text-muted-foreground">{email}</div>;
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-medium"
        >
          Role
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      const roleLabels: Record<string, string> = {
        admin: "Admin",
        aslab: "Aslab",
        mahasiswa: "Mahasiswa",
        dosen: "Dosen"
      };
      const roleColors: Record<string, string> = {
        admin: "bg-red-500 hover:bg-red-600 text-white",
        aslab: "bg-blue-500 hover:bg-blue-600 text-white",
        mahasiswa: "bg-green-500 hover:bg-green-600 text-white",
        dosen: "bg-purple-500 hover:bg-purple-600 text-white"
      };
      return (
        <Badge className={roleColors[role] || "bg-gray-500 hover:bg-gray-600"}>
          {roleLabels[role] || role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "rfid_code",
    header: "RFID",
    cell: ({ row }) => {
      const rfidCode = row.getValue("rfid_code") as string | null;
      return rfidCode ? (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          {rfidCode}
        </Badge>
      ) : (
        <Badge variant="secondary" className="text-muted-foreground">
          Belum terdaftar
        </Badge>
      );
    },
  },
  {
    accessorKey: "prodi",
    header: "Prodi",
    cell: ({ row }) => {
      const prodi = row.getValue("prodi") as string | null;
      return prodi ? <div>{prodi}</div> : <div className="text-muted-foreground">-</div>;
    },
  },
  {
    accessorKey: "semester",
    header: "Semester",
    cell: ({ row }) => {
      const semester = row.getValue("semester") as number | null;
      return semester ? <div>{semester}</div> : <div className="text-muted-foreground">-</div>;
    },
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const user = row.original;

      const handleToggleStatus = () => {
        router.patch(`/kelola-user/${user.id}/toggle-status`, {}, {
          preserveScroll: true,
        });
      };

      const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus ${user.name}?`)) {
          router.delete(`/kelola-user/${user.id}`, {
            preserveScroll: true,
          });
        }
      };

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Aksi</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/kelola-user/${user.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/kelola-user/${user.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleStatus}>
                {user.is_active ? (
                  <>
                    <UserX className="mr-2 h-4 w-4" />
                    Nonaktifkan
                  </>
                ) : (
                  <>
                    <UserCheck className="mr-2 h-4 w-4" />
                    Aktifkan
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive hover:text-destructive/90 dark:text-red-400 dark:hover:text-red-300"
                onClick={handleDelete}
              >
                <Trash className="mr-2 h-4 w-4 text-destructive hover:text-destructive/90 dark:text-red-400 dark:hover:text-red-300" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
