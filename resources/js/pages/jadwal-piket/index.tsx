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
  Save,
  GripVertical
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, User as AuthUser } from '@/types';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface User {
  id: number;
  name: string;
  email: string;
  prodi: string;
  semester: number;
  piket_day: string | null;
}

interface Props {
  allAslabs: User[];
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

// Draggable Aslab Component
interface DraggableAslabProps {
  aslab: User;
  currentDay?: string;
  isAdmin: boolean;
  onEdit: (aslab: User) => void;
}

function DraggableAslab({ aslab, currentDay, isAdmin, onEdit }: DraggableAslabProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `aslab-${aslab.id}`,
    data: {
      type: 'aslab',
      aslab: aslab,
      currentDay: currentDay,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Check if this aslab has pending changes
  const hasPendingChange = false; // Will be passed as prop later

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 bg-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      } ${isAdmin ? 'hover:bg-white/20' : ''} ${
        hasPendingChange ? 'ring-2 ring-yellow-400/50' : ''
      }`}
      {...attributes}
      {...listeners}
    >
      {isAdmin && (
        <GripVertical className="h-4 w-4 text-white/40" />
      )}
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs bg-white/20 text-white">
          {aslab.name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm truncate">
          {aslab.name}
          {hasPendingChange && (
            <span className="ml-1 text-yellow-300 text-xs">●</span>
          )}
        </p>
        <p className="text-white/70 text-xs">
          {aslab.prodi} • Sem {aslab.semester}
        </p>
      </div>
      {isAdmin && (
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-white/60 hover:text-white hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(aslab);
          }}
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Droppable Day Card Component
interface DroppableDayCardProps {
  day: string;
  aslabs: User[];
  isAdmin: boolean;
  onEdit: (aslab: User) => void;
}

function DroppableDayCard({ day, aslabs, isAdmin, onEdit }: DroppableDayCardProps) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: `day-${day}`,
    data: {
      type: 'day',
      day: day,
    },
  });

  return (
    <Card
      ref={setNodeRef}
      className={`bg-gradient-to-br ${dayColors[day as keyof typeof dayColors]} border-0 text-white min-h-[200px] transition-all ${
        isOver ? 'ring-4 ring-white/50 scale-105' : ''
      }`}
    >
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
        <SortableContext
          items={aslabs.map(aslab => `aslab-${aslab.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-[100px]">
            {aslabs.length === 0 ? (
              <div className={`text-center py-4 border-2 border-dashed border-white/30 rounded-lg transition-all ${
                isOver ? 'border-white/60 bg-white/10' : ''
              }`}>
                <p className="text-white/70 text-sm">
                  {isOver ? 'Lepaskan disini' : 'Belum ada aslab'}
                </p>
              </div>
            ) : (
              aslabs.map((aslab: User) => (
                <DraggableAslab
                  key={aslab.id}
                  aslab={aslab}
                  currentDay={day}
                  isAdmin={isAdmin}
                  onEdit={onEdit}
                />
              ))
            )}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

// Unassigned Aslab Card Component
interface UnassignedAslabCardProps {
  aslab: User;
  isAdmin: boolean;
}

function UnassignedAslabCard({ aslab, isAdmin }: UnassignedAslabCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `aslab-${aslab.id}`,
    data: {
      type: 'aslab',
      aslab: aslab,
      currentDay: null, // Belum ada jadwal
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`border-orange-200 transition-all ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      } ${isAdmin ? 'cursor-grab active:cursor-grabbing hover:shadow-lg' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {isAdmin && (
            <GripVertical className="h-4 w-4 text-orange-400" />
          )}
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-orange-100 text-orange-600">
              {aslab.name
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .slice(0, 2)}
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
  );
}

export default function JadwalPiketIndex({ allAslabs }: Props) {
  const { post, processing } = useForm();
  const { auth } = usePage<{ auth: { user: AuthUser } }>().props;
  const currentUser = auth.user;
  const swapForm = useForm({
    user_id: '',
    new_piket_day: '',
  });
  const batchUpdateForm = useForm({
    updates: [] as Array<{ user_id: number; new_piket_day: string | null }>,
  });

  const [selectedAslab, setSelectedAslab] = useState<User | null>(null);
  const [isSwapDialogOpen, setIsSwapDialogOpen] = useState(false);
  const [newPiketDay, setNewPiketDay] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Local state untuk preview perubahan
  const [localAllAslabs, setLocalAllAslabs] = useState(allAslabs);
  const [pendingChanges, setPendingChanges] = useState<Array<{ user_id: number; old_day: string | null; new_day: string | null; user_name: string }>>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Hitung localJadwalPiket berdasarkan localAllAslabs untuk mencegah duplikasi
  const localJadwalPiket = {
    senin: localAllAslabs.filter(aslab => aslab.piket_day === 'senin'),
    selasa: localAllAslabs.filter(aslab => aslab.piket_day === 'selasa'),
    rabu: localAllAslabs.filter(aslab => aslab.piket_day === 'rabu'),
    kamis: localAllAslabs.filter(aslab => aslab.piket_day === 'kamis'),
    jumat: localAllAslabs.filter(aslab => aslab.piket_day === 'jumat'),
  };

  // Sensor untuk drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // Handle drag end - hanya update local state
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !currentUser || currentUser.role !== 'admin') return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Jika drag aslab ke hari yang berbeda
    if (activeData?.type === 'aslab' && overData?.type === 'day') {
      const aslab = activeData.aslab;
      const targetDay = overData.day;
      const currentDay = activeData.currentDay;

      // Jangan lakukan apa-apa jika sudah di hari yang sama
      if (currentDay === targetDay) return;

      updateLocalSchedule(aslab.id, aslab.name, currentDay, targetDay);
    }

    // Jika drag dari unassigned ke hari tertentu
    if (activeData?.type === 'aslab' && !activeData.currentDay && overData?.type === 'day') {
      const aslab = activeData.aslab;
      const targetDay = overData.day;

      updateLocalSchedule(aslab.id, aslab.name, null, targetDay);
    }
  };

  // Function untuk update local state
  const updateLocalSchedule = (userId: number, userName: string, oldDay: string | null, newDay: string | null) => {
    // Update local all aslabs - ini akan otomatis update localJadwalPiket juga
    setLocalAllAslabs(prev =>
      prev.map(aslab =>
        aslab.id === userId
          ? { ...aslab, piket_day: newDay }
          : aslab
      )
    );

    // Add to pending changes
    setPendingChanges(prev => {
      const existing = prev.find(change => change.user_id === userId);
      if (existing) {
        // Update existing change
        return prev.map(change =>
          change.user_id === userId
            ? { ...change, new_day: newDay }
            : change
        );
      } else {
        // Add new change
        return [...prev, { user_id: userId, old_day: oldDay, new_day: newDay, user_name: userName }];
      }
    });

    setHasUnsavedChanges(true);

    // Hanya tampilkan toast jika ini adalah perubahan baru (bukan update dari existing change)
    const isNewChange = !pendingChanges.find(change => change.user_id === userId);
    if (isNewChange) {
      toast.success(`${userName} dipindah ke ${newDay ? dayNames[newDay as keyof typeof dayNames] : 'Belum dijadwal'} (belum disimpan)`, {
        description: 'Klik tombol "Simpan Perubahan" untuk menyimpan ke database'
      });
    }
  };  // Function untuk save semua perubahan sekaligus
  const handleSaveBatchChanges = () => {
    if (pendingChanges.length === 0) return;

    batchUpdateForm.transform((data) => ({
      ...data,
      updates: pendingChanges.map(change => ({
        user_id: change.user_id,
        new_piket_day: change.new_day,
      })),
    }));

    batchUpdateForm.post('/jadwal-piket/batch-update', {
      onSuccess: () => {
        toast.success(`${pendingChanges.length} perubahan jadwal berhasil disimpan!`);
        setPendingChanges([]);
        setHasUnsavedChanges(false);
        // Refresh data dari server
        window.location.reload();
      },
      onError: () => {
        toast.error('Gagal menyimpan perubahan jadwal');
      }
    });
  };

  // Function untuk reset perubahan ke state asli
  const handleResetChanges = () => {
    setLocalAllAslabs(allAslabs);
    setPendingChanges([]);
    setHasUnsavedChanges(false);
    toast.success('Perubahan dibatalkan');
  };

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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight flex items-center gap-2">
                  <CalendarDays className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8" />
                  <span>Jadwal Piket</span>
                </h1>
                {hasUnsavedChanges && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs w-fit">
                    {pendingChanges.length} perubahan belum disimpan
                  </Badge>
                )}
              </div>
              <div className="text-sm sm:text-base text-muted-foreground space-y-1">
                <p>Kelola jadwal piket asisten laboratorium</p>
                {currentUser.role === 'admin' && (
                  <p className="text-xs sm:text-sm text-blue-600">
                    💡 Tip: Drag & drop aslab untuk mengubah jadwal piket
                  </p>
                )}
              </div>
            </div>

            {/* Admin Action Buttons */}
            {currentUser.role === 'admin' && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Batch Update Buttons */}
                {hasUnsavedChanges && (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      onClick={handleResetChanges}
                      variant="outline"
                      size="sm"
                      className="flex-1 sm:flex-none text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">Batal</span>
                    </Button>
                    <Button
                      onClick={handleSaveBatchChanges}
                      size="sm"
                      disabled={batchUpdateForm.processing}
                      className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700"
                    >
                      <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-xs sm:text-sm">
                        {batchUpdateForm.processing ? 'Menyimpan...' : `Simpan (${pendingChanges.length})`}
                      </span>
                    </Button>
                  </div>
                )}

                {/* Original Buttons */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    disabled={processing || hasUnsavedChanges}
                    className="flex-1 sm:flex-none"
                  >
                    <RotateCcw className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Reset</span>
                  </Button>
                  <Button
                    onClick={handleGenerateAuto}
                    disabled={processing || hasUnsavedChanges}
                    size="sm"
                    className="flex-1 sm:flex-none bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <Sparkles className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Generate</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-blue-50">Total Aslab</CardTitle>
              <Users className="h-4 w-4 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{localAllAslabs.length}</div>
              <p className="text-xs text-blue-100">Aslab aktif</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-0 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-green-50">Sudah Dijadwal</CardTitle>
              <UserCheck className="h-4 w-4 text-green-200" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{localAllAslabs.filter(aslab => aslab.piket_day).length}</div>
              <p className="text-xs text-green-100">Memiliki jadwal piket</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-0 text-white sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-orange-50">Belum Dijadwal</CardTitle>
              <UserX className="h-4 w-4 text-orange-200" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{localAllAslabs.filter(aslab => !aslab.piket_day).length}</div>
              <p className="text-xs text-orange-100">Belum memiliki jadwal</p>
            </CardContent>
          </Card>
        </div>

          {/* Weekly Schedule Grid */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                Jadwal Piket Mingguan
              </CardTitle>
              <CardDescription className="text-sm">
                Pembagian jadwal piket aslab untuk setiap hari dalam seminggu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SortableContext
                items={[
                  ...Object.keys(localJadwalPiket).map(day => `day-${day}`),
                  ...Object.values(localJadwalPiket).flat().map(aslab => `aslab-${aslab.id}`)
                ]}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {/* Mobile: Stack all days vertically, Desktop: Grid layout */}
                  <div className="space-y-4 lg:space-y-0">
                    {/* First Row: Senin - Rabu */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(localJadwalPiket)
                        .filter(([day]) => ['senin', 'selasa', 'rabu'].includes(day))
                        .map(([day, aslabs]) => (
                          <DroppableDayCard
                            key={day}
                            day={day}
                            aslabs={aslabs}
                            isAdmin={currentUser.role === 'admin'}
                            onEdit={handleSwapSchedule}
                          />
                        ))}
                    </div>

                    {/* Second Row: Kamis - Jumat */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:max-w-2xl">
                      {Object.entries(localJadwalPiket)
                        .filter(([day]) => ['kamis', 'jumat'].includes(day))
                        .map(([day, aslabs]) => (
                          <DroppableDayCard
                            key={day}
                            day={day}
                            aslabs={aslabs}
                            isAdmin={currentUser.role === 'admin'}
                            onEdit={handleSwapSchedule}
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </SortableContext>
            </CardContent>
          </Card>

          {/* Unassigned Aslabs */}
          {localAllAslabs.filter(aslab => !aslab.piket_day).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-orange-600">
                  <div className="flex items-center gap-2">
                    <UserX className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-lg sm:text-xl">Aslab Belum Dijadwal</span>
                  </div>
                  <Badge variant="secondary" className="w-fit bg-orange-100 text-orange-800 text-xs">
                    {localAllAslabs.filter(aslab => !aslab.piket_day).length} orang
                  </Badge>
                </CardTitle>
                <CardDescription className="text-sm">
                  Aslab yang belum memiliki jadwal piket
                  {currentUser.role === 'admin' && (
                    <span className="block text-xs sm:text-sm text-blue-600 mt-1">
                      💡 Drag aslab ke hari yang diinginkan untuk memberi jadwal
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SortableContext
                  items={localAllAslabs
                    .filter(aslab => !aslab.piket_day)
                    .map(aslab => `aslab-${aslab.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {localAllAslabs
                      .filter(aslab => !aslab.piket_day)
                      .map((aslab) => (
                        <UnassignedAslabCard
                          key={aslab.id}
                          aslab={aslab}
                          isAdmin={currentUser.role === 'admin'}
                        />
                      ))}
                  </div>
                </SortableContext>
              </CardContent>
            </Card>
          )}

          {/* Pending Changes Card */}
          {pendingChanges.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-yellow-800">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-lg sm:text-xl">Perubahan Belum Disimpan</span>
                  </div>
                  <Badge variant="secondary" className="w-fit bg-yellow-200 text-yellow-800 text-xs">
                    {pendingChanges.length} perubahan
                  </Badge>
                </CardTitle>
                <CardDescription className="text-yellow-700 text-sm">
                  Perubahan berikut akan disimpan saat klik "Simpan Perubahan"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  {pendingChanges.map((change, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-yellow-100 text-yellow-800">
                            {getInitials(change.user_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{change.user_name}</p>
                          <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                            <span className="truncate">
                              {change.old_day ? dayNames[change.old_day as keyof typeof dayNames] : 'Belum dijadwal'}
                            </span>
                            <ArrowRightLeft className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">
                              {change.new_day ? dayNames[change.new_day as keyof typeof dayNames] : 'Belum dijadwal'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="bg-white rounded-lg shadow-xl p-3 opacity-90 rotate-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-gray-200 text-gray-600">
                    {/* Find active aslab */}
                    {(() => {
                      const allAslabsList = [
                        ...Object.values(localJadwalPiket).flat(),
                        ...localAllAslabs.filter(aslab => !aslab.piket_day)
                      ];
                      const activeAslab = allAslabsList.find(aslab => `aslab-${aslab.id}` === activeId);
                      return activeAslab ? getInitials(activeAslab.name) : '';
                    })()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {(() => {
                      const allAslabsList = [
                        ...Object.values(localJadwalPiket).flat(),
                        ...localAllAslabs.filter(aslab => !aslab.piket_day)
                      ];
                      const activeAslab = allAslabsList.find(aslab => `aslab-${aslab.id}` === activeId);
                      return activeAslab?.name || '';
                    })()}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
