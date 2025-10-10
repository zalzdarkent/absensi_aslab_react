<?php

namespace App\Http\Controllers;

use App\Models\PeminjamanAset;
use App\Models\PenggunaanBahan;
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

        // Get all borrowing records (aset & bahan pending/approved - for admin/aslab) or only user's records
        $query = PeminjamanAset::with(['asetAslab', 'bahan', 'user', 'approvedBy']);

        // Filter data based on user role
        if (!in_array($user->role, ['admin', 'aslab'])) {
            $query->where('user_id', $user->id);
        }

        $peminjamanRecords = $query->latest()->get();

        // Get penggunaan bahan records (completed usage)
        $penggunaanQuery = PenggunaanBahan::with(['bahan', 'user', 'approvedBy']);

        // Filter data based on user role
        if (!in_array($user->role, ['admin', 'aslab'])) {
            $penggunaanQuery->where('user_id', $user->id);
        }

        $penggunaanRecords = $penggunaanQuery->latest()->get();

        // Convert peminjaman records to unified format
        $peminjamanBarangs = $peminjamanRecords->map(function ($peminjaman) {
            $namaBarang = 'N/A';
            $kodeBarang = 'N/A';
            $tipeBarang = 'unknown';

            // Check if it's aset or bahan
            if ($peminjaman->asetAslab) {
                $namaBarang = $peminjaman->asetAslab->nama_aset ?? 'N/A';
                $kodeBarang = $peminjaman->asetAslab->kode_aset ?? 'N/A';
                $tipeBarang = 'aset';
            } elseif ($peminjaman->bahan) {
                $namaBarang = $peminjaman->bahan->nama ?? 'N/A';
                $kodeBarang = $peminjaman->bahan->kode ?? 'N/A';
                $tipeBarang = 'bahan';
            }

            return [
                'id' => 'peminjaman_' . $peminjaman->id,
                'original_id' => $peminjaman->id,
                'nama_peminjam' => $peminjaman->user->name ?? 'Unknown User',
                'nama_barang' => $namaBarang,
                'kode_barang' => $kodeBarang,
                'tipe_barang' => $tipeBarang,
                'jumlah' => $peminjaman->stok,
                'tanggal_pinjam' => $peminjaman->tanggal_pinjam,
                'tanggal_kembali' => $peminjaman->tanggal_kembali,
                'target_return_date' => $peminjaman->target_return_date,
                'status' => $peminjaman->status_text,
                'raw_status' => $peminjaman->status,
                'keterangan' => $peminjaman->keterangan,
                'approved_by' => $peminjaman->approvedBy?->name ?? null,
                'approved_at' => $peminjaman->approved_at,
                // Add raw item data for detail modal
                'aset_data' => $peminjaman->asetAslab,
                'bahan_data' => $peminjaman->bahan,
                'record_type' => 'peminjaman'
            ];
        });

        // Convert penggunaan bahan to unified format
        $penggunaanBarangs = $penggunaanRecords->map(function ($penggunaan) {
            return [
                'id' => 'penggunaan_' . $penggunaan->id,
                'original_id' => $penggunaan->id,
                'nama_peminjam' => $penggunaan->user->name ?? 'Unknown User',
                'nama_barang' => $penggunaan->bahan->nama ?? 'N/A',
                'kode_barang' => $penggunaan->bahan->kode ?? 'N/A',
                'tipe_barang' => 'bahan',
                'jumlah' => $penggunaan->jumlah_digunakan,
                'tanggal_pinjam' => $penggunaan->tanggal_penggunaan,
                'tanggal_kembali' => null, // Bahan tidak dikembalikan
                'target_return_date' => null,
                'status' => 'Digunakan',
                'raw_status' => 'used',
                'keterangan' => $penggunaan->keperluan ?? $penggunaan->catatan,
                'approved_by' => $penggunaan->approvedBy?->name ?? null,
                'approved_at' => $penggunaan->approved_at,
                // Add raw item data for detail modal
                'aset_data' => null,
                'bahan_data' => $penggunaan->bahan,
                'record_type' => 'penggunaan'
            ];
        });

        // Combine and sort all records by date
        $allRecords = $peminjamanBarangs->concat($penggunaanBarangs)->sortByDesc('tanggal_pinjam');

        // Calculate stats using the combined records
        $stats = [
            'total_peminjaman' => $peminjamanRecords->count() + $penggunaanRecords->count(),
            'sedang_dipinjam' => $peminjamanRecords->whereIn('status', [
                PeminjamanAset::STATUS_APPROVED,
                PeminjamanAset::STATUS_BORROWED
            ])->count(),
            'sudah_kembali' => $peminjamanRecords->where('status', PeminjamanAset::STATUS_RETURNED)->count(),
            'bahan_digunakan' => $penggunaanRecords->count(),
            'menunggu_persetujuan' => $peminjamanRecords->where('status', PeminjamanAset::STATUS_PENDING)->count(),
            'terlambat_kembali' => $peminjamanRecords->filter(function ($peminjaman) {
                // Only check aset that's approved/borrowed and past target return date
                $isAsetActive = $peminjaman->aset_id && in_array($peminjaman->status, [PeminjamanAset::STATUS_APPROVED, PeminjamanAset::STATUS_BORROWED]);
                $isOverdue = $peminjaman->target_return_date && Carbon::parse($peminjaman->target_return_date)->isPast();
                return $isAsetActive && $isOverdue;
            })->count(),
        ];

        return Inertia::render('peminjaman-barang/index', [
            'pinjamBarangs' => $allRecords->values(),
            'stats' => $stats,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name ?? 'Unknown User',
                    'email' => $user->email ?? 'no-email@example.com',
                    'role' => $user->role,
                ]
            ]
        ]);
    }

    // public function index(){
    //     return Inertia::render('peminjaman-barang/contoh');
    //     return "Hello World";
    // }

    public function create()
    {
        $search = request('search', '');
        $type = request('type', 'all'); // 'all', 'aset', 'bahan'
        $page = request('page', 1);
        $perPage = 24; // Load 24 items per page for better grid layout

        // Initialize collections
        $asets = collect();
        $bahans = collect();

        // Get total counts for metadata (always get these for stats)
        $totalAsets = AsetAslab::where('stok', '>', 0)->count();
        $totalBahans = Bahan::where('stok', '>', 0)->count();

        // Get asets if needed
        if ($type === 'all' || $type === 'aset') {
            $asetQuery = AsetAslab::where('stok', '>', 0)
                ->select('id', 'nama_aset', 'kode_aset', 'stok', 'gambar')
                ->orderBy('nama_aset');

            if ($search) {
                $asetQuery->where(function($q) use ($search) {
                    $q->where('nama_aset', 'LIKE', "%{$search}%")
                      ->orWhere('kode_aset', 'LIKE', "%{$search}%");
                });
            }

            $asets = $asetQuery->get()->map(function($aset) {
                return [
                    'id' => $aset->id,
                    'nama_aset' => $aset->nama_aset,
                    'kode_aset' => $aset->kode_aset,
                    'stok' => $aset->stok,
                    'gambar' => $aset->gambar,
                    'type' => 'aset'
                ];
            });
        }

        // Get bahans if needed
        if ($type === 'all' || $type === 'bahan') {
            $bahanQuery = Bahan::where('stok', '>', 0)
                ->select('id', 'nama', 'stok', 'gambar')
                ->orderBy('nama');

            if ($search) {
                $bahanQuery->where('nama', 'LIKE', "%{$search}%");
            }

            $bahans = $bahanQuery->get()->map(function($bahan) {
                return [
                    'id' => $bahan->id,
                    'nama' => $bahan->nama,
                    'stok' => $bahan->stok,
                    'gambar' => $bahan->gambar,
                    'type' => 'bahan'
                ];
            });
        }

        // Combine items and apply server-side pagination
        $allItems = $asets->concat($bahans);
        $total = $allItems->count();

        // Manual pagination
        $offset = ($page - 1) * $perPage;
        $paginatedItems = $allItems->slice($offset, $perPage)->values();

        $hasMore = $total > ($offset + $perPage);
        $totalPages = ceil($total / $perPage);

        return Inertia::render('peminjaman-barang/create', [
            'items' => $paginatedItems,
            'pagination' => [
                'current_page' => (int)$page,
                'per_page' => $perPage,
                'total' => $total,
                'has_more' => $hasMore,
                'total_pages' => $totalPages,
                'from' => $total > 0 ? $offset + 1 : 0,
                'to' => min($offset + $perPage, $total)
            ],
            'meta' => [
                'search' => $search,
                'type' => $type,
                'total_asets' => $totalAsets,
                'total_bahans' => $totalBahans
            ]
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
                    // ASET: Use peminjaman_aset table - items that can be returned
                    $aset = AsetAslab::where('id', $validated['item_id'])
                        ->lockForUpdate()
                        ->first();

                    if (!$aset) {
                        throw new \Exception("Aset tidak ditemukan");
                    }

                    // Double-check stock after acquiring lock
                    if ($aset->stok < $validated['quantity']) {
                        throw new \Exception("Stok aset {$aset->nama_aset} tidak mencukupi");
                    }

                    // Reserve the stock by decrementing it immediately
                    $aset->decrement('stok', $validated['quantity']);
                    $lockedItems[] = ['type' => 'aset', 'id' => $aset->id, 'quantity' => $validated['quantity']];

                    $record = PeminjamanAset::create([
                        'aset_id' => $validated['item_id'],
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
                    // BAHAN: Also use peminjaman_aset table for approval, but will be converted to penggunaan_bahan after approval
                    $bahan = Bahan::where('id', $validated['item_id'])
                        ->lockForUpdate()
                        ->first();

                    if (!$bahan) {
                        throw new \Exception("Bahan tidak ditemukan");
                    }

                    // Double-check stock after acquiring lock
                    if ($bahan->stok < $validated['quantity']) {
                        throw new \Exception("Stok bahan {$bahan->nama} tidak mencukupi");
                    }

                    // Reserve the stock by decrementing it immediately (same as aset)
                    $bahan->decrement('stok', $validated['quantity']);
                    $lockedItems[] = ['type' => 'bahan', 'id' => $bahan->id, 'quantity' => $validated['quantity']];

                    // Create peminjaman record for approval (will be converted to penggunaan_bahan on approval)
                    $record = PeminjamanAset::create([
                        'bahan_id' => $validated['item_id'], // We need to keep bahan_id for now
                        'user_id' => Auth::id(),
                        'stok' => $validated['quantity'],
                        'tanggal_pinjam' => now(),
                        'target_return_date' => null, // No return date for bahan
                        'status' => PeminjamanAset::STATUS_PENDING,
                        'keterangan' => $validated['note'],
                        'agreement_accepted' => $request->agreement_accepted,
                    ]);

                    $createdRecords[] = $record;

                    Log::info("Stock reserved for bahan {$bahan->nama}: {$validated['quantity']} units (pending approval)");
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
                ->with('success', 'Permintaan berhasil dikirim dan stock telah direservasi. Menunggu persetujuan admin/aslab.');

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
        // Handle composite ID for unified records
        $recordType = 'peminjaman'; // default
        $originalId = $id;

        if (strpos($id, 'peminjaman_') === 0) {
            $originalId = str_replace('peminjaman_', '', $id);
            $recordType = 'peminjaman';
        } elseif (strpos($id, 'penggunaan_') === 0) {
            $originalId = str_replace('penggunaan_', '', $id);
            $recordType = 'penggunaan';
        }

        if ($recordType === 'peminjaman') {
            $record = PeminjamanAset::with(['asetAslab', 'bahan', 'user', 'approvedBy'])->findOrFail($originalId);

            // Check if user can view this record
            if (!in_array(Auth::user()->role, ['admin', 'aslab']) && $record->user_id !== Auth::id()) {
                abort(403);
            }

            // Determine if this is aset or bahan
            if ($record->aset_id && $record->asetAslab) {
                return Inertia::render('peminjaman-barang/show', [
                    'peminjaman' => [
                        'id' => $record->id,
                        'record_type' => 'peminjaman',
                        'nama_peminjam' => $record->user->name,
                        'nama_barang' => $record->asetAslab->nama_aset,
                        'kode_barang' => $record->asetAslab->kode_aset,
                        'tipe_barang' => 'aset',
                        'jumlah' => $record->stok,
                        'tanggal_pinjam' => $record->tanggal_pinjam,
                        'tanggal_kembali' => $record->tanggal_kembali,
                        'target_return_date' => $record->target_return_date,
                        'status' => $record->status,
                        'status_text' => $record->status_text,
                        'keterangan' => $record->keterangan,
                        'approval_note' => $record->approval_note,
                        'approved_by' => $record->approvedBy?->name,
                        'approved_at' => $record->approved_at,
                        'agreement_accepted' => $record->agreement_accepted,
                    ]
                ]);
            } elseif ($record->bahan_id && $record->bahan) {
                return Inertia::render('peminjaman-barang/show', [
                    'peminjaman' => [
                        'id' => $record->id,
                        'record_type' => 'peminjaman',
                        'nama_peminjam' => $record->user->name,
                        'nama_barang' => $record->bahan->nama,
                        'kode_barang' => $record->bahan->kode ?? 'N/A',
                        'tipe_barang' => 'bahan',
                        'jumlah' => $record->stok,
                        'tanggal_pinjam' => $record->tanggal_pinjam,
                        'tanggal_kembali' => null, // Bahan tidak dikembalikan
                        'target_return_date' => null,
                        'status' => $record->status,
                        'status_text' => $record->status_text,
                        'keterangan' => $record->keterangan,
                        'approval_note' => $record->approval_note,
                        'approved_by' => $record->approvedBy?->name,
                        'approved_at' => $record->approved_at,
                        'agreement_accepted' => $record->agreement_accepted,
                    ]
                ]);
            } else {
                abort(404, 'Record tidak ditemukan atau tidak lengkap');
            }
        } else {
            $record = PenggunaanBahan::with(['bahan', 'user', 'approvedBy'])->findOrFail($originalId);

            // Check if user can view this record
            if (!in_array(Auth::user()->role, ['admin', 'aslab']) && $record->user_id !== Auth::id()) {
                abort(403);
            }

            return Inertia::render('peminjaman-barang/show', [
                'peminjaman' => [
                    'id' => $record->id,
                    'record_type' => 'penggunaan',
                    'nama_peminjam' => $record->user->name,
                    'nama_barang' => $record->bahan->nama,
                    'kode_barang' => $record->bahan->kode ?? 'N/A',
                    'tipe_barang' => 'bahan',
                    'jumlah' => $record->jumlah_digunakan,
                    'tanggal_pinjam' => $record->tanggal_penggunaan,
                    'tanggal_kembali' => null, // Bahan tidak dikembalikan
                    'target_return_date' => null,
                    'status' => 'used',
                    'status_text' => 'Digunakan',
                    'keterangan' => $record->keperluan,
                    'approval_note' => $record->catatan,
                    'approved_by' => $record->approvedBy?->name,
                    'approved_at' => $record->approved_at,
                    'agreement_accepted' => true,
                ]
            ]);
        }
    }

    public function approve(Request $request, $id)
    {
        if (!in_array(Auth::user()->role, ['admin', 'aslab'])) {
            abort(403);
        }

        // Handle composite ID for unified records
        $recordType = 'peminjaman'; // default
        $originalId = $id;

        if (strpos($id, 'peminjaman_') === 0) {
            $originalId = str_replace('peminjaman_', '', $id);
            $recordType = 'peminjaman';
        } elseif (strpos($id, 'penggunaan_') === 0) {
            return back()->withErrors(['error' => 'Penggunaan bahan tidak perlu disetujui karena sudah langsung digunakan']);
        }

        $peminjaman = PeminjamanAset::with(['asetAslab', 'bahan'])->findOrFail($originalId);

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
                if ($peminjaman->aset_id) {
                    // ASET: Update peminjaman status to approved
                    $peminjaman->update([
                        'status' => PeminjamanAset::STATUS_APPROVED,
                        'approved_by' => Auth::id(),
                        'approved_at' => now(),
                        'approval_note' => $note,
                    ]);

                    $message = 'Permintaan peminjaman aset disetujui';

                    Log::info("Aset peminjaman approved", [
                        'peminjaman_id' => $peminjaman->id,
                        'user_id' => $peminjaman->user_id,
                        'approved_by' => Auth::id(),
                        'aset_id' => $peminjaman->aset_id,
                        'quantity' => $peminjaman->stok
                    ]);

                } elseif ($peminjaman->bahan_id) {
                    // BAHAN: Convert to penggunaan_bahan and delete from peminjaman_aset
                    $penggunaanBahan = PenggunaanBahan::create([
                        'bahan_id' => $peminjaman->bahan_id,
                        'user_id' => $peminjaman->user_id,
                        'tanggal_penggunaan' => $peminjaman->tanggal_pinjam,
                        'jumlah_digunakan' => $peminjaman->stok,
                        'keperluan' => $peminjaman->keterangan ?: 'Keperluan praktikum/penelitian',
                        'catatan' => "Disetujui oleh admin/aslab pada " . now()->format('d/m/Y H:i') .
                                   ($note ? " - Catatan: {$note}" : ""),
                        'approved_by' => Auth::id(),
                        'approved_at' => now()
                    ]);

                    // Delete the peminjaman record since bahan is now consumed
                    $peminjaman->delete();

                    $message = 'Permintaan penggunaan bahan disetujui dan bahan telah digunakan';

                    Log::info("Bahan usage approved and converted", [
                        'original_peminjaman_id' => $peminjaman->id,
                        'new_penggunaan_id' => $penggunaanBahan->id,
                        'user_id' => $peminjaman->user_id,
                        'approved_by' => Auth::id(),
                        'bahan_id' => $peminjaman->bahan_id,
                        'quantity' => $peminjaman->stok
                    ]);
                }

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

                $message = 'Permintaan ditolak dan stock dikembalikan';

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
                'peminjaman_id' => $originalId,
                'action' => $action
            ]);
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    private function validateItem($item)
    {
        if (!isset($item['item_id'], $item['item_type'], $item['quantity'])) {
            throw new \Exception('Invalid item data');
        }

        if (!in_array($item['item_type'], ['aset', 'bahan'])) {
            throw new \Exception('Invalid item type');
        }

        if ($item['quantity'] <= 0) {
            throw new \Exception('Quantity must be greater than 0');
        }

        // Target return date only required for aset, not for bahan
        if ($item['item_type'] === 'aset') {
            if (!isset($item['target_return_date'])) {
                throw new \Exception('Target return date is required for aset');
            }

            if (Carbon::parse($item['target_return_date'])->isPast()) {
                throw new \Exception('Target return date must be in the future');
            }
        }

        return [
            'item_id' => (int)$item['item_id'],
            'type' => $item['item_type'],
            'quantity' => (int)$item['quantity'],
            'target_return_date' => $item['item_type'] === 'aset' ? $item['target_return_date'] : null,
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

        // Handle composite ID for unified records
        $recordType = 'peminjaman'; // default
        $originalId = $id;

        if (strpos($id, 'peminjaman_') === 0) {
            $originalId = str_replace('peminjaman_', '', $id);
            $recordType = 'peminjaman';
        } elseif (strpos($id, 'penggunaan_') === 0) {
            return back()->withErrors(['error' => 'Bahan yang sudah digunakan tidak bisa dikembalikan']);
        }

        $peminjaman = PeminjamanAset::with(['asetAslab'])->findOrFail($originalId);

        if ($peminjaman->status !== PeminjamanAset::STATUS_APPROVED) {
            return back()->withErrors(['error' => 'Barang ini belum dalam status dipinjam']);
        }

        try {
            // Set transaction isolation level for consistency
            DB::statement('SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ');
            DB::beginTransaction();

            // Return the stock for aset only
            if ($peminjaman->aset_id) {
                $aset = AsetAslab::where('id', $peminjaman->aset_id)
                    ->lockForUpdate()
                    ->first();

                if ($aset) {
                    $aset->increment('stok', $peminjaman->stok);
                    Log::info("Stock returned for aset {$aset->nama_aset}: {$peminjaman->stok} units");
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
            return redirect()->back()->with('success', 'Aset berhasil dikembalikan dan stock sudah diupdate');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Return transaction failed', [
                'error' => $e->getMessage(),
                'peminjaman_id' => $originalId
            ]);
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    // Peminjaman Aset Methods
    public function indexAset()
    {
        $user = Auth::user();

        // Get all peminjaman aset records
        $query = PeminjamanAset::with(['asetAslab', 'user', 'approvedBy'])
            ->whereNotNull('aset_id'); // Only aset, not bahan

        // Filter data based on user role
        if (!in_array($user->role, ['admin', 'aslab'])) {
            $query->where('user_id', $user->id);
        }

        $peminjamanList = $query->latest()->get()->map(function ($peminjaman) {
            return [
                'id' => $peminjaman->id,
                'userName' => $peminjaman->user->name,
                'userRole' => ucfirst($peminjaman->user->role),
                'itemName' => $peminjaman->asetAslab->nama_aset ?? 'N/A',
                'itemCode' => $peminjaman->asetAslab->kode_aset ?? 'N/A',
                'requestDate' => $peminjaman->created_at->format('Y-m-d'),
                'quantity' => $peminjaman->stok,
                'status' => $peminjaman->status,
                'notes' => $peminjaman->keterangan
            ];
        });

        return Inertia::render('peminjaman-aset/index', [
            'peminjamanList' => $peminjamanList,
            'filters' => [
                'search' => request('search'),
                'status' => request('status'),
                'sort' => request('sort')
            ]
        ]);
    }

    public function createAset()
    {
        // Get available aset
        $asets = AsetAslab::where('status', 'baik')
            ->where('stok', '>', 0)
            ->get(['id', 'nama_aset', 'kode_aset', 'stok']);

        return Inertia::render('peminjaman-aset/create', [
            'asets' => $asets
        ]);
    }

    public function storeAset(Request $request)
    {
        $request->validate([
            'aset_id' => 'required|exists:aset_aslabs,id',
            'stok' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            // Check if aset is available
            $aset = AsetAslab::find($request->aset_id);
            if (!$aset || $aset->stok < $request->stok) {
                return back()->withErrors(['stok' => 'Stok tidak mencukupi']);
            }

            // Create peminjaman record
            $peminjaman = PeminjamanAset::create([
                'user_id' => Auth::id(),
                'aset_id' => $request->aset_id,
                'stok' => $request->stok,
                'status' => 'pending',
                'notes' => $request->notes,
                'tanggal_pinjam' => now()
            ]);

            // Create notification for admin/aslab
            NotificationController::createPeminjamanNotification($peminjaman, 'peminjaman_created');

            DB::commit();
            return redirect()->route('peminjaman-aset.index')
                ->with('success', 'Permintaan peminjaman berhasil diajukan');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Aset loan request failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'aset_id' => $request->aset_id
            ]);
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    public function showAset($id)
    {
        $peminjaman = PeminjamanAset::with(['asetAslab', 'user', 'approvedBy'])
            ->where('id', $id)
            ->whereNotNull('aset_id')
            ->firstOrFail();

        return Inertia::render('peminjaman-aset/show', [
            'peminjaman' => [
                'id' => $peminjaman->id,
                'userName' => $peminjaman->user->name,
                'userRole' => ucfirst($peminjaman->user->role),
                'itemName' => $peminjaman->asetAslab->nama_aset,
                'itemCode' => $peminjaman->asetAslab->kode_aset,
                'requestDate' => $peminjaman->created_at->format('Y-m-d H:i'),
                'quantity' => $peminjaman->stok,
                'status' => $peminjaman->status,
                'notes' => $peminjaman->notes,
                'approvedBy' => $peminjaman->approvedBy ? $peminjaman->approvedBy->name : null,
                'approvedAt' => $peminjaman->approved_at ? $peminjaman->approved_at->format('Y-m-d H:i') : null
            ]
        ]);
    }

    public function approveAset(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500'
        ]);

        try {
            DB::beginTransaction();

            $peminjaman = PeminjamanAset::findOrFail($id);

            if ($peminjaman->status !== 'pending') {
                return back()->withErrors(['error' => 'Peminjaman sudah diproses sebelumnya']);
            }

            // Check stock availability
            $aset = $peminjaman->asetAslab;
            if ($aset->stok < $peminjaman->stok) {
                return back()->withErrors(['error' => 'Stok tidak mencukupi']);
            }

            // Update peminjaman status
            $peminjaman->update([
                'status' => 'approved',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'admin_notes' => $request->notes
            ]);

            // Reduce stock
            $aset->decrement('stok', $peminjaman->stok);

            // Create notification for user
            NotificationController::createPeminjamanNotification($peminjaman, 'peminjaman_approved');

            DB::commit();
            return redirect()->back()->with('success', 'Peminjaman berhasil disetujui');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Aset loan approval failed', [
                'error' => $e->getMessage(),
                'peminjaman_id' => $id
            ]);
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    public function rejectAset(Request $request, $id)
    {
        $request->validate([
            'notes' => 'required|string|max:500'
        ]);

        try {
            $peminjaman = PeminjamanAset::findOrFail($id);

            if ($peminjaman->status !== 'pending') {
                return back()->withErrors(['error' => 'Peminjaman sudah diproses sebelumnya']);
            }

            // Update peminjaman status
            $peminjaman->update([
                'status' => 'rejected',
                'approved_by' => Auth::id(),
                'approved_at' => now(),
                'admin_notes' => $request->notes
            ]);

            // Create notification for user
            NotificationController::createPeminjamanNotification($peminjaman, 'peminjaman_rejected');

            return redirect()->back()->with('success', 'Peminjaman berhasil ditolak');

        } catch (\Exception $e) {
            Log::error('Aset loan rejection failed', [
                'error' => $e->getMessage(),
                'peminjaman_id' => $id
            ]);
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }
}
