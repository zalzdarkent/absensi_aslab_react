<?php

namespace App\Http\Controllers;

use App\Models\PeminjamanAset;
use App\Models\AsetAslab;
use App\Models\Bahan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Carbon\Carbon;

class PeminjamanBarangController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        // Get all borrowing records (for admin/aslab) or only user's records
        $query = PeminjamanAset::with(['asetAslab', 'bahan', 'user', 'approvedBy']);

        if (!in_array($user->role, ['admin', 'aslab'])) {
            $query->where('user_id', $user->id);
        }

        $peminjamanBarangs = $query->latest()->get()->map(function ($peminjaman) {
            $namaBarang = 'N/A';
            $kodeBarang = 'N/A';
            $tipeBarang = 'unknown';

            // Check if it's from aset_aslabs table
            if ($peminjaman->asetAslab) {
                $namaBarang = $peminjaman->asetAslab->nama_aset ?? 'N/A';
                $kodeBarang = $peminjaman->asetAslab->kode_aset ?? 'N/A';
                $tipeBarang = 'aset';
            }
            // Check if it's from bahan table
            elseif ($peminjaman->bahan) {
                $namaBarang = $peminjaman->bahan->nama ?? 'N/A';
                $kodeBarang = $peminjaman->bahan->kode ?? 'N/A';
                $tipeBarang = 'bahan';
            }

            return [
                'id' => $peminjaman->id,
                'nama_peminjam' => $peminjaman->user->name,
                'nama_aset' => $peminjaman->asetAslab ? $peminjaman->asetAslab->nama_aset : null,
                'nama_barang' => $namaBarang,
                'kode_barang' => $kodeBarang,
                'tipe_barang' => $tipeBarang,
                'jumlah' => $peminjaman->stok,
                'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
                'tanggal_kembali' => $peminjaman->tanggal_kembali ?: $peminjaman->target_return_date,
                'target_return_date' => $peminjaman->target_return_date,
                'status' => $peminjaman->status_text,
                'raw_status' => $peminjaman->status,
                'keterangan' => $peminjaman->keterangan,
                'approved_by' => $peminjaman->approvedBy?->name,
                'approved_at' => $peminjaman->approved_at,
                // Add raw item data for detail modal
                'aset_data' => $peminjaman->asetAslab,
                'bahan_data' => $peminjaman->bahan,
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
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'role' => $user->role,
                ]
            ]
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

        // Debug log
        Log::info('Peminjaman items:', $items);

        try {
            // Set transaction isolation level BEFORE starting transaction
            DB::statement('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');

            // Begin transaction manually for better control
            DB::beginTransaction();

            $createdRecords = [];
            $lockedItems = [];

            foreach ($items as $item) {
                $validated = $this->validateItem($item);

                if ($validated['type'] === 'aset') {
                    // Use SELECT FOR UPDATE to lock the row and prevent race conditions
                    $aset = AsetAslab::where('id', $validated['item_id'])
                        ->lockForUpdate()
                        ->first();

                    if (!$aset) {
                        throw new \Exception("Aset dengan ID {$validated['item_id']} tidak ditemukan");
                    }

                    // Double-check stock after acquiring lock
                    if ($aset->stok < $validated['quantity']) {
                        throw new \Exception("Stock tidak mencukupi untuk {$aset->nama_aset}. Stock tersedia: {$aset->stok}, diminta: {$validated['quantity']}");
                    }

                    // Reserve the stock by decrementing it immediately
                    $aset->decrement('stok', $validated['quantity']);
                    $lockedItems[] = ['type' => 'aset', 'id' => $aset->id, 'quantity' => $validated['quantity']];

                    $record = PeminjamanAset::create([
                        'aset_id' => $validated['item_id'],
                        'bahan_id' => null,
                        'user_id' => Auth::id(),
                        'stok' => $validated['quantity'],
                        'tanggal_pinjam' => now(),
                        'target_return_date' => $validated['target_return_date'],
                        'status' => PeminjamanAset::STATUS_PENDING,
                        'keterangan' => $validated['note'],
                        'agreement_accepted' => $request->agreement_accepted,
                    ]);

                    $createdRecords[] = $record;

                    Log::info("Stock reserved for aset {$aset->nama_aset}: {$validated['quantity']} units");

                } elseif ($validated['type'] === 'bahan') {
                    // Use SELECT FOR UPDATE to lock the row and prevent race conditions
                    $bahan = Bahan::where('id', $validated['item_id'])
                        ->lockForUpdate()
                        ->first();

                    if (!$bahan) {
                        throw new \Exception("Bahan dengan ID {$validated['item_id']} tidak ditemukan");
                    }

                    // Double-check stock after acquiring lock
                    if ($bahan->stok < $validated['quantity']) {
                        throw new \Exception("Stock tidak mencukupi untuk {$bahan->nama}. Stock tersedia: {$bahan->stok}, diminta: {$validated['quantity']}");
                    }

                    // Reserve the stock by decrementing it immediately
                    $bahan->decrement('stok', $validated['quantity']);
                    $lockedItems[] = ['type' => 'bahan', 'id' => $bahan->id, 'quantity' => $validated['quantity']];

                    $record = PeminjamanAset::create([
                        'aset_id' => null,
                        'bahan_id' => $validated['item_id'],
                        'user_id' => Auth::id(),
                        'stok' => $validated['quantity'],
                        'tanggal_pinjam' => now(),
                        'target_return_date' => $validated['target_return_date'],
                        'status' => PeminjamanAset::STATUS_PENDING,
                        'keterangan' => $validated['note'],
                        'agreement_accepted' => $request->agreement_accepted,
                    ]);

                    $createdRecords[] = $record;

                    Log::info("Stock reserved for bahan {$bahan->nama}: {$validated['quantity']} units");
                }
            }

            // Commit transaction
            DB::commit();

            // Log successful transaction
            Log::info("Peminjaman transaction completed successfully", [
                'user_id' => Auth::id(),
                'items_count' => count($createdRecords),
                'locked_items' => $lockedItems
            ]);

            return redirect()->route('peminjaman-barang.index')
                ->with('success', 'Permintaan peminjaman berhasil dikirim. Stock telah direservasi dan menunggu persetujuan admin/aslab.');

        } catch (\Exception $e) {
            // Rollback transaction on any error
            DB::rollBack();

            Log::error('Peminjaman transaction failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'items' => $items
            ]);

            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
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

        $peminjaman = PeminjamanAset::with(['asetAslab', 'bahan'])->findOrFail($id);

        if ($peminjaman->status !== PeminjamanAset::STATUS_PENDING) {
            return back()->withErrors(['error' => 'Permintaan ini sudah diproses']);
        }

        $action = $request->action; // 'approve' or 'reject'
        $note = $request->approval_note;

        try {
            // Set transaction isolation level for consistency
            DB::statement('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            DB::beginTransaction();

            if ($action === 'approve') {
                // Update peminjaman status to approved
                // Note: Stock was already reserved during store() method
                $peminjaman->update([
                    'status' => PeminjamanAset::STATUS_APPROVED,
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'approval_note' => $note,
                ]);

                $message = 'Permintaan peminjaman disetujui';

                Log::info("Peminjaman approved", [
                    'peminjaman_id' => $peminjaman->id,
                    'user_id' => $peminjaman->user_id,
                    'approved_by' => Auth::id(),
                    'quantity' => $peminjaman->stok
                ]);

            } else {
                // Reject - need to restore the reserved stock
                if ($peminjaman->aset_id) {
                    // Restore aset stock
                    $aset = AsetAslab::where('id', $peminjaman->aset_id)
                        ->lockForUpdate()
                        ->first();

                    if ($aset) {
                        $aset->increment('stok', $peminjaman->stok);
                        Log::info("Stock restored for aset {$aset->nama_aset}: {$peminjaman->stok} units");
                    }
                } elseif ($peminjaman->bahan_id) {
                    // Restore bahan stock
                    $bahan = Bahan::where('id', $peminjaman->bahan_id)
                        ->lockForUpdate()
                        ->first();

                    if ($bahan) {
                        $bahan->increment('stok', $peminjaman->stok);
                        Log::info("Stock restored for bahan {$bahan->nama}: {$peminjaman->stok} units");
                    }
                }

                $peminjaman->update([
                    'status' => PeminjamanAset::STATUS_REJECTED,
                    'approved_by' => Auth::id(),
                    'approved_at' => now(),
                    'approval_note' => $note,
                ]);

                $message = 'Permintaan peminjaman ditolak dan stock dikembalikan';

                Log::info("Peminjaman rejected and stock restored", [
                    'peminjaman_id' => $peminjaman->id,
                    'user_id' => $peminjaman->user_id,
                    'rejected_by' => Auth::id(),
                    'quantity_restored' => $peminjaman->stok
                ]);
            }

            DB::commit();
            return redirect()->back()->with('success', $message);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Approval transaction failed', [
                'error' => $e->getMessage(),
                'peminjaman_id' => $id,
                'action' => $action
            ]);
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
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

    public function return(Request $request, $id)
    {
        if (!in_array(Auth::user()->role, ['admin', 'aslab'])) {
            abort(403);
        }

        $peminjaman = PeminjamanAset::with(['asetAslab', 'bahan'])->findOrFail($id);

        if ($peminjaman->status !== PeminjamanAset::STATUS_APPROVED) {
            return back()->withErrors(['error' => 'Barang ini belum dalam status dipinjam']);
        }

        try {
            // Set transaction isolation level for consistency
            DB::statement('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            DB::beginTransaction();

            // Return the stock
            if ($peminjaman->aset_id) {
                $aset = AsetAslab::where('id', $peminjaman->aset_id)
                    ->lockForUpdate()
                    ->first();

                if ($aset) {
                    $aset->increment('stok', $peminjaman->stok);
                    Log::info("Stock returned for aset {$aset->nama_aset}: {$peminjaman->stok} units");
                }
            } elseif ($peminjaman->bahan_id) {
                $bahan = Bahan::where('id', $peminjaman->bahan_id)
                    ->lockForUpdate()
                    ->first();

                if ($bahan) {
                    $bahan->increment('stok', $peminjaman->stok);
                    Log::info("Stock returned for bahan {$bahan->nama}: {$peminjaman->stok} units");
                }
            }

            // Update peminjaman status
            $peminjaman->update([
                'status' => PeminjamanAset::STATUS_RETURNED,
                'tanggal_kembali' => now(),
            ]);

            Log::info("Item returned successfully", [
                'peminjaman_id' => $peminjaman->id,
                'returned_by' => Auth::id(),
                'quantity_returned' => $peminjaman->stok
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Barang berhasil dikembalikan dan stock sudah diupdate');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Return transaction failed', [
                'error' => $e->getMessage(),
                'peminjaman_id' => $id
            ]);
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }
}
