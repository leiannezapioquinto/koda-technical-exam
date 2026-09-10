<?php

namespace App\Http\Requests;

use App\constants\AppConstants;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->email)) {
            $this->merge(['email' => mb_strtolower(trim($this->email))]);
        }
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:'.AppConstants::NAME_MAX_LENGTH],
            'password' => ['required', 'string', 'max:255'],
        ];
    }
}
