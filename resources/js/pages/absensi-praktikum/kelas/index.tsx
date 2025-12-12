import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { createKelasColumns, type Kelas } from '@/components/tables/kelas-columns';
import InputError from '@/components/input-error';
import { FormEvent, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Props {
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
    title: 'Kelas',
  },
];

export default function KelasIndex({ kelas, success, error }: Pick<Props, 'kelas' | 'success' | 'error'>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);

  // Show toast notifications
  useEffect(() => {
    if (success) {
      toast.success(success);
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error]);

  // Tentukan semester yang tersedia berdasarkan bulan saat ini
  const getAvailableSemesters = (): number[] => {
    const currentMonth = new Date().getMonth() + 1; // 1-12

    // Februari (2) - Juli (7): Semester Genap (2, 4, 6)
    if (currentMonth >= 2 && currentMonth <= 7) {
      return [2, 4, 6];
    }
    // Agustus (8) - Desember (12) & Januari (1): Semester Ganjil (1, 3, 5)
    return [1, 3, 5];
  };

  const availableSemesters = getAvailableSemesters();

  const { data, setData, post, put, processing, errors, reset } = useForm({
    kelas: '',
    jurusan: '',
  });

  const openEditModal = (kelas: Kelas) => {
    setData({
      kelas: kelas.kelas.toString(),
      jurusan: kelas.jurusan,
    });
    setEditingKelas(kelas);
  };

  const columns = createKelasColumns(openEditModal);

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    post('/absensi-praktikum/kelas', {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        reset();
      },
    });
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingKelas) {
      put(`/absensi-praktikum/kelas/${editingKelas.id}`, {
        onSuccess: () => {
          setEditingKelas(null);
          reset();
        },
      });
    }
  };

  const openCreateModal = () => {
    reset();
    setIsCreateModalOpen(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Kelas" />

      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kelas</h1>
            <p className="text-muted-foreground">
              Kelola data kelas
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kelas
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Kelas</CardTitle>
            <CardDescription>
              Total: {kelas.length} kelas · Semester aktif: {availableSemesters.join(', ')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={kelas}
              searchPlaceholder="Cari semester atau jurusan..."
              filename="kelas"
            />
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Kelas</DialogTitle>
            <DialogDescription>
              Semester yang dapat ditambahkan: {availableSemesters.join(', ')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="kelas">Semester *</Label>
                <Select
                  value={data.kelas}
                  onValueChange={(value) => setData('kelas', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSemesters.map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.kelas} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jurusan">Jurusan *</Label>
                <Select
                  value={data.jurusan}
                  onValueChange={(value) => setData('jurusan', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jurusan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IF">IF (Informatika)</SelectItem>
                    <SelectItem value="SI">SI (Sistem Informasi)</SelectItem>
                  </SelectContent>
                </Select>
                <InputError message={errors.jurusan} />
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
      <Dialog open={!!editingKelas} onOpenChange={(open) => !open && setEditingKelas(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kelas</DialogTitle>
            <DialogDescription>
              Perbarui data kelas
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-kelas">Semester *</Label>
                <Select
                  value={data.kelas}
                  onValueChange={(value) => setData('kelas', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSemesters.map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.kelas} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-jurusan">Jurusan *</Label>
                <Select
                  value={data.jurusan}
                  onValueChange={(value) => setData('jurusan', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jurusan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IF">IF (Informatika)</SelectItem>
                    <SelectItem value="SI">SI (Sistem Informasi)</SelectItem>
                  </SelectContent>
                </Select>
                <InputError message={errors.jurusan} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingKelas(null)}
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
