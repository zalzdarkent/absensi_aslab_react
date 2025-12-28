<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Define permissions group by category
        $permissions = [
            'dashboard' => [
                'view_dashboard',
            ],
            'attendance' => [
                'view_attendance',
                'view_attendance_history',
                'view_picket_schedule',
                'scan_attendance',
            ],
            'assets' => [
                'view_assets',
                'manage_assets', // includes create, edit, delete
            ],
            'loans' => [
                'view_loans',
                'approve_loans',
            ],
            'users' => [
                'view_users',
                'manage_users', // includes create, edit, delete
            ],
            'roles' => [
                'manage_roles',
            ],
        ];

        foreach ($permissions as $group => $perms) {
            foreach ($perms as $permission) {
                Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
            }
        }

        // Assign all permissions to admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // Define default permissions for other roles (but DO NOT assign to the Role model itself)
        // We want granular control, so we assign these to Users directly.
        $roleDefaults = [
            'aslab' => [
                'view_dashboard',
                'view_attendance',
                'view_attendance_history',
                'view_picket_schedule',
                'view_assets',
                'manage_assets',
                'view_loans',
                'approve_loans',
                'view_users',
            ],
            'mahasiswa' => [
                'view_dashboard',
                'view_picket_schedule',
                'view_loans',
            ],
            'dosen' => [
                'view_dashboard',
                'view_attendance_history',
            ],
        ];

        // Ensure roles exist but have NO permissions (so we can selectively revoke per user)
        foreach (array_keys($roleDefaults) as $roleName) {
            $role = Role::firstOrCreate(['name' => $roleName]);
            $role->syncPermissions([]); // Clear any existing permissions on the role
        }

        // Migrate existing users: If they have a role but no direct permissions, give them defaults
        $users = \App\Models\User::all();
        foreach ($users as $user) {
            if ($user->hasRole('admin')) continue;

            foreach ($roleDefaults as $roleName => $perms) {
                if ($user->hasRole($roleName)) {
                    // Only assign if user doesn't have them yet (avoid overwriting custom setups if run multiple times)
                    // But for first migration, we might want to ensure they have them.
                    // Let's just sync defaults if they have ZERO direct permissions.
                    if ($user->permissions->isEmpty()) {
                        $user->syncPermissions($perms);
                    }
                }
            }
        }
    }
}
