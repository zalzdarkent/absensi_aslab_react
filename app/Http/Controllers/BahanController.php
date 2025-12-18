<?php

namespace App\Http\Controllers;

use App\Models\Bahan;
use App\Models\Lokasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BahanController extends Controller
{
    public function create()
    {
        $lokasis = Lokasi::orderBy('nama_lokasi', 'asc')->get();

        return Inertia::render('bahan/create', [
            'lokasis' => $lokasis,
            'success' => session('success'),
            'newLokasi' => session('newLokasi'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'lokasi_id' => 'required|exists:lokasis,id',
            'jenis_bahan' => 'required|string|max:100',
            'stok' => 'required|integer|min:0',
            'catatan' => 'nullable|string|max:1000',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->only(['nama', 'lokasi_id', 'jenis_bahan', 'stok', 'catatan']);

        // Handle image upload
        if ($request->hasFile('gambar')) {
            $data['gambar'] = $request->file('gambar')->store('bahan', 'public');
        }

        Bahan::create($data);

        return redirect()->route('aset-aslab.index')
            ->with('success', 'Bahan berhasil ditambahkan!');
    }

    public function show(Bahan $bahan)
    {
        $bahan->load('lokasi');

        return Inertia::render('bahan/show', [
            'bahan' => $bahan,
        ]);
    }

    public function edit(Bahan $bahan)
    {
        $bahan->load('lokasi');
        $lokasis = Lokasi::orderBy('nama_lokasi', 'asc')->get();

        return Inertia::render('bahan/edit', [
            'bahan' => $bahan,
            'lokasis' => $lokasis,
            'success' => session('success'),
            'newLokasi' => session('newLokasi'),
        ]);
    }

    public function update(Request $request, Bahan $bahan)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'lokasi_id' => 'required|exists:lokasis,id',
            'jenis_bahan' => 'required|string|max:100',
            'stok' => 'required|integer|min:0',
            'catatan' => 'nullable|string|max:1000',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->only(['nama', 'lokasi_id', 'jenis_bahan', 'stok', 'catatan']);

        // Handle image upload
        if ($request->hasFile('gambar')) {
            // Delete old image if exists
            if ($bahan->gambar) {
                Storage::disk('public')->delete($bahan->gambar);
            }
            $data['gambar'] = $request->file('gambar')->store('bahan', 'public');
        }

        $bahan->update($data);

        return redirect()->route('aset-aslab.index')
            ->with('success', 'Bahan berhasil diperbarui!');
    }

    public function destroy(Bahan $bahan)
    {
        // Delete image if exists
        if ($bahan->gambar) {
            Storage::disk('public')->delete($bahan->gambar);
        }

        $bahan->delete();

        return redirect()->route('aset-aslab.index')
            ->with('success', 'Bahan berhasil dihapus!');
    }
}
