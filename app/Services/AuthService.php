<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private UserRepository $users) {}

    public function register(array $attributes): User
    {
        $user = $this->users->create($attributes);
        Auth::login($user);

        return $user;
    }

    public function login(array $credentials): User
    {
        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages(['email' => 'The email or password is incorrect.']);
        }

        return Auth::user();
    }

    public function logout(): void
    {
        Auth::logout();
    }
}
