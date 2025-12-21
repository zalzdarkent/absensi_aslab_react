<?php

namespace App\Http\Controllers;

use App\Models\AsetAslab;
use App\Models\Bahan;
use App\Models\JenisAsetAslab;
use App\Models\Lokasi;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Spatie\SimpleExcel\SimpleExcelReader;
use Illuminate\Support\Str;

class ImportController extends Controller
{
    public function importAset(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls|max:5120',
        ]);

        $path = $request->file('file')->getRealPath();
        $rows = SimpleExcelReader::create($path)->getRows();

        $count = 0;
        foreach ($rows as $row) {
            // Map headers
            $nama = $row['nama barang'] ?? null;
            if (!$nama) continue;

            $jenisNama = $row['jenis'] ?? 'Umum';
            $lokasiNama = $row['lokasi barang'] ?? 'Gudang';
            $stok = $row['quantity'] ?? 0;
            $kondisi = strtolower($row['kondisi'] ?? 'baik');
            $catatan = $row['catatan'] ?? null;
            $gambar = $row['foto barang'] ?? null;

            // Find or create Jenis
            $jenis = JenisAsetAslab::firstOrCreate(['nama_jenis_aset' => $jenisNama]);

            // Find or create Lokasi
            $lokasi = Lokasi::firstOrCreate(['nama_lokasi' => $lokasiNama]);

            // Map kondisi to status
            $status = 'baik';
            if (Str::contains($kondisi, ['tidak', 'rusak', 'buruk'])) $status = 'tidak_baik';
            elseif (Str::contains($kondisi, ['kurang', 'cukup'])) $status = 'kurang_baik';

            AsetAslab::create([
                'nama_aset' => $nama,
                'jenis_id' => $jenis->id,
                'lokasi_id' => $lokasi->id,
                'kode_aset' => AsetAslab::generateKodeAset(),
                'stok' => $stok,
                'status' => $status,
                'catatan' => $catatan,
                'gambar' => $gambar ? 'aset-aslab/' . $gambar : null,
            ]);

            $count++;
        }

        return back()->with('success', "$count data aset berhasil diimport!");
    }

    public function importBahan(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls|max:5120',
        ]);

        $path = $request->file('file')->getRealPath();
        $rows = SimpleExcelReader::create($path)->getRows();

        $count = 0;
        foreach ($rows as $row) {
            $nama = $row['nama barang'] ?? null;
            if (!$nama) continue;

            $jenisBahan = $row['jenis_bahan'] ?? ($row['alat/bahan'] ?? 'Bahan');
            $lokasiNama = $row['lokasi barang'] ?? 'Gudang';
            $stok = $row['quantity'] ?? 0;
            $catatan = $row['catatan'] ?? null;
            $gambar = $row['foto barang'] ?? null;

            $lokasi = Lokasi::firstOrCreate(['nama_lokasi' => $lokasiNama]);

            Bahan::create([
                'nama' => $nama,
                'lokasi_id' => $lokasi->id,
                'jenis_bahan' => $jenisBahan,
                'stok' => $stok,
                'catatan' => $catatan,
                'gambar' => $gambar ? 'bahan/' . $gambar : null,
            ]);

            $count++;
        }

        return back()->with('success', "$count data bahan berhasil diimport!");
    }

    public function bulkUploadImages(Request $request)
    {
        $request->validate([
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120',
            'type' => 'required|in:aset,bahan'
        ]);

        $type = $request->type;
        $folder = $type === 'aset' ? 'aset-aslab' : 'bahan';
        $uploadedCount = 0;

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $filename = $file->getClientOriginalName();
                // We use the original name to match what's in the DB
                $path = $file->storeAs($folder, $filename, 'public');
                $uploadedCount++;
            }
        }

        return back()->with('success', "$uploadedCount foto berhasil diunggah!");
    }

    public function preview(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,csv,xls|max:5120',
        ]);

        $path = $request->file('file')->getRealPath();
        
        // Use SimpleExcelReader to get rows
        $rows = SimpleExcelReader::create($path)->getRows()->toArray();

        // Simple mapping to ensure we have consistent keys for preview
        $previewData = array_map(function($row) {
            return [
                'nama' => $row['nama barang'] ?? '-',
                'jenis' => $row['jenis'] ?? $row['jenis_bahan'] ?? $row['alat/bahan'] ?? '-',
                'stok' => $row['quantity'] ?? 0,
                'lokasi' => $row['lokasi barang'] ?? '-',
                'kondisi' => $row['kondisi'] ?? '-',
                'catatan' => $row['catatan'] ?? '-',
                'gambar' => $row['foto barang'] ?? '-',
            ];
        }, array_slice($rows, 0, 100)); // Limit to 100 for preview

        return response()->json([
            'data' => $previewData,
            'total' => count($rows)
        ]);
    }
}
