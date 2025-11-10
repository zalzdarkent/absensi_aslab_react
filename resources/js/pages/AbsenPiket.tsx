import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, User, UserCheck, UserX, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { UserCombobox } from '@/components/ui/user-combobox';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  prodi: string;
  semester: number;
}

interface AttendanceStatus {
  check_in: string | null;
  check_out: string | null;
  check_in_method: string | null;
  check_out_method: string | null;
}

interface Props {
  aslabs: User[];
  todayAttendances: Record<string, AttendanceStatus>;
  flash?: {
    success?: string;
    error?: string;
  };
}

interface AttendanceFormData {
  user_id: string;
  type: 'check_in' | 'check_out';
  notes: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Absen Piket',
    }
]

export default function AbsenPiket({ aslabs, todayAttendances, flash }: Props) {
  const [selectedUser, setSelectedUser] = useState<string>('');

  const { data, setData, post, processing, errors, reset } = useForm<AttendanceFormData>({
    user_id: '',
    type: 'check_in',
    notes: '',
  });

  // Handle flash messages from Laravel
  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  // Create columns for the data table
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Nama Aslab',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-sm text-muted-foreground">{user.prodi} - Sem {user.semester}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'prodi',
      header: 'Program Studi',
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-col">
            <span>{user.prodi}</span>
            <span className="text-sm text-muted-foreground">Semester {user.semester}</span>
          </div>
        );
      },
    },
    {
      id: 'check_in_status',
      header: 'Check In',
      cell: ({ row }) => {
        const user = row.original;
        const attendance = todayAttendances[user.id];

        if (attendance?.check_in) {
          return (
            <div className="flex flex-col">
              <Badge variant="default" className="w-fit">
                <Clock className="w-3 h-3 mr-1" />
                {attendance.check_in}
              </Badge>
              <span className="text-xs text-muted-foreground mt-1">
                {attendance.check_in_method}
              </span>
            </div>
          );
        }

        return (
          <Badge variant="outline" className="w-fit">
            <UserX className="w-3 h-3 mr-1" />
            Belum Check In
          </Badge>
        );
      },
    },
    {
      id: 'check_out_status',
      header: 'Check Out',
      cell: ({ row }) => {
        const user = row.original;
        const attendance = todayAttendances[user.id];

        if (attendance?.check_out) {
          return (
            <div className="flex flex-col">
              <Badge variant="secondary" className="w-fit">
                <Clock className="w-3 h-3 mr-1" />
                {attendance.check_out}
              </Badge>
              <span className="text-xs text-muted-foreground mt-1">
                {attendance.check_out_method}
              </span>
            </div>
          );
        }

        if (attendance?.check_in) {
          return (
            <Badge variant="outline" className="w-fit text-orange-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Belum Check Out
            </Badge>
          );
        }

        return (
          <Badge variant="outline" className="w-fit">
            <UserX className="w-3 h-3 mr-1" />
            Belum Check Out
          </Badge>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const user = row.original;
        const attendance = todayAttendances[user.id];

        if (attendance?.check_out) {
          return (
            <Badge variant="outline" className="w-fit text-green-600 border-green-600">
              <UserCheck className="w-3 h-3 mr-1" />
              Sudah Pulang
            </Badge>
          );
        }

        if (attendance?.check_in) {
          return (
            <Badge variant="default" className="w-fit bg-blue-600">
              <User className="w-3 h-3 mr-1" />
              Sedang di Lab
            </Badge>
          );
        }

        return (
          <Badge variant="outline" className="w-fit text-red-600 border-red-600">
            <UserX className="w-3 h-3 mr-1" />
            Belum Datang
          </Badge>
        );
      },
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.user_id) {
      toast.error('Pilih aslab terlebih dahulu');
      return;
    }

    post('/absen-piket', {
      onSuccess: () => {
        // Success message will be handled by flash message
        reset();
        setSelectedUser('');
      },
      onError: (errors) => {
        console.log('Errors received:', errors);
        // Handle general error (for existing attendance, check-in required, etc.)
        if (errors.general) {
          toast.error(errors.general);
        }
        // Handle specific field errors
        else if (errors.user_id) {
          toast.error(errors.user_id);
        }
        // Handle any other errors
        else if (typeof errors === 'object' && errors !== null) {
          const errorMessages = Object.values(errors);
          if (errorMessages.length > 0) {
            toast.error(errorMessages[0] as string);
          }
        } else {
          toast.error('Terjadi kesalahan');
        }
      },
    });
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    setData('user_id', userId);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Absen Piket Manual" />

      <div className="space-y-6 py-4 sm:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              Absen Piket Manual
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Kelola absensi manual untuk aslab yang lupa membawa RFID card
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
            <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="whitespace-nowrap">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {/* Manual Attendance Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              Form Absen Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Selection */}
                <div className="space-y-2">
                  <Label htmlFor="user_id">Pilih Aslab</Label>
                  <UserCombobox
                    value={selectedUser}
                    onValueChange={handleUserSelect}
                    placeholder="Cari dan pilih aslab..."
                    users={aslabs}
                  />
                  {errors.user_id && (
                    <p className="text-sm text-red-600">{errors.user_id}</p>
                  )}
                </div>

                {/* Attendance Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Jenis Absensi</Label>
                  <Select
                    value={data.type}
                    onValueChange={(value: 'check_in' | 'check_out') => setData('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check_in">Check In</SelectItem>
                      <SelectItem value="check_out">Check Out</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-sm text-red-600">{errors.type}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Masukkan catatan absensi manual..."
                  value={data.notes}
                  onChange={(e) => setData('notes', e.target.value)}
                  className="min-h-[80px]"
                />
                {errors.notes && (
                  <p className="text-sm text-red-600">{errors.notes}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={processing || !selectedUser}
                  className="w-full sm:w-auto min-w-[120px]"
                  size="default"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Menyimpan...</span>
                    </div>
                  ) : (
                    <span className="text-sm">
                      Submit {data.type === 'check_in' ? 'Check In' : 'Check Out'}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Attendance Status Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
              Status Absensi Hari Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={aslabs}
              searchPlaceholder="Cari nama aslab..."
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
