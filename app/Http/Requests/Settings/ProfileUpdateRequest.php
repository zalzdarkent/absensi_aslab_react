<?php

namespace App\Http\Requests\Settings;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],

            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore(Auth::user()->id),
            ],

            'rfid_code' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique(User::class)->ignore(Auth::user()->id),
            ],

            'prodi' => ['nullable', 'string', 'max:255'],

            'semester' => ['nullable', 'integer', 'min:1', 'max:14'],

            // Role, piket_day, dan is_active tidak bisa diubah oleh user
            // Hanya admin yang bisa mengubah field ini
        ];
    }
}
