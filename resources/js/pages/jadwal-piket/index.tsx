import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  CalendarDays,
  Users,
  RotateCcw,
  UserCheck,
  UserX,
  Clock,
  Sparkles,
  Edit3,
  ArrowRightLeft,
  Save
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User as AuthUser } from '@/types';
import { toast } from 'sonner';
import { useState } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  prodi: string;
  semester: number;
  piket_day: string | null;
}

interface JadwalPiket {
  senin: User[];
  selasa: User[];
  rabu: User[];
  kamis: User[];
  jumat: User[];
}

interface Stats {
  total_aslab: number;
  assigned: number;
  unassigned: number;
}

interface Props {
  jadwalPiket: JadwalPiket;
  allAslabs: User[];
  stats: Stats;
}

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Jadwal Piket',
  }
];

const dayNames = {
  senin: 'Senin',
  selasa: 'Selasa',
  rabu: 'Rabu',
  kamis: 'Kamis',
  jumat: 'Jumat',
};

const dayColors = {
  senin: 'from-blue-500 to-blue-600',
  selasa: 'from-green-500 to-green-600',
  rabu: 'from-purple-500 to-purple-600',
  kamis: 'from-orange-500 to-orange-600',
  jumat: 'from-pink-500 to-pink-600',
};

const dayIcons = {
  senin: '🌅',
  selasa: '🌿',
  rabu: '💜',
  kamis: '🧡',
  jumat: '🌸',
};

