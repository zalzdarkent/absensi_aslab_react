import { Head, useForm } from '@inertiajs/react';
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
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Check, ChevronsUpDown } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createDosenPraktikumColumns, type DosenPraktikum } from '@/components/tables/dosen-praktikum-columns';
import InputError from '@/components/input-error';
import { FormEvent, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MataKuliah {
  id: number;
  nama: string;
}

interface Props {
  dosens: DosenPraktikum[];
  mataKuliahs: MataKuliah[];
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
    title: 'Dosen',
  },
];

export default function DosenPraktikumIndex({ dosens, mataKuliahs, success, error }: Pick<Props, 'dosens' | 'mataKuliahs' | 'success' | 'error'>) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDosen, setEditingDosen] = useState<DosenPraktikum | null>(null);
  const [selectedMataKuliahs, setSelectedMataKuliahs] = useState<number[]>([]);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);

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
    nidn: '',
    mata_kuliah_ids: [] as number[],
  });

  const openEditModal = (dosen: DosenPraktikum) => {
    const mataKuliahIds = dosen.mata_kuliahs?.map((mk) => mk.id) || [];
    setData({
      nama: dosen.nama,
      nidn: dosen.nidn,
      mata_kuliah_ids: mataKuliahIds,
    });
    setSelectedMataKuliahs(mataKuliahIds);
    setEditingDosen(dosen);
  };

  const columns = createDosenPraktikumColumns(openEditModal);

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    post('/absensi-praktikum/dosen-praktikum', {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setSelectedMataKuliahs([]);
        reset();
      },
    });
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingDosen) {
      put(`/absensi-praktikum/dosen-praktikum/${editingDosen.id}`, {
        onSuccess: () => {
          setEditingDosen(null);
          setSelectedMataKuliahs([]);
          reset();
        },
      });
    }
  };

  const openCreateModal = () => {
    reset();
    setSelectedMataKuliahs([]);
    setOpenCombobox(false);
    setShowAllBadges(false);
    setIsCreateModalOpen(true);
  };

  const toggleMataKuliah = (mataKuliahId: number) => {
    setSelectedMataKuliahs((prev) => {
      const newSelection = prev.includes(mataKuliahId)
        ? prev.filter((id) => id !== mataKuliahId)
        : [...prev, mataKuliahId];

      setData('mata_kuliah_ids', newSelection);
      return newSelection;
    });
  };

  const removeMataKuliah = (mataKuliahId: number) => {
    setSelectedMataKuliahs((prev) => {
      const newSelection = prev.filter((id) => id !== mataKuliahId);
      setData('mata_kuliah_ids', newSelection);
      return newSelection;
    });
  };

  //   const getSelectedMataKuliahNames = () => {
  //     return mataKuliahs
  //       .filter((mk) => selectedMataKuliahs.includes(mk.id))
  //       .map((mk) => mk.nama);
  //   };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Dosen Praktikum" />

      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dosen Praktikum</h1>
            <p className="text-muted-foreground">
              Kelola data dosen praktikum
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Dosen
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Dosen Praktikum</CardTitle>
            <CardDescription>
              Total: {dosens.length} dosen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={dosens}
              searchPlaceholder="Cari nama atau NIDN..."
              filename="dosen-praktikum"
            />
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Dosen Praktikum</DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk menambahkan dosen praktikum baru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Dosen *</Label>
                <Input
                  id="nama"
                  type="text"
                  value={data.nama}
                  onChange={(e) => setData('nama', e.target.value)}
                  placeholder="Contoh: Dr. Ahmad Suryadi"
                  required
                />
                <InputError message={errors.nama} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nidn">NIDN *</Label>
                <Input
                  id="nidn"
                  type="text"
                  value={data.nidn}
                  onChange={(e) => setData('nidn', e.target.value)}
                  placeholder="Contoh: 0123456789"
                  required
                />
                <InputError message={errors.nidn} />
              </div>

              <div className="space-y-2">
                <Label>Mata Kuliah yang Diampu *</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between h-auto min-h-10 hover:bg-transparent"
                    >
                      <div className="flex flex-wrap items-center gap-1 pr-2.5 text-left">
                        {selectedMataKuliahs.length > 0 ? (
                          <>
                            {mataKuliahs
                              .filter((mk) => selectedMataKuliahs.includes(mk.id))
                              .slice(0, showAllBadges ? undefined : 2)
                              .map((mk) => (
                                <Badge key={mk.id} variant="secondary" className="rounded-sm px-2 py-0.5 text-xs font-normal">
                                  {mk.nama}
                                  <div
                                    className="ml-1.5 rounded-sm hover:bg-muted-foreground/20 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeMataKuliah(mk.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </div>
                                </Badge>
                              ))}
                            {selectedMataKuliahs.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="rounded-sm px-2 py-0.5 text-xs font-normal cursor-pointer hover:bg-secondary/80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAllBadges(!showAllBadges);
                                }}
                              >
                                {showAllBadges ? 'Show Less' : `+${selectedMataKuliahs.length - 2} more`}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Pilih mata kuliah...</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0" align="start">
                    <Command className="[&_[cmdk-group]]:px-0">
                      <CommandInput placeholder="Cari mata kuliah..." />
                      <CommandList className="max-w-none">
                        <CommandEmpty>Mata kuliah tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {mataKuliahs.map((mk) => (
                            <CommandItem
                              key={mk.id}
                              value={mk.nama}
                              onSelect={() => toggleMataKuliah(mk.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedMataKuliahs.includes(mk.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {mk.nama}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <InputError message={errors.mata_kuliah_ids} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setSelectedMataKuliahs([]);
                  setShowAllBadges(false);
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={processing || selectedMataKuliahs.length === 0}>
                {processing ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingDosen} onOpenChange={(open) => {
        if (!open) {
          setEditingDosen(null);
          setSelectedMataKuliahs([]);
          setOpenCombobox(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Dosen Praktikum</DialogTitle>
            <DialogDescription>
              Perbarui data dosen praktikum
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-nama">Nama Dosen *</Label>
                <Input
                  id="edit-nama"
                  type="text"
                  value={data.nama}
                  onChange={(e) => setData('nama', e.target.value)}
                  placeholder="Contoh: Dr. Ahmad Suryadi"
                  required
                />
                <InputError message={errors.nama} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nidn">NIDN *</Label>
                <Input
                  id="edit-nidn"
                  type="text"
                  value={data.nidn}
                  onChange={(e) => setData('nidn', e.target.value)}
                  placeholder="Contoh: 0123456789"
                  required
                />
                <InputError message={errors.nidn} />
              </div>

              <div className="space-y-2">
                <Label>Mata Kuliah yang Diampu *</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between h-auto min-h-10 hover:bg-transparent"
                    >
                      <div className="flex flex-wrap items-center gap-1 pr-2.5 text-left">
                        {selectedMataKuliahs.length > 0 ? (
                          <>
                            {mataKuliahs
                              .filter((mk) => selectedMataKuliahs.includes(mk.id))
                              .slice(0, showAllBadges ? undefined : 2)
                              .map((mk) => (
                                <Badge key={mk.id} variant="secondary" className="rounded-sm px-2 py-0.5 text-xs font-normal">
                                  {mk.nama}
                                  <div
                                    className="ml-1.5 rounded-sm hover:bg-muted-foreground/20 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeMataKuliah(mk.id);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </div>
                                </Badge>
                              ))}
                            {selectedMataKuliahs.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="rounded-sm px-2 py-0.5 text-xs font-normal cursor-pointer hover:bg-secondary/80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAllBadges(!showAllBadges);
                                }}
                              >
                                {showAllBadges ? 'Show Less' : `+${selectedMataKuliahs.length - 2} more`}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Pilih mata kuliah...</span>
                        )}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0" align="start">
                    <Command className="[&_[cmdk-group]]:px-0">
                      <CommandInput placeholder="Cari mata kuliah..." />
                      <CommandList className="max-w-none">
                        <CommandEmpty>Mata kuliah tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {mataKuliahs.map((mk) => (
                            <CommandItem
                              key={mk.id}
                              value={mk.nama}
                              onSelect={() => toggleMataKuliah(mk.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedMataKuliahs.includes(mk.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {mk.nama}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>



                <InputError message={errors.mata_kuliah_ids} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingDosen(null);
                  setSelectedMataKuliahs([]);
                  setShowAllBadges(false);
                }}
              >
                Batal
              </Button>
              <Button type="submit" disabled={processing || selectedMataKuliahs.length === 0}>
                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
