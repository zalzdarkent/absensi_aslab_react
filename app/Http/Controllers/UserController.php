<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
            ]);
        } catch (\Exception $e) {
            Log::error('UserController@index error: ' . $e->getMessage());
            return back()->with('error', 'Terjadi kesalahan: ' . $e->getMessage());
        }
    }

    public function create()
    {
        $roles = ['admin', 'aslab', 'mahasiswa', 'dosen'];
        return Inertia::render('kelola-user/create', [
            'roles' => $roles
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
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'prodi' => $request->prodi,
            'semester' => $request->semester,
            'rfid_code' => $request->rfid_code,
            'is_active' => true,
        ]);

        return redirect()->route('kelola-user.index')
                        ->with('success', 'User berhasil ditambahkan!');
    }

    public function show(User $user)
    {
        return Inertia::render('kelola-user/show', [
            'user' => $user
        ]);
    }

    public function edit(User $user)
    {
        $roles = ['admin', 'aslab', 'mahasiswa', 'dosen'];
        return Inertia::render('kelola-user/edit', [
            'user' => $user,
            'roles' => $roles
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

        return redirect()->route('kelola-user.index')
                        ->with('success', 'User berhasil diperbarui!');
    }

    public function destroy(User $user)
    {
        // Prevent admin from deleting themselves
        if ($user->id === auth()->id()) {
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
