<?php

namespace App\Http\Controllers;

use App\Models\JenisAsetAslab;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class JenisAsetAslabController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_jenis_aset' => 'required|string|max:255|unique:jenis_aset_aslabs,nama_jenis_aset',
        ]);

        $jenisAset = JenisAsetAslab::create($validated);

        return redirect('/aset-aslab/create')->with([
            'success' => 'Jenis aset "' . $jenisAset->nama_jenis_aset . '" berhasil ditambahkan!',
            'newJenisAset' => $jenisAset
        ]);
    }
}
