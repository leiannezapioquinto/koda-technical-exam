<?php

namespace App\Services;

use App\constants\ProjectConstants;
use App\Models\User;
use App\Repositories\ProjectRepository;

class ProjectService
{
    public function __construct(private ProjectRepository $projects) {}

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
