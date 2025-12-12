<?php

namespace App\Http\Controllers;

use App\Models\KelasPraktikum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KelasPraktikumController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->get('search');

            $query = KelasPraktikum::query()
                ->when($search, function ($q) use ($search) {
                    $q->where('nama_kelas', 'like', "%{$search}%");
                })
                ->orderBy('nama_kelas');

            $kelass = $query->get();

            return Inertia::render('absensi-praktikum/kelas/index', [
                'kelass' => $kelass,
                'filters' => [
                    'search' => $search,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('KelasPraktikumController@index error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function create()
    {
        return Inertia::render('absensi-praktikum/kelas/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_kelas' => 'required|string|max:255',
        ]);

        KelasPraktikum::create([
            'nama_kelas' => $request->nama_kelas,
        ]);

        return redirect()->route('absensi-praktikum.kelas-praktikum.index')
                        ->with('success', 'Kelas Praktikum berhasil ditambahkan');
    }

    public function show(KelasPraktikum $kelasPraktikum)
    {
        $kelasPraktikum->load('absensiPraktikums');

        return Inertia::render('absensi-praktikum/kelas/show', [
            'kelas' => $kelasPraktikum,
        ]);
    }

    public function edit(KelasPraktikum $kelasPraktikum)
    {
        return Inertia::render('absensi-praktikum/kelas/edit', [
            'kelas' => $kelasPraktikum,
        ]);
    }

    public function update(Request $request, KelasPraktikum $kelasPraktikum)
    {
        $request->validate([
            'nama_kelas' => 'required|string|max:255',
        ]);

        $kelasPraktikum->update([
            'nama_kelas' => $request->nama_kelas,
        ]);

        return redirect()->route('absensi-praktikum.kelas-praktikum.index')
                        ->with('success', 'Kelas Praktikum berhasil diperbarui');
    }

    public function destroy(KelasPraktikum $kelasPraktikum)
    {
        try {
            $kelasPraktikum->delete();

            return redirect()->route('absensi-praktikum.kelas-praktikum.index')
                            ->with('success', 'Kelas Praktikum berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('KelasPraktikumController@destroy error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus Kelas Praktikum: ' . $e->getMessage());
        }
    }

    /**
     * Search kelas for combobox
     */
    public function search(Request $request)
    {
        $search = $request->get('search');

        $kelass = KelasPraktikum::query()
            ->when($search, function ($q) use ($search) {
                $q->where('nama_kelas', 'like', "%{$search}%");
            })
            ->orderBy('nama_kelas')
            ->limit(20)
            ->get();

        return response()->json($kelass);
    }
}
