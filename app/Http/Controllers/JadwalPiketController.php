<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JadwalPiketController extends Controller
{
    public function index()
    {
        $aslabs = User::where('role', 'aslab')
                     ->where('is_active', true)
                     ->orderBy('piket_day')
                     ->orderBy('name')
                     ->get();

        // Group by piket_day
        $jadwalPiket = [
            'senin' => $aslabs->where('piket_day', 'senin')->values(),
            'selasa' => $aslabs->where('piket_day', 'selasa')->values(),
            'rabu' => $aslabs->where('piket_day', 'rabu')->values(),
            'kamis' => $aslabs->where('piket_day', 'kamis')->values(),
            'jumat' => $aslabs->where('piket_day', 'jumat')->values(),
        ];

        $stats = [
            'total_aslab' => $aslabs->count(),
            'assigned' => $aslabs->whereNotNull('piket_day')->count(),
            'unassigned' => $aslabs->whereNull('piket_day')->count(),
        ];

        return Inertia::render('jadwal-piket/index', [
            'jadwalPiket' => $jadwalPiket,
            'allAslabs' => $aslabs,
            'stats' => $stats,
        ]);
    }

    public function generateAuto()
    {
        try {
            DB::beginTransaction();

            // Reset semua jadwal piket
            User::where('role', 'aslab')->update(['piket_day' => null]);

            // Ambil semua aslab aktif
            $aslabs = User::where('role', 'aslab')
                         ->where('is_active', true)
                         ->get()
                         ->shuffle(); // Random order

            $days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat'];
            $dayIndex = 0;

            foreach ($aslabs as $aslab) {
                $aslab->update(['piket_day' => $days[$dayIndex]]);
                $dayIndex = ($dayIndex + 1) % count($days);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Jadwal piket berhasil di-generate secara otomatis!');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal generate jadwal: ' . $e->getMessage());
        }
    }

    public function updateManual(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'piket_day' => 'nullable|in:senin,selasa,rabu,kamis,jumat',
        ]);

        try {
            $user = User::findOrFail($request->user_id);
            $user->update(['piket_day' => $request->piket_day]);

            return redirect()->back()->with('success', 'Jadwal piket berhasil diupdate!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal update jadwal: ' . $e->getMessage());
        }
    }

    public function swapSchedule(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'new_piket_day' => 'required|in:senin,selasa,rabu,kamis,jumat',
        ]);

        try {
            DB::beginTransaction();

            $user = User::findOrFail($request->user_id);
            $oldDay = $user->piket_day;
            $newDay = $request->new_piket_day;

            // Update jadwal piket user
            $user->update(['piket_day' => $newDay]);

            DB::commit();

            return redirect()->back()->with('success', "Jadwal piket {$user->name} berhasil diubah dari {$oldDay} ke {$newDay}!");
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->with('error', 'Gagal mengubah jadwal: ' . $e->getMessage());
        }
    }

    public function reset()
    {
        try {
            User::where('role', 'aslab')->update(['piket_day' => null]);
            return redirect()->back()->with('success', 'Semua jadwal piket berhasil direset!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal reset jadwal: ' . $e->getMessage());
        }
    }
}
