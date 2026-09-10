<?php

namespace App\Http\Requests;

use App\constants\AppConstants;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends LoginRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:'.AppConstants::NAME_MAX_LENGTH],
            'email' => ['required', 'email', 'max:'.AppConstants::NAME_MAX_LENGTH, 'unique:users,email'],
            'password' => ['required', 'string', 'max:255', 'confirmed', Password::min(AppConstants::MIN_PASSWORD_LENGTH)->letters()->numbers()],
        ];
    }
}
