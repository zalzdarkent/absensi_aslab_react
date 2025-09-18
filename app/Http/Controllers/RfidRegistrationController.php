<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RfidRegistrationController extends Controller
{
    /**
     * Show RFID registration page
     */
    public function index(): Response
    {
        $users = User::where('role', 'aslab')
                    ->select('id', 'name', 'email', 'prodi', 'semester', 'rfid_code', 'is_active')
                    ->orderBy('name')
                    ->get();

        return Inertia::render('rfid-registration', [
            'users' => $users
        ]);
    }

    /**
     * Register RFID from web form
     */
    public function store(Request $request)
    {
        $request->validate([
            'rfid_code' => 'required|string',
            'user_id' => 'required|exists:users,id',
        ]);

        $rfidCode = strtoupper($request->input('rfid_code'));
        $userId = $request->input('user_id');

        // Check if RFID is already registered
        $existingUser = User::where('rfid_code', $rfidCode)->first();
        if ($existingUser) {
            return back()->withErrors([
                'rfid_code' => 'RFID sudah terdaftar untuk user: ' . $existingUser->name
            ]);
        }

        // Check if user already has RFID
        $user = User::findOrFail($userId);
        if ($user->rfid_code) {
            return back()->withErrors([
                'user_id' => 'User sudah memiliki RFID terdaftar'
            ]);
        }

        // Update user with RFID code
        $user->update(['rfid_code' => $rfidCode]);

        return back()->with('success', "RFID berhasil didaftarkan untuk {$user->name}");
    }
}
