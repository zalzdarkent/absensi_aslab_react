<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class KelasController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->get('search');

            $query = Kelas::query()
                ->when($search, function ($q) use ($search) {
                    $q->where('kelas', 'like', "%{$search}%")
                      ->orWhere('jurusan', 'like', "%{$search}%");
                })
                ->orderBy('jurusan')
                ->orderBy('kelas');

            $kelas = $query->get();

            return Inertia::render('absensi-praktikum/kelas/index', [
                'kelas' => $kelas,
                'filters' => [
                    'search' => $search,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('KelasController@index error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function store(Request $request)
    {
        $request->validate([
            'kelas' => 'required|integer|min:1',
            'jurusan' => 'required|in:IF,SI',
        ]);

        Kelas::create([
            'kelas' => $request->kelas,
            'jurusan' => $request->jurusan,
        ]);

        return redirect()->route('absensi-praktikum.kelas.index')
                        ->with('success', 'Kelas berhasil ditambahkan');
    }

    public function update(Request $request, Kelas $kela)
    {
        $request->validate([
            'kelas' => 'required|integer|min:1',
            'jurusan' => 'required|in:IF,SI',
        ]);

        $kela->update([
            'kelas' => $request->kelas,
            'jurusan' => $request->jurusan,
        ]);

        return redirect()->route('absensi-praktikum.kelas.index')
                        ->with('success', 'Kelas berhasil diperbarui');
    }

    public function destroy(Kelas $kela)
    {
        try {
            $kela->delete();

            return redirect()->route('absensi-praktikum.kelas.index')
                            ->with('success', 'Kelas berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('KelasController@destroy error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus Kelas: ' . $e->getMessage());
        }
    }

    public function search(Request $request)
    {
        $search = $request->get('q', '');

        $kelas = Kelas::query()
            ->when($search, function ($q) use ($search) {
                $q->where('kelas', 'like', "%{$search}%")
                  ->orWhere('jurusan', 'like', "%{$search}%");
            })
            ->orderBy('jurusan')
            ->orderBy('kelas')
            ->limit(20)
            ->get();

        return response()->json($kelas);
    }
}
