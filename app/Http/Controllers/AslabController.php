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

    private function getGroupedPermissions()
    {
        $permissions = \Spatie\Permission\Models\Permission::all();
        $grouped = [];
        
        foreach ($permissions as $permission) {
            // Skip dashboard permission as it's available to everyone
            if ($permission->name === 'view_dashboard') continue;

            $parts = explode('_', $permission->name, 2);
            $group = count($parts) > 1 ? $parts[1] : 'others';
            // Custom grouping adjustments
            if (str_contains($permission->name, 'attendance') || str_contains($permission->name, 'picket')) $group = 'attendance';
            
            $grouped[$group][] = $permission;
        }
        
        return $grouped;
    }

    public function create()
    {
        return Inertia::render('aslabs/create', [
            'availablePermissions' => $this->getGroupedPermissions(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'prodi' => 'required|string|max:255',
            'semester' => 'required|integer|min:1|max:14',
            'rfid_code' => 'nullable|string|max:255|unique:users,rfid_code',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'prodi' => $request->prodi,
            'semester' => $request->semester,
            'rfid_code' => $request->rfid_code,
            'role' => 'aslab',
            'is_active' => true,
        ]);

        // Assign Spatie Role
        $user->assignRole('aslab');

        // Sync extra permissions
        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions);
        }

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
            'aslab' => $aslab->load('permissions'),
            'availablePermissions' => $this->getGroupedPermissions(),
            'currentPermissions' => $aslab->permissions->pluck('name'),
        ]);
    }

    public function update(Request $request, User $aslab)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $aslab->id,
            'rfid_code' => 'nullable|string|max:255|unique:users,rfid_code,' . $aslab->id,
            'prodi' => 'required|string|max:255',
            'semester' => 'required|integer|min:1|max:14',
            'is_active' => 'boolean',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
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

        // Sync permissions
        if ($request->has('permissions')) {
            $aslab->syncPermissions($request->permissions);
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
