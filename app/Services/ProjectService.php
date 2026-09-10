<?php

namespace App\Services;

use App\constants\ProjectConstants;
use App\Models\Project;
use App\Models\User;
use App\Repositories\ProjectRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProjectService
{
    public function __construct(private ProjectRepository $projects) {}

    public function list(User $user, array $filters): LengthAwarePaginator
    {
        return $this->projects->paginate($user, $filters);
    }

    public function find(User $user, int $id): Project
    {
        return $this->projects->findOwned($user, $id);
    }

    public function create(User $user, array $attributes): Project
    {
        return $this->projects->create($user, $attributes);
    }

    public function update(User $user, int $id, array $attributes): Project
    {
        return $this->projects->update($this->find($user, $id), $attributes);
    }

    public function delete(User $user, int $id): void
    {
        $this->projects->delete($this->find($user, $id));
    }

    /**
     * @return Collection<int, Project>
     */
    public function clients(User $user): Collection
    {
        return $this->projects->clientSummaries($user);
    }

    public function summary(User $user): array
    {
        $counts = $this->projects->statusCounts($user);

        return [
            'total' => array_sum($counts),
            'in_progress' => (int) ($counts[ProjectConstants::STATUS_IN_PROGRESS] ?? 0),
            'on_hold' => (int) ($counts[ProjectConstants::STATUS_ON_HOLD] ?? 0),
            'completed' => (int) ($counts[ProjectConstants::STATUS_COMPLETED] ?? 0),
        ];
    }
}
