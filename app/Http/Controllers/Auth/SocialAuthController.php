<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
    public function handleGoogleCallback(): RedirectResponse|Response
    {
        try {
            $googleUser = Socialite::driver('google')->user();

            // Check if user already exists
            $user = User::where('email', $googleUser->email)
                ->orWhere('google_id', $googleUser->id)
                ->first();

            if ($user) {
                // Update existing user with Google info if not already linked
                if (!$user->google_id) {
                    $user->update([
                        'google_id' => $googleUser->id,
                        'avatar' => $googleUser->avatar,
                        'email_verified_at' => $user->email_verified_at ?? now(),
                    ]);
                }

                // Login the user
                Auth::login($user, true);

                return redirect()->intended(route('dashboard', absolute: false));
            }

            // New user - store data in session and redirect to role selection
            session([
                'google_user' => [
                    'google_id' => $googleUser->id,
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'avatar' => $googleUser->avatar,
                ]
            ]);

            return redirect()->route('auth.google.select-role');

        } catch (\Exception $e) {
            return redirect()->route('login')
                ->with('error', 'Terjadi kesalahan saat login dengan Google. Silakan coba lagi.');
        }
    }

    /**
     * Show the role selection page for new Google users.
     */
    public function showRoleSelection(): Response|RedirectResponse
    {
        if (!session()->has('google_user')) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/select-role', [
            'userName' => session('google_user.name'),
        ]);
    }

    /**
     * Complete the registration with selected role.
     */
    public function completeRegistration(Request $request): RedirectResponse
    {
        if (!session()->has('google_user')) {
            return redirect()->route('login');
        }

        $request->validate([
            'role' => 'required|in:mahasiswa,dosen',
        ]);

        $googleUser = session('google_user');

        // Create new user
        $user = User::create([
            'google_id' => $googleUser['google_id'],
            'name' => $googleUser['name'],
            'email' => $googleUser['email'],
            'avatar' => $googleUser['avatar'],
            'email_verified_at' => now(),
            'role' => $request->role,
            'is_active' => true,
            'password' => null, // OAuth users don't need password
        ]);

        // Clear session data
        session()->forget('google_user');

        // Login the user
        Auth::login($user, true);

        return redirect()->route('dashboard')
            ->with('success', 'Akun berhasil dibuat! Selamat datang, ' . $user->name);
    }

    /**
     * Redirect the user to the GitHub authentication page.
     */
    public function redirectToGithub(): RedirectResponse
    {
        return Socialite::driver('github')->redirect();
    }

    /**
     * Obtain the user information from GitHub.
     */
    public function handleGithubCallback(): RedirectResponse|Response
    {
        try {
            $githubUser = Socialite::driver('github')->user();

            // Check if user already exists
            $user = User::where('email', $githubUser->email)
                ->orWhere('github_id', $githubUser->id)
                ->first();

            if ($user) {
                // Update existing user with GitHub info if not already linked
                if (!$user->github_id) {
                    $user->update([
                        'github_id' => $githubUser->id,
                        'avatar' => $githubUser->avatar,
                        'email_verified_at' => $user->email_verified_at ?? now(),
                    ]);
                }

                // Login the user
                Auth::login($user, true);

                return redirect()->intended(route('dashboard', absolute: false));
            }

            // New user - store data in session and redirect to role selection
            session([
                'github_user' => [
                    'github_id' => $githubUser->id,
                    'name' => $githubUser->name ?? $githubUser->nickname,
                    'email' => $githubUser->email,
                    'avatar' => $githubUser->avatar,
                ]
            ]);

            return redirect()->route('auth.github.select-role');

        } catch (\Exception $e) {
            return redirect()->route('login')
                ->with('error', 'Terjadi kesalahan saat login dengan GitHub. Silakan coba lagi.');
        }
    }

    /**
     * Show the role selection page for new GitHub users.
     */
    public function showGithubRoleSelection(): Response|RedirectResponse
    {
        if (!session()->has('github_user')) {
            return redirect()->route('login');
        }

        return Inertia::render('auth/select-role', [
            'userName' => session('github_user.name'),
            'provider' => 'github',
        ]);
    }

    /**
     * Complete the registration with selected role for GitHub users.
     */
    public function completeGithubRegistration(Request $request): RedirectResponse
    {
        if (!session()->has('github_user')) {
            return redirect()->route('login');
        }

        $request->validate([
            'role' => 'required|in:mahasiswa,dosen',
        ]);

        $githubUser = session('github_user');

        // Create new user
        $user = User::create([
            'github_id' => $githubUser['github_id'],
            'name' => $githubUser['name'],
            'email' => $githubUser['email'],
            'avatar' => $githubUser['avatar'],
            'email_verified_at' => now(),
            'role' => $request->role,
            'is_active' => true,
            'password' => null, // OAuth users don't need password
        ]);

        // Clear session data
        session()->forget('github_user');

        // Login the user
        Auth::login($user, true);

        return redirect()->route('dashboard')
            ->with('success', 'Akun berhasil dibuat! Selamat datang, ' . $user->name);
    }
}
