<?php

namespace App\Repositories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class ProjectRepository
{
    protected function ownedBy(User $user): Builder
    {
        return Project::query()->where('user_id', $user->id);
    }

    public function statusCounts(User $user): array
    {
        return $this->ownedBy($user)->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status')->all();
    }
}
