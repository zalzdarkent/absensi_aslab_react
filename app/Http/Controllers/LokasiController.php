<?php

namespace App\Http\Controllers;

use App\Models\Lokasi;
use Illuminate\Http\Request;

class LokasiController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_lokasi' => 'required|string|max:255|unique:lokasis,nama_lokasi',
            'redirect_to' => 'required|string',
        ]);

        $lokasi = Lokasi::create([
            'nama_lokasi' => $validated['nama_lokasi'],
        ]);

        return redirect($validated['redirect_to'])->with([
            'success' => 'Lokasi "' . $lokasi->nama_lokasi . '" berhasil ditambahkan!',
            'newLokasi' => $lokasi,
        ]);
    }
}


