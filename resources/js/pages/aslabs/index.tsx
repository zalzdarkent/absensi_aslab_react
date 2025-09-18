import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Search, X, MoreHorizontal, Eye, Edit, UserX, UserCheck, Trash } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface User {
  id: number;
  name: string;
  email: string;
  rfid_code: string | null;
  prodi: string;
  semester: number;
  is_active: boolean;
}

interface Props {
  aslabs: User[];
  prodis: string[];
  filters: {
    search: string | null;
    prodi: string | null;
  };
}

export default function AslabsIndex({ aslabs, prodis, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [selectedProdi, setSelectedProdi] = useState(filters.prodi || 'all');

  const handleFilter = () => {
    router.get('/aslabs', {
      search: search || undefined,
      prodi: selectedProdi && selectedProdi !== 'all' ? selectedProdi : undefined,
    });
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedProdi('all');
    router.get('/aslabs');
  };

  const handleToggleStatus = (aslab: User) => {
    router.patch(`/aslabs/${aslab.id}/toggle-status`, {}, {
      preserveScroll: true,
    });
  };

  const handleDelete = (aslab: User) => {
    if (confirm(`Apakah Anda yakin ingin menghapus ${aslab.name}?`)) {
      router.delete(`/aslabs/${aslab.id}`, {
        preserveScroll: true,
      });
    }
  };

  return (
    <AppLayout>
      <Head title="Kelola Aslab" />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kelola Aslab</h1>
            <p className="text-muted-foreground">
              Kelola data asisten laboratorium yang terdaftar di sistem
            </p>
          </div>
          <Button asChild>
            <Link href="/aslabs/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Aslab
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter & Pencarian</CardTitle>
            <CardDescription>
              Gunakan filter di bawah untuk mencari aslab tertentu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Cari nama, email, atau RFID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                />
              </div>
              <div className="w-48">
                <Select value={selectedProdi} onValueChange={setSelectedProdi}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Prodi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Prodi</SelectItem>
                    {prodis.map((prodi) => (
                      <SelectItem key={prodi} value={prodi}>
                        {prodi}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleFilter}>
                  <Search className="mr-2 h-4 w-4" />
                  Cari
                </Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Aslab ({aslabs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Nama</th>
                    <th className="text-left p-4 font-medium">Email</th>
                    <th className="text-left p-4 font-medium">RFID</th>
                    <th className="text-left p-4 font-medium">Prodi</th>
                    <th className="text-left p-4 font-medium">Semester</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-right p-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {aslabs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-muted-foreground">
                        Tidak ada data aslab yang ditemukan
                      </td>
                    </tr>
                  ) : (
                    aslabs.map((aslab) => (
                      <tr key={aslab.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{aslab.name}</div>
                        </td>
                        <td className="p-4 text-muted-foreground">{aslab.email}</td>
                        <td className="p-4">
                          {aslab.rfid_code ? (
                            <code className="bg-muted px-2 py-1 rounded text-sm">
                              {aslab.rfid_code}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">Belum terdaftar</span>
                          )}
                        </td>
                        <td className="p-4">{aslab.prodi}</td>
                        <td className="p-4">{aslab.semester}</td>
                        <td className="p-4">
                          <Badge variant={aslab.is_active ? 'default' : 'secondary'}>
                            {aslab.is_active ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                  <Link href={`/aslabs/${aslab.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Lihat Detail
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/aslabs/${aslab.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleToggleStatus(aslab)}>
                                  {aslab.is_active ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" />
                                      Nonaktifkan
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />
                                      Aktifkan
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(aslab)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
