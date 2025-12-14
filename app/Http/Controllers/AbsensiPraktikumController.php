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
            $semester = $request->get('semester'); // 'ganjil' or 'genap'
            $tahun = $request->get('tahun');
            $aslabId = $request->get('aslab_id');
            $dosenId = $request->get('dosen_praktikum_id');
            $kelasId = $request->get('kelas_id');
            $user = $request->user();

            $query = AbsensiPraktikum::with(['aslab', 'dosenPraktikum.mataKuliahs', 'kelas']);

            // Access Control: Aslab can only see their own data
            if ($user->hasRole('aslab')) {
                $query->where('aslab_id', $user->id);
            }

            // Default values if not provided
            if (!$semester || !$tahun) {
                $currentMonth = date('n');
                $currentYear = date('Y');
                
                if (!$tahun) {
                    $tahun = $currentYear;
                }

                if (!$semester) {
                    if ($currentMonth >= 8 && $currentMonth <= 12) {
                        $semester = 'ganjil';
                    } elseif ($currentMonth >= 2 && $currentMonth <= 6) {
                        $semester = 'genap';
                    } else {
                        // Default to ganjil if outside range (Jan/July) or keep previous logic
                        // Let's default to Ganjil of current year if Jan, or Genap if July?
                        // Simplest: Default to current logic based on month
                         if ($currentMonth == 1) {
                            $semester = 'ganjil'; // End of Ganjil previous year usually
                            $tahun = $currentYear - 1; 
                         } else {
                            $semester = 'genap'; // July usually start of Ganjil but let's stick to Genap end
                         }
                    }
                }
            }

            // Semester Filter Logic
            if ($semester === 'ganjil') {
                // Ganjil: August to December (extended to Jan next year for exams usually)
                // But user said: August to December
                $startDate = "{$tahun}-08-01";
                $endDate = "{$tahun}-12-31";
            } else {
                // Genap: February to June
                $startDate = "{$tahun}-02-01";
                $endDate = "{$tahun}-06-30";
            }
            
            $query->whereBetween('tanggal', [$startDate, $endDate]);

            // Advanced Filters
            if ($aslabId) {
                $query->where('aslab_id', $aslabId);
            }
            if ($dosenId) {
                $query->where('dosen_praktikum_id', $dosenId);
            }
            if ($kelasId) {
                $query->where('kelas_id', $kelasId);
            }

            $query->when($search, function ($q) use ($search) {
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

            // Generate Year Options (Current Year - 2 to Current Year + 1)
            $currentYearInt = (int)date('Y');
            $tahunOptions = [];
            for ($i = $currentYearInt - 2; $i <= $currentYearInt + 1; $i++) {
                $tahunOptions[] = $i;
            }

            return Inertia::render('absensi-praktikum/absen/index', [
                'absensis' => $absensis,
                'aslabs' => $aslabs,
                'dosens' => $dosens,
                'kelasOptions' => $kelasOptions,
                'tahunOptions' => $tahunOptions,
                'filters' => [
                    'search' => $search,
                    'semester' => $semester,
                    'tahun' => (int)$tahun,
                    'aslab_id' => $aslabId,
                    'dosen_praktikum_id' => $dosenId,
                    'kelas_id' => $kelasId,
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

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:absensi_praktikums,id',
        ]);

        DB::beginTransaction();
        try {
            $ids = collect($request->items)->pluck('id');
            AbsensiPraktikum::whereIn('id', $ids)->delete();

            DB::commit();

            return redirect()->back()
                ->with('success', count($ids) . ' Absensi Praktikum berhasil dihapus');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('AbsensiPraktikumController@bulkDelete error: ' . $e->getMessage());
            return back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }
}
