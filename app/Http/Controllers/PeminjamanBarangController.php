<?php

namespace App\Http\Controllers;

use App\Models\PeminjamanAset;
use App\Models\AsetAslab;
use App\Models\Bahan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class PeminjamanBarangController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get all borrowing records (for admin/aslab) or only user's records
        $query = PeminjamanAset::with(['asetAslab', 'user', 'approvedBy']);

        if (!in_array($user->role, ['admin', 'aslab'])) {
            $query->where('user_id', $user->id);
        }

        $peminjamanBarangs = $query->latest()->get()->map(function ($peminjaman) {
            $namaBarang = 'N/A';

            // Check if it's from aset_aslabs table
            if ($peminjaman->asetAslab) {
                $namaBarang = $peminjaman->asetAslab->nama_aset ?? 'N/A';
            }
            // If it's from bahan table (you might need to add bahan relationship)
            // elseif ($peminjaman->bahan) {
            //     $namaBarang = $peminjaman->bahan->nama ?? 'N/A';
            // }

            return [
                'id' => $peminjaman->id,
                'nama_peminjam' => $peminjaman->user->name,
                'nama_aset' => $peminjaman->asetAslab ? $peminjaman->asetAslab->nama_aset : 'N/A',
                'nama_barang' => $namaBarang, // This will be used for bahan
                'jumlah' => $peminjaman->stok,
                'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
                'tanggal_kembali' => $peminjaman->tanggal_kembali,
                'status' => $peminjaman->status_text,
                'keterangan' => $peminjaman->keterangan,
                'approved_by' => $peminjaman->approvedBy?->name,
                'approved_at' => $peminjaman->approved_at,
            ];
        });

        // Calculate stats
        $stats = [
            'total_peminjaman' => $peminjamanBarangs->count(),
            'sedang_dipinjam' => $peminjamanBarangs->where('status', 'Sedang Dipinjam')->count(),
            'sudah_kembali' => $peminjamanBarangs->where('status', 'Dikembalikan')->count(),
            'terlambat_kembali' => $peminjamanBarangs->where('status', 'Terlambat')->count(),
        ];

        return Inertia::render('peminjaman-barang/index', [
            'pinjamBarangs' => $peminjamanBarangs,
            'stats' => $stats,
        ]);
    }

    public function create()
    {
        // Get all available asets and bahans
        $asets = AsetAslab::where('stok', '>', 0)
            ->select('id', 'nama_aset', 'kode_aset', 'stok', 'gambar')
            ->orderBy('nama_aset')
            ->get();

        $bahans = Bahan::where('stok', '>', 0)
            ->select('id', 'nama', 'stok', 'gambar')
            ->orderBy('nama')
            ->get();

        return Inertia::render('peminjaman-barang/create', [
            'asets' => $asets,
            'bahans' => $bahans,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|string',
            'agreement_accepted' => 'required|boolean',
        ]);

        $items = json_decode($request->items, true);

        if (!is_array($items) || empty($items)) {
            return back()->withErrors(['items' => 'No items selected']);
        }

        DB::beginTransaction();

        try {
            foreach ($items as $item) {
                $validated = $this->validateItem($item);

                if ($validated['type'] === 'aset') {
                    $aset = AsetAslab::find($validated['item_id']);
                    if (!$aset || $aset->stok < $validated['quantity']) {
                        $itemName = $aset ? $aset->nama : 'item';
                        throw new \Exception("Stock tidak mencukupi untuk {$itemName}");
                    }

                    PeminjamanAset::create([
                        'aset_id' => $validated['item_id'],
                        'user_id' => Auth::id(),
                        'stok' => $validated['quantity'],
                        'tanggal_pinjam' => now(),
                        'target_return_date' => $validated['target_return_date'],
                        'status' => PeminjamanAset::STATUS_PENDING,
                        'keterangan' => $validated['note'],
                        'agreement_accepted' => $request->agreement_accepted,
                    ]);

                    // Don't reduce stock until approved
                }
                // Handle 'bahan' type if needed
            }

            DB::commit();

            return redirect()->route('peminjaman-barang.index')
                ->with('success', 'Permintaan peminjaman berhasil dikirim. Menunggu persetujuan admin/aslab.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function show($id)
    {
        $peminjaman = PeminjamanAset::with(['asetAslab', 'user', 'approvedBy'])->findOrFail($id);

        // Check if user can view this record
        if (!in_array(Auth::user()->role, ['admin', 'aslab']) && $peminjaman->user_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('peminjaman-barang/show', [
            'peminjaman' => [
                'id' => $peminjaman->id,
                'nama_peminjam' => $peminjaman->user->name,
                'nama_barang' => $peminjaman->asetAslab->nama,
                'jumlah' => $peminjaman->stok,
                'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
                'tanggal_kembali' => $peminjaman->tanggal_kembali,
                'target_return_date' => $peminjaman->target_return_date,
                'status' => $peminjaman->status,
                'status_text' => $peminjaman->status_text,
                'keterangan' => $peminjaman->keterangan,
                'approval_note' => $peminjaman->approval_note,
                'approved_by' => $peminjaman->approvedBy?->name,
                'approved_at' => $peminjaman->approved_at,
                'agreement_accepted' => $peminjaman->agreement_accepted,
            ]
        ]);
    }

    public function approve(Request $request, $id)
    {
        if (!in_array(Auth::user()->role, ['admin', 'aslab'])) {
            abort(403);
        }

        $peminjaman = PeminjamanAset::with(['asetAslab'])->findOrFail($id);

        if ($peminjaman->status !== PeminjamanAset::STATUS_PENDING) {
            return back()->withErrors(['error' => 'Permintaan ini sudah diproses']);
        }

        $action = $request->action; // 'approve' or 'reject'
        $note = $request->approval_note;

        DB::beginTransaction();

        try {
            if ($action === 'approve') {
                // Check stock availability
                if ($peminjaman->asetAslab->stok < $peminjaman->stok) {
                    throw new \Exception('Stock tidak mencukupi');
                }

                // Update peminjaman status
                $peminjaman->update([
                    'status' => PeminjamanAset::STATUS_APPROVED,
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'approval_note' => $note,
                ]);

                // Reduce stock
                $peminjaman->asetAslab->decrement('stok', $peminjaman->stok);

                $message = 'Permintaan peminjaman disetujui';

            } else {
                // Reject
                $peminjaman->update([
                    'status' => PeminjamanAset::STATUS_REJECTED,
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'approval_note' => $note,
                ]);

                $message = 'Permintaan peminjaman ditolak';
            }

            DB::commit();

            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    private function validateItem($item)
    {
        if (!isset($item['item_id'], $item['item_type'], $item['quantity'], $item['target_return_date'])) {
            throw new \Exception('Invalid item data');
        }

        if (!in_array($item['item_type'], ['aset', 'bahan'])) {
            throw new \Exception('Invalid item type');
        }

        if ($item['quantity'] <= 0) {
            throw new \Exception('Quantity must be greater than 0');
        }

        if (Carbon::parse($item['target_return_date'])->isPast()) {
            throw new \Exception('Target return date must be in the future');
        }

        return [
            'item_id' => (int)$item['item_id'],
            'type' => $item['item_type'],
            'quantity' => (int)$item['quantity'],
            'target_return_date' => $item['target_return_date'],
            'note' => $item['note'] ?? '',
        ];
    }

    public function searchItems(Request $request)
    {
        $query = $request->get('q', '');

        if (strlen($query) < 2) {
            return response()->json(['items' => []]);
        }

        $items = collect();

        // Search Aset
        $asets = AsetAslab::where(function($q) use ($query) {
                $q->where('nama_aset', 'LIKE', "%{$query}%")
                  ->orWhere('kode_aset', 'LIKE', "%{$query}%");
            })
            ->where('stok', '>', 0)
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->nama_aset,
                    'code' => $item->kode_aset,
                    'stock' => $item->stok,
                    'unit' => 'pcs', // Default unit
                    'type' => 'aset',
                    'display_name' => "{$item->nama_aset} ({$item->kode_aset})",
                    'stock_info' => "{$item->stok} pcs tersedia"
                ];
            });

        // Search Bahan
        $bahans = Bahan::where('nama', 'LIKE', "%{$query}%")
            ->where('stok', '>', 0)
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->nama,
                    'code' => "BAHAN-{$item->id}", // Generate code since no kode field
                    'stock' => $item->stok,
                    'unit' => 'pcs', // Default unit since no satuan field
                    'type' => 'bahan',
                    'display_name' => $item->nama,
                    'stock_info' => "{$item->stok} pcs tersedia"
                ];
            });

        $items = $asets->concat($bahans)->take(20);

        return response()->json(['items' => $items]);
    }
}
