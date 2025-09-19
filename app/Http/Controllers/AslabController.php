<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AslabController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->get('search');
            $prodi = $request->get('prodi');

            $query = User::where('role', 'aslab')
                ->when($search, function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('rfid_code', 'like', "%{$search}%");
                })
                ->when($prodi, function ($q) use ($prodi) {
                    $q->where('prodi', $prodi);
                })
                ->orderBy('name');

            $aslabs = $query->get();

            $prodis = User::where('role', 'aslab')
                         ->distinct()
                         ->pluck('prodi')
                         ->filter()
                         ->sort()
                         ->values();

            return Inertia::render('aslabs/index', [
                'aslabs' => $aslabs,
                'prodis' => $prodis,
                'filters' => [
                    'search' => $search,
                    'prodi' => $prodi,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('AslabController@index error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function create()
    {
        return Inertia::render('aslabs/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'prodi' => 'required|string|max:255',
            'semester' => 'required|integer|min:1|max:14',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'prodi' => $request->prodi,
            'semester' => $request->semester,
            'role' => 'aslab',
            'is_active' => true,
        ]);

        return redirect()->route('aslabs.index')
                        ->with('success', 'Aslab berhasil ditambahkan');
    }

    public function show(Request $request, User $aslab)
    {
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        // Get attendance statistics
        $totalDays = $aslab->attendances()
                          ->distinct('date')
                          ->count();

        $thisMonthAttendance = $aslab->attendances()
                                   ->whereMonth('date', $month)
                                   ->whereYear('date', $year)
                                   ->distinct('date')
                                   ->count();

        $recentAttendances = $aslab->attendances()
                                  ->whereMonth('date', $month)
                                  ->whereYear('date', $year)
                                  ->orderBy('date', 'desc')
                                  ->orderBy('timestamp', 'desc')
                                  ->get();

        return Inertia::render('aslabs/show', [
            'aslab' => $aslab,
            'stats' => [
                'total_days' => $totalDays,
                'this_month' => $thisMonthAttendance,
            ],
            'recent_attendances' => $recentAttendances,
        ]);
    }

    public function edit(User $aslab)
    {
        return Inertia::render('aslabs/edit', [
            'aslab' => $aslab,
        ]);
    }

    public function update(Request $request, User $aslab)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $aslab->id,
            'rfid_code' => 'required|string|unique:users,rfid_code,' . $aslab->id,
            'prodi' => 'required|string|max:255',
            'semester' => 'required|integer|min:1|max:14',
            'is_active' => 'boolean',
        ]);

        $aslab->update([
            'name' => $request->name,
            'email' => $request->email,
            'rfid_code' => $request->rfid_code,
            'prodi' => $request->prodi,
            'semester' => $request->semester,
            'is_active' => $request->boolean('is_active'),
        ]);

        // Update password if provided
        if ($request->filled('password')) {
            $request->validate(['password' => 'string|min:8']);
            $aslab->update(['password' => Hash::make($request->password)]);
        }

        return redirect()->route('aslabs.index')
                        ->with('success', 'Data aslab berhasil diperbarui');
    }

    public function destroy(User $aslab)
    {
        $aslab->delete();

        return redirect()->route('aslabs.index')
                        ->with('success', 'Aslab berhasil dihapus');
    }

    public function toggleStatus(User $aslab)
    {
        $aslab->update([
            'is_active' => !$aslab->is_active
        ]);

        $status = $aslab->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Aslab berhasil {$status}");
    }
}
