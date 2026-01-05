<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $roles = Role::orderBy('name')->get();

        return Inertia::render('RoleManagement/Index', [
            'roles' => $roles
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
        ]);

        Role::create(['name' => $request->name]);

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $role = Role::findById($id);

        $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('roles', 'name')->ignore($role->id)],
        ]);

        $role->update(['name' => $request->name]);

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $role = Role::findById($id);
        
        // Prevent deleting critical roles
        if (in_array($role->name, ['admin', 'aslab', 'mahasiswa', 'dosen'])) {
             return redirect()->back()->with('error', 'Cannot delete system roles.');
        }

        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }
}
