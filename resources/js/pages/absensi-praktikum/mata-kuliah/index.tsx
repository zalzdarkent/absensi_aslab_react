import { Head, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createMataKuliahPraktikumColumns } from '@/components/tables/mata-kuliah-praktikum-columns';
import InputError from '@/components/input-error';
import { FormEvent, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Kelas {
  id: number;
  kelas: number;
  jurusan: 'IF' | 'SI';
}

interface MataKuliahPraktikum {
  id: number;
  nama: string;
  kelas_id: number;
  kelas?: Kelas;
  created_at: string;
  updated_at: string;
}

interface Props {
  mataKuliahs: MataKuliahPraktikum[];
  kelas: Kelas[];
  filters: {
    search: string | null;
  };
  success?: string;
  error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Absensi Praktikum',
  },
  {
    title: 'Mata Kuliah Praktikum',
  },
];

export default function MataKuliahPraktikumIndex({ mataKuliahs, kelas, success, error }: Pick<Props, 'mataKuliahs' | 'kelas' | 'success' | 'error'>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingMataKuliah, setEditingMataKuliah] = useState<MataKuliahPraktikum | null>(null);

  // Show toast notifications
  useEffect(() => {
    if (success) {
      toast.success(success);
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    nama: '',
    kelas_id: '',
  });

  const openEditModal = (mataKuliah: MataKuliahPraktikum) => {
    setData({
      nama: mataKuliah.nama,
      kelas_id: mataKuliah.kelas_id.toString(),
    });
    setEditingMataKuliah(mataKuliah);
  };

  const columns = createMataKuliahPraktikumColumns(openEditModal);

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    post('/absensi-praktikum/mata-kuliah-praktikum', {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        reset();
      },
    });
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingMataKuliah) {
      put(`/absensi-praktikum/mata-kuliah-praktikum/${editingMataKuliah.id}`, {
        onSuccess: () => {
          setEditingMataKuliah(null);
          reset();
        },
      });
    }
  };

  const openCreateModal = () => {
    reset();
    setIsCreateModalOpen(true);
  };

  const [selectedRows, setSelectedRows] = useState<MataKuliahPraktikum[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;

    router.post('/absensi-praktikum/mata-kuliah-praktikum/bulk-delete', {
      items: selectedRows.map(row => ({ id: row.id }))
    }, {
      onSuccess: () => {
        setIsBulkDeleteModalOpen(false);
        setSelectedRows([]);
        toast.success('Data mata kuliah praktikum berhasil dihapus');
      },
      onError: () => {
        toast.error('Gagal menghapus data mata kuliah praktikum');
      }
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Mata Kuliah Praktikum" />

      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mata Kuliah Praktikum</h1>
            <p className="text-muted-foreground">
              Kelola data mata kuliah praktikum
            </p>
          </div>
          <div className="flex gap-2">
            {selectedRows.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setIsBulkDeleteModalOpen(true)}
              >
                Hapus {selectedRows.length} Data
              </Button>
            )}
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Mata Kuliah
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Mata Kuliah Praktikum</CardTitle>
            <CardDescription>
              Total: {mataKuliahs.length} mata kuliah
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={mataKuliahs}
              searchPlaceholder="Cari nama mata kuliah..."
              filename="mata-kuliah-praktikum"
              enableRowSelection={true}
              onRowSelectionChange={setSelectedRows}
              getRowId={(row) => row.id.toString()}
            />
          </CardContent>
        </Card>
      </div>

      {/* Bulk Delete Confirmation Modal */}
      <Dialog open={isBulkDeleteModalOpen} onOpenChange={setIsBulkDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Massal</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus {selectedRows.length} data mata kuliah praktikum yang dipilih?
              Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBulkDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              disabled={processing}
            >
              {processing ? 'Menghapus...' : 'Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Mata Kuliah Praktikum</DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk menambahkan mata kuliah praktikum baru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Mata Kuliah *</Label>
                <Input
                  id="nama"
                  type="text"
                  value={data.nama}
                  onChange={(e) => setData('nama', e.target.value)}
                  placeholder="Contoh: Pemrograman Web"
                  required
                />
                <InputError message={errors.nama} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="kelas_id">Kelas *</Label>
                <Select
                  value={data.kelas_id}
                  onValueChange={(value) => setData('kelas_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelas.map((k) => (
                      <SelectItem key={k.id} value={k.id.toString()}>
                        Kelas {k.kelas} - {k.jurusan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.kelas_id} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingMataKuliah} onOpenChange={(open) => !open && setEditingMataKuliah(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mata Kuliah Praktikum</DialogTitle>
            <DialogDescription>
              Perbarui data mata kuliah praktikum
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nama">Nama Mata Kuliah *</Label>
                <Input
                  id="edit-nama"
                  type="text"
                  value={data.nama}
                  onChange={(e) => setData('nama', e.target.value)}
                  placeholder="Contoh: Pemrograman Web"
                  required
                />
                <InputError message={errors.nama} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-kelas_id">Kelas *</Label>
                <Select
                  value={data.kelas_id}
                  onValueChange={(value) => setData('kelas_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {kelas.map((k) => (
                      <SelectItem key={k.id} value={k.id.toString()}>
                        Kelas {k.kelas} - {k.jurusan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.kelas_id} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingMataKuliah(null)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
