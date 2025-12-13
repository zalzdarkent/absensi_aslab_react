import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Check, ChevronsUpDown, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { createAbsensiPraktikumColumns, type AbsensiPraktikum } from '@/components/tables/absensi-praktikum-columns';
import InputError from '@/components/input-error';
import { FormEvent, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface Aslab {
  id: number;
  name: string;
}

interface Dosen {
  id: number;
  nama: string;
  display_name: string;
}

interface KelasOption {
  id: number;
  kelas: string;
  jurusan: string;
}

interface Props {
  absensis: AbsensiPraktikum[];
  aslabs: Aslab[];
  dosens: Dosen[];
  kelasOptions: KelasOption[];
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
    title: 'Absensi',
  },
];

// Generate pertemuan options
const pertemuanOptions = Array.from({ length: 14 }, (_, i) => {
  const num = i + 1;
  let label = `Pertemuan ${num}`;

  if (num === 6) {
    label = 'Pertemuan 6 (UTS)';
  } else if (num === 14) {
    label = 'Pertemuan 14 (UAS)';
  }

  return {
    value: num.toString(),
    label,
  };
});

export default function AbsensiPraktikumIndex({ absensis, aslabs, dosens, kelasOptions, success, error }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAbsensi, setEditingAbsensi] = useState<AbsensiPraktikum | null>(null);
  const [openAslabCombobox, setOpenAslabCombobox] = useState(false);
  const [openDosenCombobox, setOpenDosenCombobox] = useState(false);
  const [openKelasCombobox, setOpenKelasCombobox] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

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
    aslab_id: '',
    tanggal: '',
    dosen_praktikum_id: '',
    pertemuan: '',
    sebagai: 'instruktur' as 'instruktur' | 'asisten',
    kehadiran_dosen: 'hadir' as 'hadir' | 'tidak_hadir',
    kelas_id: '',
  });

  const openEditModal = (absensi: AbsensiPraktikum) => {
    setData({
      aslab_id: absensi.aslab.id.toString(),
      tanggal: absensi.tanggal,
      dosen_praktikum_id: absensi.dosen_praktikum.id.toString(),
      pertemuan: absensi.pertemuan,
      sebagai: absensi.sebagai as 'instruktur' | 'asisten',
      kehadiran_dosen: absensi.kehadiran_dosen as 'hadir' | 'tidak_hadir',
      kelas_id: absensi.kelas.id.toString(),
    });
    setEditingAbsensi(absensi);
  };

  const columns = createAbsensiPraktikumColumns(openEditModal);

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    post('/absensi-praktikum/absensi', {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        reset();
      },
    });
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingAbsensi) {
      put(`/absensi-praktikum/absensi/${editingAbsensi.id}`, {
        onSuccess: () => {
          setEditingAbsensi(null);
          reset();
        },
      });
    }
  };

  const openCreateModal = () => {
    reset();
    setData('sebagai', 'instruktur');
    setData('kehadiran_dosen', 'hadir');
    setOpenAslabCombobox(false);
    setOpenDosenCombobox(false);
    setOpenKelasCombobox(false);
    setOpenCalendar(false);
    setIsCreateModalOpen(true);
  };

  const getSelectedAslabName = () => {
    if (!data.aslab_id) return '';
    const aslab = aslabs.find(a => a.id === parseInt(data.aslab_id));
    return aslab?.name || '';
  };

  const getSelectedDosenName = () => {
    if (!data.dosen_praktikum_id) return '';
    const dosen = dosens.find(d => d.id === parseInt(data.dosen_praktikum_id));
    return dosen?.display_name || '';
  };

  const getSelectedKelasName = () => {
    if (!data.kelas_id) return '';
    const kelas = kelasOptions.find(k => k.id === parseInt(data.kelas_id));
    return kelas ? `Kelas ${kelas.kelas} - ${kelas.jurusan}` : '';
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Absensi Praktikum" />

      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Absensi Praktikum</h1>
            <p className="text-muted-foreground">
              Kelola data absensi praktikum aslab
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Absensi
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daftar Absensi Praktikum</CardTitle>
            <CardDescription>
              Total: {absensis.length} absensi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={absensis}
              searchPlaceholder="Cari aslab, dosen, atau kelas..."
              filename="absensi-praktikum"
            />
          </CardContent>
        </Card>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Absensi Praktikum</DialogTitle>
            <DialogDescription>
              Isi form di bawah untuk menambahkan data absensi praktikum
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit}>
            <div className="space-y-4 py-4">
              {/* Aslab Combobox */}
              <div className="space-y-2">
                <Label>Aslab *</Label>
                <Popover open={openAslabCombobox} onOpenChange={setOpenAslabCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAslabCombobox}
                      className="w-full justify-between"
                    >
                      {getSelectedAslabName() || "Pilih aslab..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command className="[&_[cmdk-group]]:px-0">
                      <CommandInput placeholder="Cari aslab..." />
                      <CommandList className="max-w-none">
                        <CommandEmpty>Aslab tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {aslabs.map((aslab) => (
                            <CommandItem
                              key={aslab.id}
                              value={aslab.name}
                              onSelect={() => {
                                setData('aslab_id', aslab.id.toString());
                                setOpenAslabCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.aslab_id === aslab.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {aslab.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <InputError message={errors.aslab_id} />
              </div>

              {/* Tanggal Date Picker */}
              <div className="space-y-2">
                <Label>Tanggal *</Label>
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between font-normal",
                        !data.tanggal && "text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.tanggal ? (
                          format(new Date(data.tanggal), "PPP", { locale: localeId })
                        ) : (
                          "Pilih tanggal"
                        )}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.tanggal ? new Date(data.tanggal) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setData('tanggal', format(date, 'yyyy-MM-dd'));
                          setOpenCalendar(false);
                        }
                      }}
                      locale={localeId}
                    />
                  </PopoverContent>
                </Popover>
                <InputError message={errors.tanggal} />
              </div>

              {/* Dosen Combobox */}
              <div className="space-y-2">
                <Label>Dosen *</Label>
                <Popover open={openDosenCombobox} onOpenChange={setOpenDosenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDosenCombobox}
                      className="w-full justify-between"
                    >
                      {getSelectedDosenName() || "Pilih dosen..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command className="[&_[cmdk-group]]:px-0">
                      <CommandInput placeholder="Cari dosen..." />
                      <CommandList className="max-w-none">
                        <CommandEmpty>Dosen tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {dosens.map((dosen) => (
                            <CommandItem
                              key={dosen.id}
                              value={dosen.display_name}
                              onSelect={() => {
                                setData('dosen_praktikum_id', dosen.id.toString());
                                setOpenDosenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.dosen_praktikum_id === dosen.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {dosen.display_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <InputError message={errors.dosen_praktikum_id} />
              </div>

              {/* Pertemuan Select */}
              <div className="space-y-2">
                <Label>Pertemuan *</Label>
                <Select
                  value={data.pertemuan}
                  onValueChange={(value) => setData('pertemuan', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pertemuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {pertemuanOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.pertemuan} />
              </div>

              {/* Sebagai Radio Group */}
              <div className="space-y-2">
                <Label>Sebagai *</Label>
                <RadioGroup
                  value={data.sebagai}
                  onValueChange={(value) => setData('sebagai', value as 'instruktur' | 'asisten')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="instruktur" id="instruktur" />
                    <Label htmlFor="instruktur" className="font-normal cursor-pointer">
                      Instruktur
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asisten" id="asisten" />
                    <Label htmlFor="asisten" className="font-normal cursor-pointer">
                      Asisten
                    </Label>
                  </div>
                </RadioGroup>
                <InputError message={errors.sebagai} />
              </div>

              {/* Kehadiran Dosen Radio Group */}
              <div className="space-y-2">
                <Label>Kehadiran Dosen *</Label>
                <RadioGroup
                  value={data.kehadiran_dosen}
                  onValueChange={(value) => setData('kehadiran_dosen', value as 'hadir' | 'tidak_hadir')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hadir" id="hadir" />
                    <Label htmlFor="hadir" className="font-normal cursor-pointer">
                      Hadir
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tidak_hadir" id="tidak_hadir" />
                    <Label htmlFor="tidak_hadir" className="font-normal cursor-pointer">
                      Tidak Hadir
                    </Label>
                  </div>
                </RadioGroup>
                <InputError message={errors.kehadiran_dosen} />
              </div>

              {/* Kelas Combobox */}
              <div className="space-y-2">
                <Label>Kelas *</Label>
                <Popover open={openKelasCombobox} onOpenChange={setOpenKelasCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openKelasCombobox}
                      className="w-full justify-between"
                    >
                      {getSelectedKelasName() || "Pilih kelas..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command className="[&_[cmdk-group]]:px-0">
                      <CommandInput placeholder="Cari kelas..." />
                      <CommandList className="max-w-none">
                        <CommandEmpty>Kelas tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {kelasOptions.map((kelas) => (
                            <CommandItem
                              key={kelas.id}
                              value={`Kelas ${kelas.kelas} - ${kelas.jurusan}`}
                              onSelect={() => {
                                setData('kelas_id', kelas.id.toString());
                                setOpenKelasCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.kelas_id === kelas.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              Kelas {kelas.kelas} - {kelas.jurusan}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <InputError message={errors.kelas_id} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  reset();
                }}
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
      <Dialog open={!!editingAbsensi} onOpenChange={(open) => {
        if (!open) {
          setEditingAbsensi(null);
          reset();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Absensi Praktikum</DialogTitle>
            <DialogDescription>
              Perbarui data absensi praktikum
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              {/* Same form fields as create modal */}
              {/* Aslab Combobox */}
              <div className="space-y-2">
                <Label>Aslab *</Label>
                <Popover open={openAslabCombobox} onOpenChange={setOpenAslabCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openAslabCombobox}
                      className="w-full justify-between"
                    >
                      {getSelectedAslabName() || "Pilih aslab..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command className="[&_[cmdk-group]]:px-0">
                      <CommandInput placeholder="Cari aslab..." />
                      <CommandList className="max-w-none">
                        <CommandEmpty>Aslab tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {aslabs.map((aslab) => (
                            <CommandItem
                              key={aslab.id}
                              value={aslab.name}
                              onSelect={() => {
                                setData('aslab_id', aslab.id.toString());
                                setOpenAslabCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.aslab_id === aslab.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {aslab.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <InputError message={errors.aslab_id} />
              </div>

              {/* Tanggal Date Picker */}
              <div className="space-y-2">
                <Label>Tanggal *</Label>
                <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-between font-normal",
                        !data.tanggal && "text-muted-foreground"
                      )}
                    >
                      <span className="flex items-center">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {data.tanggal ? (
                          format(new Date(data.tanggal), "PPP", { locale: localeId })
                        ) : (
                          "Pilih tanggal"
                        )}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={data.tanggal ? new Date(data.tanggal) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setData('tanggal', format(date, 'yyyy-MM-dd'));
                          setOpenCalendar(false);
                        }
                      }}
                      locale={localeId}
                    />
                  </PopoverContent>
                </Popover>
                <InputError message={errors.tanggal} />
              </div>

              {/* Dosen Combobox */}
              <div className="space-y-2">
                <Label>Dosen *</Label>
                <Popover open={openDosenCombobox} onOpenChange={setOpenDosenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openDosenCombobox}
                      className="w-full justify-between"
                    >
                      {getSelectedDosenName() || "Pilih dosen..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command className="[&_[cmdk-group]]:px-0">
                      <CommandInput placeholder="Cari dosen..." />
                      <CommandList className="max-w-none">
                        <CommandEmpty>Dosen tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {dosens.map((dosen) => (
                            <CommandItem
                              key={dosen.id}
                              value={dosen.display_name}
                              onSelect={() => {
                                setData('dosen_praktikum_id', dosen.id.toString());
                                setOpenDosenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.dosen_praktikum_id === dosen.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {dosen.display_name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <InputError message={errors.dosen_praktikum_id} />
              </div>

              {/* Pertemuan Select */}
              <div className="space-y-2">
                <Label>Pertemuan *</Label>
                <Select
                  value={data.pertemuan}
                  onValueChange={(value) => setData('pertemuan', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pertemuan" />
                  </SelectTrigger>
                  <SelectContent>
                    {pertemuanOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <InputError message={errors.pertemuan} />
              </div>

              {/* Sebagai Radio Group */}
              <div className="space-y-2">
                <Label>Sebagai *</Label>
                <RadioGroup
                  value={data.sebagai}
                  onValueChange={(value) => setData('sebagai', value as 'instruktur' | 'asisten')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="instruktur" id="edit-instruktur" />
                    <Label htmlFor="edit-instruktur" className="font-normal cursor-pointer">
                      Instruktur
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="asisten" id="edit-asisten" />
                    <Label htmlFor="edit-asisten" className="font-normal cursor-pointer">
                      Asisten
                    </Label>
                  </div>
                </RadioGroup>
                <InputError message={errors.sebagai} />
              </div>

              {/* Kehadiran Dosen Radio Group */}
              <div className="space-y-2">
                <Label>Kehadiran Dosen *</Label>
                <RadioGroup
                  value={data.kehadiran_dosen}
                  onValueChange={(value) => setData('kehadiran_dosen', value as 'hadir' | 'tidak_hadir')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hadir" id="edit-hadir" />
                    <Label htmlFor="edit-hadir" className="font-normal cursor-pointer">
                      Hadir
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tidak_hadir" id="edit-tidak_hadir" />
                    <Label htmlFor="edit-tidak_hadir" className="font-normal cursor-pointer">
                      Tidak Hadir
                    </Label>
                  </div>
                </RadioGroup>
                <InputError message={errors.kehadiran_dosen} />
              </div>

              {/* Kelas Combobox */}
              <div className="space-y-2">
                <Label>Kelas *</Label>
                <Popover open={openKelasCombobox} onOpenChange={setOpenKelasCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openKelasCombobox}
                      className="w-full justify-between"
                    >
                      {getSelectedKelasName() || "Pilih kelas..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command className="[&_[cmdk-group]]:px-0">
                      <CommandInput placeholder="Cari kelas..." />
                      <CommandList className="max-w-none">
                        <CommandEmpty>Kelas tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                          {kelasOptions.map((kelas) => (
                            <CommandItem
                              key={kelas.id}
                              value={`Kelas ${kelas.kelas} - ${kelas.jurusan}`}
                              onSelect={() => {
                                setData('kelas_id', kelas.id.toString());
                                setOpenKelasCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  data.kelas_id === kelas.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              Kelas {kelas.kelas} - {kelas.jurusan}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <InputError message={errors.kelas_id} />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setEditingAbsensi(null);
                  reset();
                }}
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
