import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { MoreHorizontal, Edit, Trash, ArrowUpDown } from 'lucide-react';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export interface Kelas {
  id: number;
  kelas: number;
  jurusan: 'IF' | 'SI';
  created_at: string;
  updated_at: string;
}

interface ActionsCellProps {
  kelas: Kelas;
  onEdit: (kelas: Kelas) => void;
}

function ActionsCell({ kelas, onEdit }: ActionsCellProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleDelete = () => {
    router.delete(`/absensi-praktikum/kelas/${kelas.id}`, {
      onSuccess: () => setShowDeleteAlert(false),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onEdit(kelas)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteAlert(true)}
            className="text-red-600"
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apakah Anda yakin?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Kelas ini akan dihapus secara permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button onClick={handleDelete} variant="destructive">
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function createKelasColumns(
  onEdit: (kelas: Kelas) => void
): ColumnDef<Kelas>[] {
  return [
    {
      accessorKey: 'kelas',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Semester
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">Semester {row.getValue('kelas')}</div>,
    },
    {
      accessorKey: 'jurusan',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Jurusan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const jurusan = row.getValue('jurusan') as string;
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
              {jurusan}
            </span>
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionsCell kelas={row.original} onEdit={onEdit} />,
    },
  ];
}
