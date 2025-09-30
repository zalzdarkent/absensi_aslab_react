<?php

namespace App\Http\Controllers;

use App\Models\AsetAslab;
use App\Models\Bahan;
use App\Models\JenisAsetAslab;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AsetAslabController extends Controller
{
    public function index()
    {
        // Get Aset data
        $asetAslabs = AsetAslab::with('jenisAset')
            ->latest('created_at')
            ->get()
            ->map(function ($aset) {
                return [
                    'id' => $aset->id,
                    'nama_aset' => $aset->nama_aset,
                    'kode_aset' => $aset->kode_aset,
                    'jenis_aset' => $aset->jenisAset ? $aset->jenisAset->nama_jenis_aset : '-',
                    'nomor_seri' => $aset->nomor_seri,
                    'stok' => $aset->stok,
                    'status' => $aset->status,
                    'gambar' => $aset->gambar,
                    'created_at' => $aset->created_at ? $aset->created_at->format('d M Y') : '-',
                    'created_at_sort' => $aset->created_at ? $aset->created_at->timestamp : 0, // For sorting
                    'type' => 'aset', // Add type identifier
                ];
            });

        // Get Bahan data
        $bahans = Bahan::latest('created_at')
            ->get()
            ->map(function ($bahan) {
                return [
                    'id' => $bahan->id,
                    'nama_aset' => $bahan->nama, // Use nama_aset for consistency
                    'kode_aset' => 'BHN-' . str_pad($bahan->id, 3, '0', STR_PAD_LEFT), // Generate code
                    'jenis_aset' => $bahan->jenis_bahan,
                    'nomor_seri' => null,
                    'stok' => $bahan->stok,
                    'status' => $bahan->stok > 0 ? 'tersedia' : 'habis', // Generate status based on stock
                    'gambar' => $bahan->gambar,
                    'created_at' => $bahan->created_at ? $bahan->created_at->format('d M Y') : '-',
                    'created_at_sort' => $bahan->created_at ? $bahan->created_at->timestamp : 0, // For sorting
                    'type' => 'bahan', // Add type identifier
                ];
            });

        // Combine both collections and sort by created_at_sort
        $allItems = $asetAslabs->concat($bahans)->sortByDesc('created_at_sort')->values();

        $stats = [
            'total_aset' => AsetAslab::count(),
            'aset_baik' => AsetAslab::where('status', 'baik')->count(),
            'aset_kurang_baik' => AsetAslab::where('status', 'kurang_baik')->count(),
            'aset_tidak_baik' => AsetAslab::where('status', 'tidak_baik')->count(),
            // Add bahan stats
            'total_bahan' => Bahan::count(),
            'bahan_tersedia' => Bahan::where('stok', '>', 0)->count(),
            'bahan_habis' => Bahan::where('stok', 0)->count(),
        ];

        return Inertia::render('aset-aslab/index', [
            'asetAslabs' => $allItems, // Now contains both aset and bahan
            'stats' => $stats,
            'success' => session('success'),
        ]);
    }

    public function create()
    {
        $jenisAsets = JenisAsetAslab::orderBy('nama_jenis_aset', 'asc')->get();

        return Inertia::render('aset-aslab/create', [
            'jenisAsets' => $jenisAsets,
            'success' => session('success'),
            'newJenisAset' => session('newJenisAset'),
        ]);
    }

    public function store(Request $request)
    {
        // If kode_aset not provided, generate one automatically
        if (!$request->filled('kode_aset')) {
            $request->merge(['kode_aset' => AsetAslab::generateKodeAset()]);
        }

        $validated = $request->validate([
            'nama_aset' => 'required|string|max:255',
            'jenis_id' => 'required|exists:jenis_aset_aslabs,id',
            'kode_aset' => 'required|string|max:255|unique:aset_aslabs,kode_aset',
            'nomor_seri' => 'nullable|string|max:255',
            'stok' => 'required|integer|min:0',
            'status' => 'required|in:baik,kurang_baik,tidak_baik',
            'catatan' => 'nullable|string',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $gambarPath = null;
        if ($request->hasFile('gambar')) {
            $gambarPath = $request->file('gambar')->store('aset-aslab', 'public');
        }

        AsetAslab::create([
            ...$validated,
            'gambar' => $gambarPath ?? 'default-aset.png',
        ]);

        return redirect()->route('aset-aslab.index')->with('success', 'Aset berhasil ditambahkan!');
    }

    /**
     * Return a generated kode_aset (JSON) for use by frontend when nama_aset is filled.
     */
    public function generateKode()
    {
        return response()->json([
            'kode' => AsetAslab::generateKodeAset(),
        ]);
    }

    public function show($id)
    {
        $aset = AsetAslab::with(['jenisAset', 'peminjamanAsets.user'])
            ->findOrFail($id);

        return Inertia::render('aset-aslab/show', [
            'aset' => $aset,
        ]);
    }

    public function edit($id)
    {
        $aset = AsetAslab::with('jenisAset')->findOrFail($id);
        $jenisAsets = JenisAsetAslab::orderBy('nama_jenis_aset', 'asc')->get();

        return Inertia::render('aset-aslab/edit', [
            'aset' => $aset,
            'jenisAsets' => $jenisAsets,
        ]);
    }

    public function update(Request $request, $id)
    {
        $aset = AsetAslab::findOrFail($id);

        $validated = $request->validate([
            'nama_aset' => 'required|string|max:255',
            'jenis_id' => 'required|exists:jenis_aset_aslabs,id',
            'kode_aset' => 'required|string|max:255|unique:aset_aslabs,kode_aset,' . $id,
            'nomor_seri' => 'nullable|string|max:255',
            'stok' => 'required|integer|min:0',
            'status' => 'required|in:baik,kurang_baik,tidak_baik',
            'catatan' => 'nullable|string',
            'gambar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('gambar')) {
            // Hapus gambar lama jika ada
            if ($aset->gambar && $aset->gambar !== 'default-aset.png') {
                Storage::disk('public')->delete($aset->gambar);
            }
            $validated['gambar'] = $request->file('gambar')->store('aset-aslab', 'public');
        }

        $aset->update($validated);

        return redirect()->route('aset-aslab.index')->with('success', 'Aset berhasil diperbarui!');
    }

    public function destroy($id)
    {
        $aset = AsetAslab::findOrFail($id);

        // Hapus gambar jika ada
        if ($aset->gambar && $aset->gambar !== 'default-aset.png') {
            Storage::disk('public')->delete($aset->gambar);
        }

        $aset->delete();

        return redirect()->route('aset-aslab.index')->with('success', 'Aset berhasil dihapus!');
    }
}
