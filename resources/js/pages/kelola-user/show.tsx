import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Clock, Activity, Shield, User, GraduationCap, Mail } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  rfid_code: string | null;
  prodi: string | null;
  semester: number | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Props {
  user: User;
  success?: string;
}

export default function KelolaUserShow({ user, success }: Props) {
  // Show success toast when success prop is present
  useEffect(() => {
    if (success) {
      toast.success(success);
    }
  }, [success]);

  const roleLabels: Record<string, string> = {
    admin: "Admin",
    aslab: "Aslab",
    mahasiswa: "Mahasiswa",
    dosen: "Dosen"
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500 hover:bg-red-600 text-white",
    aslab: "bg-blue-500 hover:bg-blue-600 text-white",
    mahasiswa: "bg-green-500 hover:bg-green-600 text-white",
    dosen: "bg-purple-500 hover:bg-purple-600 text-white"
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'aslab':
        return User;
      case 'mahasiswa':
        return GraduationCap;
      case 'dosen':
        return User;
      default:
        return User;
    }
  };

  const RoleIcon = getRoleIcon(user.role);

    return (
        <AppLayout>
            <Head title={`Detail ${user?.name || 'User'}`} />
        {/* Header */}
        <div className="space-y-4">
          <Button variant="ghost" size="sm" asChild className="w-fit">
            <Link href="/kelola-user">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
              <p className="text-muted-foreground mt-2">
                Detail informasi user sistem
              </p>
            </div>
            <Button asChild>
              <Link href={`/kelola-user/${user.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Profile
                </CardTitle>
                <CardDescription>
                  Data personal dan akademik user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Nama Lengkap</Label>
                      <p className="text-lg font-medium">{user.name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p className="text-lg">{user.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Program Studi</Label>
                      <p className="text-lg">{user.prodi || '-'}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <div className="flex items-center gap-2">
                        <RoleIcon className="h-5 w-5 text-muted-foreground" />
                        <Badge className={roleColors[user.role] || "bg-gray-500 hover:bg-gray-600"}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <p className="text-lg">{user.semester ? `Semester ${user.semester}` : '-'}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Kode RFID</Label>
                      {user.rfid_code ? (
                        <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-base px-3 py-1">
                          {user.rfid_code}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          Belum terdaftar
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status & Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Status Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Badge variant={user.is_active ? 'default' : 'secondary'} className="text-lg px-4 py-2">
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">Status akun user</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Informasi Akun
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Dibuat pada</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <Label>Terakhir diupdate</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(user.updated_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        {user.role === 'aslab' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Informasi Aslab
              </CardTitle>
              <CardDescription>
                Informasi khusus untuk asisten laboratorium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Program Studi</Label>
                  <p className="font-medium">{user.prodi || '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Semester</Label>
                  <p className="font-medium">{user.semester ? `Semester ${user.semester}` : '-'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Status RFID</Label>
                  <Badge variant={user.rfid_code ? "default" : "secondary"}>
                    {user.rfid_code ? "Terdaftar" : "Belum terdaftar"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </AppLayout>
  );
}

// Helper component for labels
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-medium text-muted-foreground">
      {children}
    </span>
  );
}
