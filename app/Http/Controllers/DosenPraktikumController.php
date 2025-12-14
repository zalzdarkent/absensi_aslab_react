<?php

namespace App\Http\Controllers;

use App\Models\DosenPraktikum;
use App\Models\MataKuliahPraktikum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DosenPraktikumController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->get('search');

            $query = DosenPraktikum::with('mataKuliahs')
                ->when($search, function ($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('nidn', 'like', "%{$search}%");
                })
                ->orderBy('nama');

            $dosens = $query->get();
            $mataKuliahs = MataKuliahPraktikum::orderBy('nama')->get();

            return Inertia::render('absensi-praktikum/dosen/index', [
                'dosens' => $dosens,
                'mataKuliahs' => $mataKuliahs,
                'filters' => [
                    'search' => $search,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('DosenPraktikumController@index error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function create()
    {
        $mataKuliahs = MataKuliahPraktikum::orderBy('nama')->get();

        return Inertia::render('absensi-praktikum/dosen/create', [
            'mataKuliahs' => $mataKuliahs,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nidn' => 'required|string|max:255|unique:dosen_praktikums,nidn',
            'mata_kuliah_ids' => 'required|array|min:1',
            'mata_kuliah_ids.*' => 'exists:mata_kuliah_praktikums,id',
        ]);

        DB::beginTransaction();
        try {
            $dosen = DosenPraktikum::create([
                'nama' => $request->nama,
                'nidn' => $request->nidn,
            ]);

            // Sync mata kuliah relationships
            $dosen->mataKuliahs()->sync($request->mata_kuliah_ids);

            DB::commit();

            return redirect()->route('absensi-praktikum.dosen-praktikum.index')
                            ->with('success', 'Dosen Praktikum berhasil ditambahkan');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('DosenPraktikumController@store error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menambahkan Dosen Praktikum: ' . $e->getMessage());
        }
    }

    public function show(DosenPraktikum $dosenPraktikum)
    {
        $dosenPraktikum->load('mataKuliahs', 'absensiPraktikums');

        return Inertia::render('absensi-praktikum/dosen/show', [
            'dosen' => $dosenPraktikum,
        ]);
    }

    public function edit(DosenPraktikum $dosenPraktikum)
    {
        $dosenPraktikum->load('mataKuliahs');
        $mataKuliahs = MataKuliahPraktikum::orderBy('nama')->get();

        return Inertia::render('absensi-praktikum/dosen/edit', [
            'dosen' => $dosenPraktikum,
            'mataKuliahs' => $mataKuliahs,
        ]);
    }

    public function update(Request $request, DosenPraktikum $dosenPraktikum)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'nidn' => 'required|string|max:255|unique:dosen_praktikums,nidn,' . $dosenPraktikum->id,
            'mata_kuliah_ids' => 'required|array|min:1',
            'mata_kuliah_ids.*' => 'exists:mata_kuliah_praktikums,id',
        ]);

        DB::beginTransaction();
        try {
            $dosenPraktikum->update([
                'nama' => $request->nama,
                'nidn' => $request->nidn,
            ]);

            // Sync mata kuliah relationships
            $dosenPraktikum->mataKuliahs()->sync($request->mata_kuliah_ids);

            DB::commit();

            return redirect()->route('absensi-praktikum.dosen-praktikum.index')
                            ->with('success', 'Dosen Praktikum berhasil diperbarui');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('DosenPraktikumController@update error: ' . $e->getMessage());
            return back()->with('error', 'Gagal memperbarui Dosen Praktikum: ' . $e->getMessage());
        }
    }

    public function destroy(DosenPraktikum $dosenPraktikum)
    {
        try {
            $dosenPraktikum->delete();

            return redirect()->route('absensi-praktikum.dosen-praktikum.index')
                            ->with('success', 'Dosen Praktikum berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('DosenPraktikumController@destroy error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus Dosen Praktikum: ' . $e->getMessage());
        }
    }

    /**
     * Search dosen for combobox
     */
    public function search(Request $request)
    {
        $search = $request->get('search');

        $dosens = DosenPraktikum::with('mataKuliahs')
            ->when($search, function ($q) use ($search) {
                $q->where('nama', 'like', "%{$search}%")
                  ->orWhere('nidn', 'like', "%{$search}%");
            })
            ->orderBy('nama')
            ->limit(20)
            ->get()
            ->map(function ($dosen) {
                return [
                    'id' => $dosen->id,
                    'nama' => $dosen->nama,
                    'nidn' => $dosen->nidn,
                    'mata_kuliahs' => $dosen->mataKuliahs->pluck('nama')->toArray(),
                    'display_name' => $dosen->nama . ' - ' . $dosen->mataKuliahs->pluck('nama')->join(', '),
                ];
            });

        return response()->json($dosens);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:dosen_praktikums,id',
        ]);

        DB::beginTransaction();
        try {
            $ids = collect($request->items)->pluck('id');
            DosenPraktikum::whereIn('id', $ids)->delete();

            DB::commit();

            return redirect()->back()
                ->with('success', count($ids) . ' Dosen Praktikum berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('DosenPraktikumController@bulkDelete error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}
