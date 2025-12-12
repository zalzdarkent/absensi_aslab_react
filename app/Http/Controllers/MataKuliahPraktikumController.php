<?php

namespace App\Http\Controllers;

use App\Models\MataKuliahPraktikum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class MataKuliahPraktikumController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->get('search');

            $query = MataKuliahPraktikum::query()
                ->when($search, function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%");
                })
                ->orderBy('nama');

            $mataKuliahs = $query->get();

            return Inertia::render('absensi-praktikum/mata-kuliah/index', [
                'mataKuliahs' => $mataKuliahs,
                'filters' => [
                    'search' => $search,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('MataKuliahPraktikumController@index error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function create()
    {
        return Inertia::render('absensi-praktikum/mata-kuliah/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        MataKuliahPraktikum::create([
            'nama' => $request->nama,
        ]);

        return redirect()->route('absensi-praktikum.mata-kuliah-praktikum.index')
                        ->with('success', 'Mata Kuliah Praktikum berhasil ditambahkan');
    }

    public function show(MataKuliahPraktikum $mataKuliahPraktikum)
    {
        $mataKuliahPraktikum->load('dosens');

        return Inertia::render('absensi-praktikum/mata-kuliah/show', [
            'mataKuliah' => $mataKuliahPraktikum,
        ]);
    }

    public function edit(MataKuliahPraktikum $mataKuliahPraktikum)
    {
        return Inertia::render('absensi-praktikum/mata-kuliah/edit', [
            'mataKuliah' => $mataKuliahPraktikum,
        ]);
    }

    public function update(Request $request, MataKuliahPraktikum $mataKuliahPraktikum)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
        ]);

        $mataKuliahPraktikum->update([
            'nama' => $request->nama,
        ]);

        return redirect()->route('absensi-praktikum.mata-kuliah-praktikum.index')
                        ->with('success', 'Mata Kuliah Praktikum berhasil diperbarui');
    }

    public function destroy(MataKuliahPraktikum $mataKuliahPraktikum)
    {
        try {
            $mataKuliahPraktikum->delete();

            return redirect()->route('absensi-praktikum.mata-kuliah-praktikum.index')
                            ->with('success', 'Mata Kuliah Praktikum berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('MataKuliahPraktikumController@destroy error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus Mata Kuliah Praktikum: ' . $e->getMessage());
        }
    }
}
