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

interface MataKuliah {
  id: number;
  nama: string;
}

export interface DosenPraktikum {
  id: number;
  nama: string;
  nidn: string;
  mata_kuliahs: MataKuliah[];
  created_at: string;
  updated_at: string;
}

interface ActionsCellProps {
  dosen: DosenPraktikum;
  onEdit: (dosen: DosenPraktikum) => void;
}

function ActionsCell({ dosen, onEdit }: ActionsCellProps) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleDelete = () => {
    router.delete(`/absensi-praktikum/dosen-praktikum/${dosen.id}`, {
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
          <DropdownMenuItem onClick={() => onEdit(dosen)}>
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
              Tindakan ini tidak dapat dibatalkan. Dosen ini akan dihapus secara permanen.
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

export function createDosenPraktikumColumns(
  onEdit: (dosen: DosenPraktikum) => void
): ColumnDef<DosenPraktikum>[] {
  return [
    {
      accessorKey: 'nama',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nama Dosen
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue('nama')}</div>,
    },
    {
      accessorKey: 'nidn',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            NIDN
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="text-muted-foreground">{row.getValue('nidn')}</div>,
    },
    {
      accessorKey: 'mata_kuliahs',
      header: 'Mata Kuliah',
      cell: ({ row }) => {
        const mataKuliahs = row.original.mata_kuliahs || [];
        if (mataKuliahs.length === 0) {
          return <div className="text-muted-foreground">-</div>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {mataKuliahs.map((mk) => (
              <span
                key={mk.id}
                className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-700/10"
              >
                {mk.nama}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionsCell dosen={row.original} onEdit={onEdit} />,
    },
  ];
}
