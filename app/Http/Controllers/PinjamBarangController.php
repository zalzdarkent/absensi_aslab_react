<?php

namespace App\Http\Controllers;

use App\Models\PinjamBarang;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PinjamBarangController extends Controller
{
    public function index()
    {
        $pinjamBarangs = collect([]); // Empty collection untuk sekarang
        
        $stats = [
            'total_peminjaman' => 0,
            'sedang_dipinjam' => 0,
            'sudah_kembali' => 0,
            'terlambat_kembali' => 0,
        ];

        return Inertia::render('peminjaman-barang/index', [
            'pinjamBarangs' => $pinjamBarangs,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        return Inertia::render('peminjaman-barang/create');
    }

    public function store(Request $request)
    {
        // TODO: Implement store logic
        return redirect()->route('peminjaman-barang.index')->with('success', 'Peminjaman berhasil dicatat!');
    }

    public function show($id)
    {
        // TODO: Implement show logic
        return Inertia::render('peminjaman-barang/show');
    }

    public function edit($id)
    {
        // TODO: Implement edit logic
        return Inertia::render('peminjaman-barang/edit');
    }

    public function update(Request $request, $id)
    {
        // TODO: Implement update logic
        return redirect()->route('peminjaman-barang.index')->with('success', 'Peminjaman berhasil diperbarui!');
    }

    public function destroy($id)
    {
        // TODO: Implement destroy logic
        return redirect()->route('peminjaman-barang.index')->with('success', 'Peminjaman berhasil dihapus!');
    }

    public function returnItem($id)
    {
        // TODO: Implement return logic
        return redirect()->route('peminjaman-barang.index')->with('success', 'Barang berhasil dikembalikan!');
    }
}