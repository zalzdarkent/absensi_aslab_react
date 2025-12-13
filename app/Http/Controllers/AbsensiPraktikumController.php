<?php

namespace App\Http\Controllers;

use App\Models\AbsensiPraktikum;
use App\Models\User;
use App\Models\DosenPraktikum;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AbsensiPraktikumController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->get('search');

            $query = AbsensiPraktikum::with(['aslab', 'dosenPraktikum.mataKuliahs', 'kelas'])
                ->when($search, function ($q) use ($search) {
                    $q->whereHas('aslab', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('dosenPraktikum', function ($sq) use ($search) {
                        $sq->where('nama', 'like', "%{$search}%");
                    })
                    ->orWhereHas('kelas', function ($sq) use ($search) {
                        $sq->where('kelas', 'like', "%{$search}%")
                          ->orWhere('jurusan', 'like', "%{$search}%");
                    });
                })
                ->orderBy('tanggal', 'desc')
                ->orderBy('created_at', 'desc');

            $absensis = $query->get();

            // Get aslabs for combobox
            $aslabs = User::where('role', 'aslab')
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->get(['id', 'name']);

            // Get all dosen with mata kuliah for combobox
            $dosens = DosenPraktikum::with('mataKuliahs:id,nama')
                        ->orderBy('nama')
                        ->get()
                        ->map(function ($dosen) {
                            return [
                                'id' => $dosen->id,
                                'nama' => $dosen->nama,
                                'display_name' => $dosen->nama_with_mata_kuliah,
                            ];
                        });

            // Get all kelas for combobox
            $kelasOptions = Kelas::orderBy('kelas')->get(['id', 'kelas', 'jurusan']);

            return Inertia::render('absensi-praktikum/absen/index', [
                'absensis' => $absensis,
                'aslabs' => $aslabs,
                'dosens' => $dosens,
                'kelasOptions' => $kelasOptions,
                'filters' => [
                    'search' => $search,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('AbsensiPraktikumController@index error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function create()
    {
        // Not used - using modal instead
        return redirect()->route('absensi-praktikum.absensi.index');
    }

    public function store(Request $request)
    {
        $request->validate([
            'aslab_id' => 'required|exists:users,id',
            'tanggal' => 'required|date',
            'dosen_praktikum_id' => 'required|exists:dosen_praktikums,id',
            'pertemuan' => 'required|string',
            'sebagai' => 'required|in:instruktur,asisten',
            'kehadiran_dosen' => 'required|in:hadir,tidak_hadir',
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        AbsensiPraktikum::create([
            'aslab_id' => $request->aslab_id,
            'tanggal' => $request->tanggal,
            'dosen_praktikum_id' => $request->dosen_praktikum_id,
            'pertemuan' => $request->pertemuan,
            'sebagai' => $request->sebagai,
            'kehadiran_dosen' => $request->kehadiran_dosen,
            'kelas_id' => $request->kelas_id,
        ]);

        return redirect()->route('absensi-praktikum.absensi.index')
                        ->with('success', 'Absensi Praktikum berhasil ditambahkan');
    }

    public function show(AbsensiPraktikum $absensiPraktikum)
    {
        $absensiPraktikum->load(['aslab', 'dosenPraktikum.mataKuliahs', 'kelas']);

        return Inertia::render('absensi-praktikum/absen/show', [
            'absensi' => $absensiPraktikum,
        ]);
    }

    public function edit(AbsensiPraktikum $absensiPraktikum)
    {
        $absensiPraktikum->load(['aslab', 'dosenPraktikum.mataKuliahs', 'kelas']);

        $aslabs = User::where('role', 'aslab')
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'email']);

        return Inertia::render('absensi-praktikum/absen/edit', [
            'absensi' => $absensiPraktikum,
            'aslabs' => $aslabs,
        ]);
    }

    public function update(Request $request, AbsensiPraktikum $absensiPraktikum)
    {
        $request->validate([
            'aslab_id' => 'required|exists:users,id',
            'tanggal' => 'required|date',
            'dosen_praktikum_id' => 'required|exists:dosen_praktikums,id',
            'pertemuan' => 'required|string',
            'sebagai' => 'required|in:instruktur,asisten',
            'kehadiran_dosen' => 'required|in:hadir,tidak_hadir',
            'kelas_id' => 'required|exists:kelas,id',
        ]);

        $absensiPraktikum->update([
            'aslab_id' => $request->aslab_id,
            'tanggal' => $request->tanggal,
            'dosen_praktikum_id' => $request->dosen_praktikum_id,
            'pertemuan' => $request->pertemuan,
            'sebagai' => $request->sebagai,
            'kehadiran_dosen' => $request->kehadiran_dosen,
            'kelas_id' => $request->kelas_id,
        ]);

        return redirect()->route('absensi-praktikum.absensi.index')
                        ->with('success', 'Absensi Praktikum berhasil diperbarui');
    }

    public function destroy(AbsensiPraktikum $absensiPraktikum)
    {
        try {
            $absensiPraktikum->delete();

            return redirect()->route('absensi-praktikum.absensi.index')
                            ->with('success', 'Absensi Praktikum berhasil dihapus');
        } catch (\Exception $e) {
            Log::error('AbsensiPraktikumController@destroy error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus Absensi Praktikum: ' . $e->getMessage());
        }
    }
}
