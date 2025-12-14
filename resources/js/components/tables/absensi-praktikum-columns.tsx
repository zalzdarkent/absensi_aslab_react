import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash, ArrowUpDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

export interface MataKuliah {
  id: number;
  nama: string;
}

export interface DosenPraktikum {
  id: number;
  nama: string;
  mata_kuliahs?: MataKuliah[];
}

export interface AbsensiPraktikum {
  id: number;
  aslab: {
    id: number;
    name: string;
  };
  tanggal: string;
  dosen_praktikum: DosenPraktikum;
  pertemuan: string;
  sebagai: string;
  kehadiran_dosen: string;
  kelas: {
    id: number;
    kelas: string;
    jurusan: string;
    display_name: string;
  };
}

function ActionsCell({ absensi, onEdit }: { absensi: AbsensiPraktikum; onEdit: (absensi: AbsensiPraktikum) => void }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { delete: destroy, processing } = useForm();

  const handleDelete = () => {
    destroy(`/absensi-praktikum/absensi/${absensi.id}`, {
      onSuccess: () => {
        setShowDeleteDialog(false);
      },
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(absensi)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Absensi Praktikum</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus absensi untuk {absensi.aslab.name} pada tanggal {new Date(absensi.tanggal).toLocaleDateString('id-ID')}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={processing}
            >
              {processing ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function createAbsensiPraktikumColumns(
  onEdit: (absensi: AbsensiPraktikum) => void
): ColumnDef<AbsensiPraktikum>[] {
  return [
    {
      accessorKey: 'aslab.name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Aslab
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="font-medium">{row.original.aslab.name}</div>
      ),
    },
    {
      accessorKey: 'tanggal',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tanggal
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div>
          {new Date(row.original.tanggal).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      accessorKey: 'dosen_praktikum.nama',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Dosen
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const dosen = row.original.dosen_praktikum;
        const mataKuliahs = dosen.mata_kuliahs?.map(mk => mk.nama).join(', ') || '';

        return (
          <div>
            <div className="font-medium">{dosen.nama}</div>
            {mataKuliahs && (
              <div className="text-xs text-muted-foreground">{mataKuliahs}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'pertemuan',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Pertemuan
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const pertemuan = row.original.pertemuan;
        let label = pertemuan;

        if (pertemuan === '6') {
          label = '6 (UTS)';
        } else if (pertemuan === '14') {
          label = '14 (UAS)';
        }

        return <Badge variant="outline">{label}</Badge>;
      },
    },
    {
      accessorKey: 'sebagai',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Sebagai
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const sebagai = row.original.sebagai;
        const variant = sebagai === 'instruktur' ? 'default' : 'secondary';

        return (
          <Badge variant={variant}>
            {sebagai === 'instruktur' ? 'Instruktur' : 'Asisten'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'kehadiran_dosen',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kehadiran Dosen
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const kehadiran = row.original.kehadiran_dosen;
        const variant = kehadiran === 'hadir' ? 'default' : 'destructive';

        return (
          <Badge variant={variant}>
            {kehadiran === 'hadir' ? 'Hadir' : 'Tidak Hadir'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'kelas.display_name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Kelas
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original.kelas.display_name}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }) => <ActionsCell absensi={row.original} onEdit={onEdit} />,
    },
  ];
}
