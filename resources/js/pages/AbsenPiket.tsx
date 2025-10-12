import { Head, useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, User, UserCheck, UserX, AlertCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useState } from 'react';
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

export default function AbsenPiket({ aslabs, todayAttendances }: Props) {
  const [selectedUser, setSelectedUser] = useState<string>('');
  
  const { data, setData, post, processing, errors, reset } = useForm<AttendanceFormData>({
    user_id: '',
    type: 'check_in',
    notes: '',
  });

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

    const user = aslabs.find(u => u.id.toString() === data.user_id);
    const userName = user?.name || '';

    post('/absen-piket', {
      onSuccess: () => {
        toast.success(`Manual ${data.type} berhasil untuk ${userName}`);
        reset();
        setSelectedUser('');
      },
      onError: (errors) => {
        if (typeof errors === 'object' && errors !== null) {
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

  const selectedUserData = aslabs.find(user => user.id.toString() === selectedUser);
  const selectedUserAttendance = selectedUser ? todayAttendances[selectedUser] : null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Absen Piket Manual" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Absen Piket Manual</h1>
            <p className="text-muted-foreground">
              Kelola absensi manual untuk aslab yang lupa membawa RFID card
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="w-4 h-4" />
            {new Date().toLocaleDateString('id-ID', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Manual Attendance Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Form Absen Manual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Selection */}
                <div className="space-y-2">
                  <Label htmlFor="user_id">Pilih Aslab</Label>
                  <Select
                    value={selectedUser}
                    onValueChange={handleUserSelect}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih aslab..." />
                    </SelectTrigger>
                    <SelectContent>
                      {aslabs.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {user.prodi} - Sem {user.semester}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              {/* Selected User Info */}
              {selectedUserData && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Informasi Aslab Terpilih:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nama:</span>
                      <span className="ml-2 font-medium">{selectedUserData.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Program Studi:</span>
                      <span className="ml-2">{selectedUserData.prodi}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Semester:</span>
                      <span className="ml-2">{selectedUserData.semester}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Semester:</span>
                      <span className="ml-2">{selectedUserData.semester}</span>
                    </div>
                  </div>
                  
                  {/* Current Status */}
                  {selectedUserAttendance && (
                    <div className="mt-3 pt-3 border-t">
                      <h5 className="font-medium mb-2">Status Hari Ini:</h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedUserAttendance.check_in ? (
                          <Badge variant="default">
                            <Clock className="w-3 h-3 mr-1" />
                            Check In: {selectedUserAttendance.check_in}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Belum Check In</Badge>
                        )}
                        
                        {selectedUserAttendance.check_out ? (
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Check Out: {selectedUserAttendance.check_out}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Belum Check Out</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={processing || !selectedUser}
                  className="min-w-[120px]"
                >
                  {processing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Menyimpan...
                    </div>
                  ) : (
                    `Submit ${data.type === 'check_in' ? 'Check In' : 'Check Out'}`
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Attendance Status Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
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