import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Scan, CheckCircle, XCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';

interface User {
  id: number;
  name: string;
  email: string;
  prodi: string;
  semester: number;
  rfid_code: string | null;
  is_active: boolean;
}

interface Props {
  users: User[];
}

interface FormData {
  rfid_code: string;
  user_id: string;
}

export default function RfidRegistration({ users }: Props) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    rfid_code: '',
    user_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/rfid-registration', {
      onSuccess: () => {
        reset();
        setSelectedUser(null);
      },
    });
  };

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id.toString() === userId);
    setSelectedUser(user || null);
    setData('user_id', userId);
  };

  const handleScanRfid = () => {
    setIsScanning(true);
    // Simulate RFID scanning
    setTimeout(() => {
      setIsScanning(false);
      // In real implementation, this would come from RFID reader
      // setData('rfid_code', 'SCANNED_RFID_CODE');
    }, 2000);
  };

  const availableUsers = users.filter(user => !user.rfid_code && user.is_active);
  const registeredUsers = users.filter(user => user.rfid_code);

  return (
    <AppLayout>
      <Head title="Pendaftaran RFID" />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pendaftaran RFID</h1>
          <p className="text-muted-foreground">
            Daftarkan kartu RFID untuk asisten laboratorium
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Daftarkan RFID Baru</CardTitle>
              <CardDescription>
                Pilih aslab dan scan/masukkan kode RFID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User Selection */}
                <div className="space-y-2">
                  <Label htmlFor="user_id">Pilih Aslab</Label>
                  <Select value={data.user_id} onValueChange={handleUserSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih aslab yang akan didaftarkan" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                          Semua aslab sudah terdaftar RFID
                        </div>
                      ) : (
                        availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            <div className="flex flex-col">
                              <span>{user.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {user.prodi} • Semester {user.semester}
                              </span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <InputError message={errors.user_id} />
                </div>

                {/* Selected User Info */}
                {selectedUser && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Nama:</span>
                          <p>{selectedUser.name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>
                          <p>{selectedUser.email}</p>
                        </div>
                        <div>
                          <span className="font-medium">Prodi:</span>
                          <p>{selectedUser.prodi}</p>
                        </div>
                        <div>
                          <span className="font-medium">Semester:</span>
                          <p>Semester {selectedUser.semester}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* RFID Code Input */}
                <div className="space-y-2">
                  <Label htmlFor="rfid_code">Kode RFID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="rfid_code"
                      type="text"
                      value={data.rfid_code}
                      onChange={(e) => setData('rfid_code', e.target.value.toUpperCase())}
                      placeholder="Tempel kartu RFID atau masukkan kode"
                      className="flex-1"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleScanRfid}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Scan className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Tempelkan kartu RFID pada reader atau masukkan kode secara manual
                  </p>
                  <InputError message={errors.rfid_code} />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={processing || !selectedUser || !data.rfid_code}
                  className="w-full"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mendaftarkan...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Daftarkan RFID
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Registered Users List */}
          <Card>
            <CardHeader>
              <CardTitle>Aslab Terdaftar ({registeredUsers.length})</CardTitle>
              <CardDescription>
                Daftar aslab yang sudah memiliki RFID terdaftar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {registeredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Belum ada aslab yang terdaftar RFID
                  </p>
                ) : (
                  registeredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {user.prodi} • Sem {user.semester}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {user.rfid_code}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Aslab</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                Aslab terdaftar di sistem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">RFID Terdaftar</CardTitle>
              <Scan className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{registeredUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Sudah memiliki RFID
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Belum Daftar</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Belum terdaftar RFID
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
