<?php

namespace App\Http\Controllers;

use App\Models\AbsensiPraktikum;
use App\Models\User;
use App\Models\DosenPraktikum;
use App\Models\KelasPraktikum;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AbsensiPraktikumController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->get('search');
            $filterTanggal = $request->get('tanggal');
            $filterKelas = $request->get('kelas_id');

            $query = AbsensiPraktikum::with(['aslab', 'dosenPraktikum.mataKuliahs', 'kelasPraktikum'])
                ->when($search, function ($q) use ($search) {
                    $q->whereHas('aslab', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('dosenPraktikum', function ($sq) use ($search) {
                        $sq->where('nama', 'like', "%{$search}%");
                    });
                })
                ->when($filterTanggal, function ($q) use ($filterTanggal) {
                    $q->where('tanggal', $filterTanggal);
                })
                ->when($filterKelas, function ($q) use ($filterKelas) {
                    $q->where('kelas_praktikum_id', $filterKelas);
                })
                ->orderBy('tanggal', 'desc')
                ->orderBy('created_at', 'desc');

            $absensis = $query->get();

            // Get aslabs for combobox
            $aslabs = User::where('role', 'aslab')
                        ->where('is_active', true)
                        ->orderBy('name')
                        ->get(['id', 'name', 'email']);

            // Get kelas for filter
            $kelass = KelasPraktikum::orderBy('nama_kelas')->get();

            return Inertia::render('absensi-praktikum/absen/index', [
                'absensis' => $absensis,
                'aslabs' => $aslabs,
                'kelass' => $kelass,
                'filters' => [
                    'search' => $search,
                    'tanggal' => $filterTanggal,
                    'kelas_id' => $filterKelas,
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
            'kelas_praktikum_id' => 'required|exists:kelas_praktikums,id',
        ]);

        AbsensiPraktikum::create([
            'aslab_id' => $request->aslab_id,
            'tanggal' => $request->tanggal,
            'dosen_praktikum_id' => $request->dosen_praktikum_id,
            'pertemuan' => $request->pertemuan,
            'sebagai' => $request->sebagai,
            'kehadiran_dosen' => $request->kehadiran_dosen,
            'kelas_praktikum_id' => $request->kelas_praktikum_id,
        ]);

        return redirect()->route('absensi-praktikum.absensi.index')
                        ->with('success', 'Absensi Praktikum berhasil ditambahkan');
    }

    public function show(AbsensiPraktikum $absensiPraktikum)
    {
        $absensiPraktikum->load(['aslab', 'dosenPraktikum.mataKuliahs', 'kelasPraktikum']);

        return Inertia::render('absensi-praktikum/absen/show', [
            'absensi' => $absensiPraktikum,
        ]);
    }

    public function edit(AbsensiPraktikum $absensiPraktikum)
    {
        $absensiPraktikum->load(['aslab', 'dosenPraktikum.mataKuliahs', 'kelasPraktikum']);

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
            'kelas_praktikum_id' => 'required|exists:kelas_praktikums,id',
        ]);

        $absensiPraktikum->update([
            'aslab_id' => $request->aslab_id,
            'tanggal' => $request->tanggal,
            'dosen_praktikum_id' => $request->dosen_praktikum_id,
            'pertemuan' => $request->pertemuan,
            'sebagai' => $request->sebagai,
            'kehadiran_dosen' => $request->kehadiran_dosen,
            'kelas_praktikum_id' => $request->kelas_praktikum_id,
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
