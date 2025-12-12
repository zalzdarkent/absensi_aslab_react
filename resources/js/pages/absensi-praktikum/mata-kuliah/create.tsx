import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { FormEvent } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Absensi Praktikum',
    },
    {
        title: 'Mata Kuliah Praktikum',
    },
    {
        title: 'Tambah',
    },
];

export default function Create() {
  const { data, setData, post, processing, errors } = useForm({
    nama: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    post('/absensi-praktikum/mata-kuliah-praktikum');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tambah Mata Kuliah Praktikum" />

      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Mata Kuliah Praktikum</h1>
          <p className="text-muted-foreground">
            Tambahkan data mata kuliah praktikum baru
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Form Mata Kuliah Praktikum</CardTitle>
            <CardDescription>
              Isi form di bawah untuk menambahkan mata kuliah praktikum
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Mata Kuliah *</Label>
                <Input
                  id="nama"
                  type="text"
                  value={data.nama}
                  onChange={(e) => setData('nama', e.target.value)}
                  placeholder="Contoh: Pemrograman Web"
                  required
                />
                <InputError message={errors.nama} />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={processing}>
                  {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
