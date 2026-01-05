<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

        return Inertia::render('jadwal-piket/index', [
            'allAslabs' => $aslabs,
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
            'new_piket_day' => 'nullable|in:senin,selasa,rabu,kamis,jumat',
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

    public function batchUpdate(Request $request)
    {
        // Debug logging
        Log::info('Batch update request received', [
            'data' => $request->all()
        ]);

        $request->validate([
            'updates' => 'required|array|min:1',
            'updates.*.user_id' => 'required|exists:users,id',
            'updates.*.new_piket_day' => 'nullable|in:senin,selasa,rabu,kamis,jumat',
        ]);

        try {
            DB::beginTransaction();

            $updatedCount = 0;
            foreach ($request->updates as $update) {
                $user = User::findOrFail($update['user_id']);
                $user->update(['piket_day' => $update['new_piket_day']]);
                $updatedCount++;
            }

            DB::commit();

            Log::info('Batch update successful', [
                'updated_count' => $updatedCount
            ]);

            return redirect()->back()->with('success', "{$updatedCount} jadwal piket berhasil diupdate!");
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Batch update failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Gagal update jadwal: ' . $e->getMessage());
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

    public function standaloneView($rfidCode)
    {
        $user = User::where('rfid_code', $rfidCode)->firstOrFail();
        
        // Get colleagues on the same day
        $colleagues = [];
        if ($user->piket_day) {
            $colleagues = User::where('piket_day', $user->piket_day)
                ->where('id', '!=', $user->id)
                ->where('role', 'aslab')
                ->where('is_active', true)
                ->get();
        }

        return Inertia::render('jadwal-piket/standalone', [
            'user' => $user,
            'colleagues' => $colleagues,
        ]);
    }
}
