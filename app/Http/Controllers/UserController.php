<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            $search = $request->get('search');
            $role = $request->get('role');

            $query = User::query()
                ->when($search, function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('rfid_code', 'like', "%{$search}%");
                })
                ->when($role, function ($q) use ($role) {
                    $q->where('role', $role);
                })
                ->orderBy('name');

            $users = $query->get();

            $roles = ['admin', 'aslab', 'mahasiswa', 'dosen'];

            return Inertia::render('kelola-user/index', [
                'users' => $users,
                'roles' => $roles,
                'filters' => [
                    'search' => $search,
                    'role' => $role,
                ],
                'success' => session('success'),
            ]);
        } catch (\Exception $e) {
            Log::error('UserController@index error: ' . $e->getMessage());
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
        $roles = ['admin', 'aslab', 'mahasiswa', 'dosen'];
        return Inertia::render('kelola-user/create', [
            'roles' => $roles,
            'availablePermissions' => $this->getGroupedPermissions(),
            'success' => session('success'),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,aslab,mahasiswa,dosen',
            'prodi' => 'nullable|string|max:255',
            'semester' => 'nullable|integer|min:1|max:14',
            'rfid_code' => 'nullable|string|max:255|unique:users,rfid_code',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'prodi' => $request->prodi,
            'semester' => $request->semester,
            'rfid_code' => $request->rfid_code,
            'is_active' => true,
        ]);

        // Assign Spatie Role
        $user->assignRole($request->role);

        // Sync extra permissions
        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions);
        }

        return redirect()->route('kelola-user.index')
                        ->with('success', 'User berhasil ditambahkan!');
    }

    public function show(User $user)
    {
        return Inertia::render('kelola-user/show', [
            'user' => $user->load('permissions'),
            'success' => session('success'),
        ]);
    }

    public function edit(User $user)
    {
        $roles = ['admin', 'aslab', 'mahasiswa', 'dosen'];
        return Inertia::render('kelola-user/edit', [
            'user' => $user->load('permissions'),
            'roles' => $roles,
            'availablePermissions' => $this->getGroupedPermissions(),
            'currentPermissions' => $user->permissions->pluck('name'),
            'success' => session('success'),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'role' => 'required|string|in:admin,aslab,mahasiswa,dosen',
            'prodi' => 'nullable|string|max:255',
            'semester' => 'nullable|integer|min:1|max:14',
            'rfid_code' => ['nullable', 'string', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $updateData = [
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'prodi' => $request->prodi,
            'semester' => $request->semester,
            'rfid_code' => $request->rfid_code,
        ];

        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);

        // Sync Spatie Role
        $user->syncRoles([$request->role]);

        // Sync permissions
        if ($request->has('permissions')) {
            $user->syncPermissions($request->permissions);
        }

        return redirect()->route('kelola-user.index')
                        ->with('success', 'User berhasil diperbarui!');
    }

    public function destroy(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Tidak dapat menghapus akun sendiri!');
        }

        $user->delete();

        return redirect()->route('kelola-user.index')
                        ->with('success', 'User berhasil dihapus!');
    }

    public function toggleStatus(User $user)
    {
        $user->update([
            'is_active' => !$user->is_active
        ]);

        $status = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "User berhasil {$status}!");
    }
}
