<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AsetAslab;
use App\Models\Bahan;
use Illuminate\Http\Request;

class ItemSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'asets' => [],
                'bahans' => []
            ]);
        }

        // Search Aset
        $asets = AsetAslab::where('nama_aset', 'LIKE', "%{$query}%")
            ->orWhere('kode_aset', 'LIKE', "%{$query}%")
            ->where('stok', '>', 0) // Only show items with stock
            ->select('id', 'nama_aset', 'kode_aset', 'stok')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->nama_aset,
                    'code' => $item->kode_aset,
                    'stock' => $item->stok,
                    'unit' => 'pcs', // Default unit for aset
                    'type' => 'aset',
                    'display_name' => "{$item->nama_aset} ({$item->kode_aset})",
                    'stock_info' => "{$item->stok} pcs tersedia"
                ];
            });

        // Search Bahan
        $bahans = Bahan::where('nama', 'LIKE', "%{$query}%")
            ->orWhere('jenis_bahan', 'LIKE', "%{$query}%")
            ->where('stok', '>', 0) // Only show items with stock
            ->select('id', 'nama', 'jenis_bahan', 'stok')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->nama,
                    'code' => $item->jenis_bahan ?? 'BAHAN',
                    'stock' => $item->stok,
                    'unit' => 'unit', // Default unit for bahan
                    'type' => 'bahan',
                    'display_name' => "{$item->nama} ({$item->jenis_bahan})",
                    'stock_info' => "{$item->stok} unit tersedia"
                ];
            });

        return response()->json([
            'items' => $asets->concat($bahans)->take(20)
        ]);
    }
}
