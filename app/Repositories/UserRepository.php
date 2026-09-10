<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    public function create(array $attributes): User
    {
        return User::create($attributes);
    }
}