export default function JadwalPiketIndex({ jadwalPiket, allAslabs, stats }: Props) {
  const { post, processing } = useForm();
  const { auth } = usePage<{ auth: { user: AuthUser } }>().props;
  const currentUser = auth.user;
  const swapForm = useForm({
    user_id: '',
    new_piket_day: '',
  });
  const [selectedAslab, setSelectedAslab] = useState<User | null>(null);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [newPiketDay, setNewPiketDay] = useState('');

  const handleGenerateAuto = () => {
    toast('Generate Jadwal Otomatis', {
      description: 'Apakah Anda yakin ingin generate jadwal piket otomatis? Jadwal yang ada akan direset.',
      action: {
        label: 'Ya, Generate',
        onClick: () => {
          post('/jadwal-piket/generate', {
            onSuccess: () => {
              toast.success('Jadwal piket berhasil di-generate secara otomatis!');
            },
            onError: () => {
              toast.error('Gagal generate jadwal piket');
            }
          });
        },
      },
      cancel: {
        label: 'Batal',
        onClick: () => toast.dismiss(),
      },
    });
  };

  const handleReset = () => {
    toast('Reset Jadwal Piket', {
      description: 'Apakah Anda yakin ingin reset semua jadwal piket? Tindakan ini tidak dapat dibatalkan.',
      action: {
        label: 'Ya, Reset',
        onClick: () => {
          post('/jadwal-piket/reset', {
            onSuccess: () => {
              toast.success('Semua jadwal piket berhasil direset!');
            },
            onError: () => {
              toast.error('Gagal reset jadwal piket');
            }
          });
        },
      },
      cancel: {
        label: 'Batal',
        onClick: () => toast.dismiss(),
      },
    });
  };

  const handleSwapSchedule = (aslab: User) => {
    setSelectedAslab(aslab);
    setIsSwapDialogOpen(true);
    setNewPiketDay('');
  };

  const handleSaveSwap = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAslab || !newPiketDay) return;

    swapForm.transform((data) => ({
      ...data,
      user_id: selectedAslab.id,
      new_piket_day: newPiketDay,
    }));

    swapForm.post('/jadwal-piket/swap', {
      onSuccess: () => {
        toast.success('Jadwal piket berhasil diubah!');
        setIsSwapDialogOpen(false);
        setSelectedAslab(null);
        setNewPiketDay('');
      },
      onError: () => {
        toast.error('Gagal mengubah jadwal piket');
      }
    });
  };

  const getAvailableDays = () => {
    if (!selectedAslab?.piket_day) return Object.keys(dayNames);
    return Object.keys(dayNames).filter(day => day !== selectedAslab.piket_day);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Jadwal Piket" />

      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CalendarDays className="h-8 w-8" />
              Jadwal Piket
            </h1>
            <p className="text-muted-foreground">
              Kelola jadwal piket asisten laboratorium
            </p>
          </div>
          {/* Only show buttons for admin */}
          {currentUser.role === 'admin' && (
            <div className="flex gap-2">
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={processing}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              <Button
                onClick={handleGenerateAuto}
                disabled={processing}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Otomatis
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-50">Total Aslab</CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_aslab}</div>
              <p className="text-xs text-blue-100">Aslab aktif</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-50">Sudah Dijadwal</CardTitle>
              <UserCheck className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.assigned}</div>
              <p className="text-xs text-green-100">Memiliki jadwal piket</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-50">Belum Dijadwal</CardTitle>
              <UserX className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unassigned}</div>
              <p className="text-xs text-orange-100">Belum memiliki jadwal</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Schedule Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Jadwal Piket Mingguan
            </CardTitle>
            <CardDescription>
              Pembagian jadwal piket aslab untuk setiap hari dalam seminggu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* First Row: Senin - Rabu */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(jadwalPiket)
                  .filter(([day]) => ['senin', 'selasa', 'rabu'].includes(day))
                  .map(([day, aslabs]) => (
                    <Card key={day} className={`bg-gradient-to-br ${dayColors[day as keyof typeof dayColors]} border-0 text-white min-h-[200px]`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-center text-white flex items-center justify-center gap-2">
                          <span className="text-xl">{dayIcons[day as keyof typeof dayIcons]}</span>
                          {dayNames[day as keyof typeof dayNames]}
                        </CardTitle>
                        <Badge variant="secondary" className="w-fit mx-auto bg-white/20 text-white border-0">
                          {aslabs.length} Aslab
                        </Badge>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {aslabs.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-white/70 text-sm">Belum ada aslab</p>
                            </div>
                          ) : (
                            aslabs.map((aslab: User) => (
                              <div key={aslab.id} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-white/20 text-white">
                                    {getInitials(aslab.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white text-sm truncate">
                                    {aslab.name}
                                  </p>
                                  <p className="text-white/70 text-xs">
                                    {aslab.prodi} • Sem {aslab.semester}
                                  </p>
                                </div>
                                {/* Only show edit button for admin */}
                                {currentUser.role === 'admin' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                    onClick={() => handleSwapSchedule(aslab)}
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {/* Second Row: Kamis - Jumat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(jadwalPiket)
                  .filter(([day]) => ['kamis', 'jumat'].includes(day))
                  .map(([day, aslabs]) => (
                    <Card key={day} className={`bg-gradient-to-br ${dayColors[day as keyof typeof dayColors]} border-0 text-white min-h-[200px]`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-center text-white flex items-center justify-center gap-2">
                          <span className="text-xl">{dayIcons[day as keyof typeof dayIcons]}</span>
                          {dayNames[day as keyof typeof dayNames]}
                        </CardTitle>
                        <Badge variant="secondary" className="w-fit mx-auto bg-white/20 text-white border-0">
                          {aslabs.length} Aslab
                        </Badge>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {aslabs.length === 0 ? (
                            <div className="text-center py-4">
                              <p className="text-white/70 text-sm">Belum ada aslab</p>
                            </div>
                          ) : (
                            aslabs.map((aslab: User) => (
                              <div key={aslab.id} className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs bg-white/20 text-white">
                                    {getInitials(aslab.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-white text-sm truncate">
                                    {aslab.name}
                                  </p>
                                  <p className="text-white/70 text-xs">
                                    {aslab.prodi} • Sem {aslab.semester}
                                  </p>
                                </div>
                                {/* Only show edit button for admin */}
                                {currentUser.role === 'admin' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
                                    onClick={() => handleSwapSchedule(aslab)}
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unassigned Aslabs */}
        {stats.unassigned > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <UserX className="h-5 w-5" />
                Aslab Belum Dijadwal ({stats.unassigned})
              </CardTitle>
              <CardDescription>
                Aslab yang belum memiliki jadwal piket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allAslabs
                  .filter(aslab => !aslab.piket_day)
                  .map((aslab) => (
                    <Card key={aslab.id} className="border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-orange-100 text-orange-600">
                              {getInitials(aslab.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {aslab.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {aslab.prodi} • Sem {aslab.semester}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog untuk Swap Jadwal */}
      <Dialog open={isSwapDialogOpen} onOpenChange={setIsSwapDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Ubah Jadwal Piket
            </DialogTitle>
            <DialogDescription>
              Ubah jadwal piket untuk {selectedAslab?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSwap} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-day">Jadwal Saat Ini</Label>
              <div className="p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{selectedAslab?.piket_day ? dayIcons[selectedAslab.piket_day as keyof typeof dayIcons] : '📅'}</span>
                  <span className="font-medium">
                    {selectedAslab?.piket_day ? dayNames[selectedAslab.piket_day as keyof typeof dayNames] : 'Belum dijadwal'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-day">Jadwal Baru</Label>
              <Select value={newPiketDay} onValueChange={setNewPiketDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih hari baru" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableDays().map((day) => (
                    <SelectItem key={day} value={day}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{dayIcons[day as keyof typeof dayIcons]}</span>
                        <span>{dayNames[day as keyof typeof dayNames]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSwapDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={!newPiketDay || swapForm.processing}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {swapForm.processing ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
